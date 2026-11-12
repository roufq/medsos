package models

import (
	"time"

	"gorm.io/gorm"
)

type Conversation struct {
	PublicHash *string   `gorm:"type:varchar(32);uniqueIndex" json:"public_hash"`
	ID         int64     `gorm:"primaryKey;autoIncrement" json:"id"`
	User1ID    int64     `gorm:"not null;uniqueIndex:idx_user1_user2;index:idx_conversations_user1_updated,priority:1" json:"user1_id"`
	User2ID    int64     `gorm:"not null;uniqueIndex:idx_user1_user2;index:idx_conversations_user2_updated,priority:1" json:"user2_id"`
	CreatedAt  time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt  time.Time `gorm:"autoUpdateTime;index:idx_conversations_user1_updated,priority:2;index:idx_conversations_user2_updated,priority:2" json:"updated_at"`

	User1          User      `gorm:"foreignKey:User1ID;constraint:OnDelete:CASCADE" json:"user1"`
	User2          User      `gorm:"foreignKey:User2ID;constraint:OnDelete:CASCADE" json:"user2"`
	Messages       []Message `gorm:"foreignKey:ConversationID;constraint:OnDelete:CASCADE" json:"messages"`
	UnreadCount    int64     `gorm:"-" json:"unread_count"`
	HasShopMessage bool      `gorm:"-" json:"has_shop_message"`
	Muted          bool      `gorm:"-" json:"muted"`
	Nickname       string    `gorm:"-" json:"nickname"`
	PeerOnline     bool      `gorm:"-" json:"peer_online"`
}

func (c *Conversation) BeforeCreate(tx *gorm.DB) error {
	if c.PublicHash == nil || *c.PublicHash == "" {
		if token, err := NewPostHash(); err == nil {
			c.PublicHash = &token
		}
	}
	return nil
}

func (c *Conversation) AfterFind(tx *gorm.DB) error {
	if c.ID > 0 && (c.PublicHash == nil || *c.PublicHash == "") {
		if token, err := NewPostHash(); err == nil {
			c.PublicHash = &token
			if tx != nil {
				_ = tx.Session(&gorm.Session{SkipHooks: true, NewDB: true}).Model(&Conversation{}).Where("id = ? AND (public_hash IS NULL OR public_hash = '')", c.ID).UpdateColumn("public_hash", token).Error
			}
		}
	}
	return nil
}
