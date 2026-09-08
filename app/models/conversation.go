package models

import "time"

type Conversation struct {
	ID        int64     `gorm:"primaryKey;autoIncrement" json:"id"`
	User1ID   int64     `gorm:"not null;uniqueIndex:idx_user1_user2" json:"user1_id"`
	User2ID   int64     `gorm:"not null;uniqueIndex:idx_user1_user2" json:"user2_id"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updated_at"`

	User1    User      `gorm:"foreignKey:User1ID;constraint:OnDelete:CASCADE" json:"user1"`
	User2    User      `gorm:"foreignKey:User2ID;constraint:OnDelete:CASCADE" json:"user2"`
	Messages []Message `gorm:"foreignKey:ConversationID;constraint:OnDelete:CASCADE" json:"messages"`
}
