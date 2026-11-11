package models

import "time"

type Message struct {
	ID             int64     `gorm:"primaryKey;autoIncrement;index:idx_messages_conversation_id,priority:2" json:"id"`
	ConversationID int64     `gorm:"not null;index:idx_messages_conversation_created,priority:1;index:idx_messages_conversation_id,priority:1" json:"conversation_id"`
	SenderID       int64     `gorm:"not null;index" json:"sender_id"`
	Content        string    `gorm:"type:text;not null" json:"content"`
	MessageType    string    `gorm:"size:32;default:'text'" json:"message_type"`
	AttachmentURL  string    `gorm:"size:500" json:"attachment_url,omitempty"`
	AttachmentName string    `gorm:"size:255" json:"attachment_name,omitempty"`
	AttachmentSize int64     `gorm:"default:0" json:"attachment_size,omitempty"`
	AttachmentMime string    `gorm:"size:120" json:"attachment_mime,omitempty"`
	MetadataJSON   string    `gorm:"type:text" json:"metadata_json,omitempty"`
	IsRead         bool      `gorm:"default:false" json:"is_read"`
	CreatedAt      time.Time `gorm:"autoCreateTime;index:idx_messages_conversation_created,priority:2" json:"created_at"`

	Conversation Conversation `gorm:"foreignKey:ConversationID" json:"-"`
	Sender       User         `gorm:"foreignKey:SenderID" json:"sender"`
}
