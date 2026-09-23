package models

import (
	"time"
)

type PostComment struct {
	ID        int64     `gorm:"primaryKey;autoIncrement;index:idx_comments_post_id,priority:2" json:"id"`
	PostID    int64     `gorm:"not null;index;index:idx_comments_post_id,priority:1" json:"post_id"`
	UserID    int64     `gorm:"not null;index" json:"user_id"`
	ParentID  *int64    `gorm:"index" json:"parent_id,omitempty"`
	Content   string    `gorm:"type:text;not null" json:"content"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updated_at"`

	Post    *Post         `gorm:"foreignKey:PostID;constraint:OnDelete:CASCADE" json:"post,omitempty"`
	User    *User         `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"user,omitempty"`
	Parent  *PostComment  `gorm:"foreignKey:ParentID;constraint:OnDelete:CASCADE" json:"-"`
	Replies []PostComment `gorm:"foreignKey:ParentID;constraint:OnDelete:CASCADE" json:"replies,omitempty"`
}
