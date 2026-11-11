package repositories

import (
	"errors"
	"goravel/app/models"
	"goravel/pkg/db"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
	"time"
)

var ErrConversationNotFound = errors.New("conversation not found")

type MessageRepository interface {
	GetConversations(userID int64) ([]models.Conversation, error)
	GetMessages(convID, userID, beforeID int64) ([]models.Message, error)
	SendMessage(senderID, receiverID int64, content string) (models.Message, error)
	SendRichMessage(receiverID int64, draft models.Message) (models.Message, error)
	MarkAsRead(convID, userID int64) error
	DeleteHistory(userID, peerID int64) error
}

type MessageRepositoryImpl struct{}

func (r *MessageRepositoryImpl) DeleteHistory(userID, peerID int64) error {
	return db.DB.Transaction(func(tx *gorm.DB) error {
		var conv models.Conversation
		err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("(user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)", userID, peerID, peerID, userID).First(&conv).Error
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil
		}
		if err != nil {
			return err
		}
		var lastID int64
		if err := tx.Model(&models.Message{}).Where("conversation_id = ?", conv.ID).Select("COALESCE(MAX(id), 0)").Scan(&lastID).Error; err != nil {
			return err
		}
		setting := models.ConversationSetting{UserID: userID, PeerID: peerID, DeletedThroughID: lastID, Hidden: true}
		if err := tx.Clauses(clause.OnConflict{Columns: []clause.Column{{Name: "user_id"}, {Name: "peer_id"}}, DoUpdates: clause.AssignmentColumns([]string{"deleted_through_id", "hidden"})}).Create(&setting).Error; err != nil {
			return err
		}
		return tx.Where("user_id = ? AND entity_type = ? AND entity_id = ?", userID, "conversation", conv.ID).Delete(&models.Notification{}).Error
	})
}

func NewMessageRepository() MessageRepository {
	return &MessageRepositoryImpl{}
}

func (r *MessageRepositoryImpl) GetConversations(userID int64) ([]models.Conversation, error) {
	var convs []models.Conversation
	err := db.DB.Preload("User1").Preload("User2").
		Select("conversations.*").
		Joins("LEFT JOIN conversation_settings AS settings ON settings.user_id = ? AND settings.peer_id = CASE WHEN conversations.user1_id = ? THEN conversations.user2_id ELSE conversations.user1_id END", userID, userID).
		Where("(user1_id = ? OR user2_id = ?)", userID, userID).
		Where("COALESCE(settings.hidden, false) = false OR EXISTS (SELECT 1 FROM messages WHERE messages.conversation_id = conversations.id AND messages.id > settings.deleted_through_id)").
		Order("conversations.updated_at desc").
		Limit(100).
		Find(&convs).Error
	if err != nil {
		return nil, err
	}
	if len(convs) > 0 {
		var settings []models.ConversationSetting
		if err := db.DB.Where("user_id = ?", userID).Find(&settings).Error; err != nil {
			return nil, err
		}
		byPeer := make(map[int64]models.ConversationSetting, len(settings))
		for _, setting := range settings {
			byPeer[setting.PeerID] = setting
		}
		conversationIDs := make([]int64, 0, len(convs))
		for i := range convs {
			conversationIDs = append(conversationIDs, convs[i].ID)
		}
		lastMessages := make([]models.Message, 0, len(convs))
		latestIDs := db.DB.Model(&models.Message{}).
			Select("MAX(id)").
			Where("conversation_id IN ?", conversationIDs).
			Group("conversation_id")
		if err := db.DB.Preload("Sender").Where("id IN (?)", latestIDs).Find(&lastMessages).Error; err != nil {
			return nil, err
		}
		lastByConversation := make(map[int64]models.Message, len(lastMessages))
		for _, message := range lastMessages {
			lastByConversation[message.ConversationID] = message
		}

		// Unread counts per conversation
		type unreadRow struct {
			ConversationID int64
			Count          int64
		}
		var unreadRows []unreadRow
		_ = db.DB.Model(&models.Message{}).
			Select("conversation_id, COUNT(*) as count").
			Where("conversation_id IN ? AND sender_id <> ? AND is_read = ?", conversationIDs, userID, false).
			Group("conversation_id").
			Scan(&unreadRows).Error
		unreadByConv := make(map[int64]int64, len(unreadRows))
		for _, row := range unreadRows {
			unreadByConv[row.ConversationID] = row.Count
		}

		// Conversations containing shop messages
		var shopConvIDs []int64
		_ = db.DB.Model(&models.Message{}).
			Distinct("conversation_id").
			Where("conversation_id IN ? AND message_type = ?", conversationIDs, "shop").
			Pluck("conversation_id", &shopConvIDs).Error
		shopSet := make(map[int64]bool, len(shopConvIDs))
		for _, id := range shopConvIDs {
			shopSet[id] = true
		}

		for i := range convs {
			if message, ok := lastByConversation[convs[i].ID]; ok {
				convs[i].Messages = []models.Message{message}
			} else {
				convs[i].Messages = []models.Message{}
			}
			convs[i].UnreadCount = unreadByConv[convs[i].ID]
			convs[i].HasShopMessage = shopSet[convs[i].ID]
			peerID := convs[i].User1ID
			if peerID == userID {
				peerID = convs[i].User2ID
			}
			setting := byPeer[peerID]
			convs[i].Muted, convs[i].Nickname = setting.Muted, setting.Nickname
			if setting.DeletedThroughID > 0 {
				if len(convs[i].Messages) > 0 && convs[i].Messages[0].ID <= setting.DeletedThroughID {
					convs[i].Messages = []models.Message{}
				}
				if err := db.DB.Model(&models.Message{}).Where("conversation_id = ? AND id > ? AND sender_id <> ? AND is_read = ?", convs[i].ID, setting.DeletedThroughID, userID, false).Count(&convs[i].UnreadCount).Error; err != nil {
					return nil, err
				}
				var visibleShop int64
				if err := db.DB.Model(&models.Message{}).Where("conversation_id = ? AND id > ? AND message_type = ?", convs[i].ID, setting.DeletedThroughID, "shop").Count(&visibleShop).Error; err != nil {
					return nil, err
				}
				convs[i].HasShopMessage = visibleShop > 0
			}
		}
	}
	for i := range convs {
		convs[i].User1.HidePrivateData()
		convs[i].User2.HidePrivateData()
		for j := range convs[i].Messages {
			convs[i].Messages[j].Sender.HidePrivateData()
		}
	}
	return convs, err
}

