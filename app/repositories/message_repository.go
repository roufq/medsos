package repositories

import (
	"errors"
	"goravel/app/models"
	"goravel/pkg/db"
	"gorm.io/gorm"
)

var ErrConversationNotFound = errors.New("conversation not found")

type MessageRepository interface {
	GetConversations(userID int64) ([]models.Conversation, error)
	GetMessages(convID, userID, beforeID int64) ([]models.Message, error)
	SendMessage(senderID, receiverID int64, content string) (models.Message, error)
	MarkAsRead(convID, userID int64) error
}

type MessageRepositoryImpl struct{}

func NewMessageRepository() MessageRepository {
	return &MessageRepositoryImpl{}
}

func (r *MessageRepositoryImpl) GetConversations(userID int64) ([]models.Conversation, error) {
	var convs []models.Conversation
	err := db.DB.Preload("User1").Preload("User2").
		Where("user1_id = ? OR user2_id = ?", userID, userID).
		Order("updated_at desc").
		Limit(100).
		Find(&convs).Error
	if err != nil {
		return nil, err
	}
	if len(convs) > 0 {
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
		for i := range convs {
			if message, ok := lastByConversation[convs[i].ID]; ok {
				convs[i].Messages = []models.Message{message}
			} else {
				convs[i].Messages = []models.Message{}
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
	var count int64
	if err := db.DB.Model(&models.Conversation{}).
		Where("id = ? AND (user1_id = ? OR user2_id = ?)", convID, userID, userID).
		Count(&count).Error; err != nil {
		return nil, err
	}
	if count == 0 {
		return nil, ErrConversationNotFound
	}

	var msgs []models.Message
	query := db.DB.Preload("Sender").Where("conversation_id = ?", convID)
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
	user1ID, user2ID := senderID, receiverID
	if user1ID > user2ID {
		user1ID, user2ID = user2ID, user1ID
	}

	var msg models.Message
	err := db.DB.Transaction(func(tx *gorm.DB) error {
		var conv models.Conversation
		err := tx.Where("user1_id = ? AND user2_id = ?", user1ID, user2ID).First(&conv).Error
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

		msg = models.Message{ConversationID: conv.ID, SenderID: senderID, Content: content}
		if err := tx.Create(&msg).Error; err != nil {
			return err
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
	return db.DB.Model(&models.Message{}).
		Where("conversation_id = ? AND sender_id != ?", convID, userID).
		Update("is_read", true).Error
}
