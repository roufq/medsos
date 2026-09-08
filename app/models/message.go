package models

import "time"

type Message struct {
	ID             int64     `gorm:"primaryKey;autoIncrement" json:"id"`
	ConversationID int64     `gorm:"not null;index" json:"conversation_id"`
	SenderID       int64     `gorm:"not null;index" json:"sender_id"`
	Content        string    `gorm:"type:text;not null" json:"content"`
	IsRead         bool      `gorm:"default:false" json:"is_read"`
	CreatedAt      time.Time `gorm:"autoCreateTime" json:"created_at"`

	Conversation Conversation `gorm:"foreignKey:ConversationID" json:"-"`
	Sender       User         `gorm:"foreignKey:SenderID" json:"sender"`
}