func (r *MessageRepositoryImpl) GetMessages(convID, userID, beforeID int64) ([]models.Message, error) {
	var conv models.Conversation
	if err := db.DB.
		Where("id = ? AND (user1_id = ? OR user2_id = ?)", convID, userID, userID).
		First(&conv).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrConversationNotFound
		}
		return nil, err
	}
	peerID := conv.User1ID
	if peerID == userID {
		peerID = conv.User2ID
	}
	var setting models.ConversationSetting
	if err := db.DB.Where("user_id = ? AND peer_id = ?", userID, peerID).Find(&setting).Error; err != nil {
		return nil, err
	}

	var msgs []models.Message
	query := db.DB.Preload("Sender").Where("conversation_id = ? AND id > ?", convID, setting.DeletedThroughID)
	if beforeID > 0 {
		query = query.Where("id < ?", beforeID)
	}
	err := query.Order("id desc").Limit(100).Find(&msgs).Error
	for left, right := 0, len(msgs)-1; left < right; left, right = left+1, right-1 {
		msgs[left], msgs[right] = msgs[right], msgs[left]
	}
	for i := range msgs {
		msgs[i].Sender.HidePrivateData()
	}
	return msgs, err
}

func (r *MessageRepositoryImpl) SendMessage(senderID, receiverID int64, content string) (models.Message, error) {
	return r.SendRichMessage(receiverID, models.Message{
		SenderID:    senderID,
		Content:     content,
		MessageType: "text",
	})
}

func (r *MessageRepositoryImpl) SendRichMessage(receiverID int64, draft models.Message) (models.Message, error) {
	senderID := draft.SenderID
	user1ID, user2ID := senderID, receiverID
	if user1ID > user2ID {
		user1ID, user2ID = user2ID, user1ID
	}
	if draft.MessageType == "" {
		draft.MessageType = "text"
	}

	var msg models.Message
	err := db.DB.Transaction(func(tx *gorm.DB) error {
		var conv models.Conversation
		err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("user1_id = ? AND user2_id = ?", user1ID, user2ID).First(&conv).Error
		if errors.Is(err, gorm.ErrRecordNotFound) {
			conv = models.Conversation{User1ID: user1ID, User2ID: user2ID}
			if createErr := tx.Create(&conv).Error; createErr != nil {
				// A concurrent request may have created the unique pair first.
				if findErr := tx.Where("user1_id = ? AND user2_id = ?", user1ID, user2ID).First(&conv).Error; findErr != nil {
					return createErr
				}
			}
		} else if err != nil {
			return err
		}

		msg = draft
		msg.ConversationID = conv.ID
		if err := tx.Create(&msg).Error; err != nil {
			return err
		}
		var setting models.ConversationSetting
		if err := tx.Where("user_id = ? AND peer_id = ?", receiverID, senderID).Find(&setting).Error; err != nil {
			return err
		}
		if !setting.Muted && msg.MessageType != "call" {
			actor, entity := senderID, conv.ID
			if err := tx.Create(&models.Notification{UserID: receiverID, ActorID: &actor, Type: "message", EntityType: "conversation", EntityID: &entity, Message: "Someone sent you a message"}).Error; err != nil {
				return err
			}
		}
		return tx.Model(&conv).Update("updated_at", msg.CreatedAt).Error
	})
	if err != nil {
		return models.Message{}, err
	}
	if err := db.DB.Preload("Sender").First(&msg, msg.ID).Error; err != nil {
		return models.Message{}, err
	}
	msg.Sender.HidePrivateData()
	return msg, nil
}

func (r *MessageRepositoryImpl) MarkAsRead(convID, userID int64) error {
	var member int64
	if err := db.DB.Model(&models.Conversation{}).Where("id = ? AND (user1_id = ? OR user2_id = ?)", convID, userID, userID).Count(&member).Error; err != nil {
		return err
	}
	if member == 0 {
		return ErrConversationNotFound
	}
	return db.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&models.Message{}).Where("conversation_id = ? AND sender_id != ?", convID, userID).Update("is_read", true).Error; err != nil {
			return err
		}
		return tx.Model(&models.Notification{}).Where("user_id = ? AND entity_type = ? AND entity_id = ? AND read_at IS NULL", userID, "conversation", convID).Update("read_at", time.Now()).Error
	})
}
