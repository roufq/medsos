package models

import (
	"time"
)

type PostType string

const (
	PostTypeText  PostType = "text"
	PostTypeImage PostType = "image"
	PostTypeVideo PostType = "video"
	PostTypeLink  PostType = "link"
)

type Post struct {
	ID        int64         `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID    int64         `gorm:"not null;index:idx_posts_user_created,priority:1" json:"user_id"`
	User      User          `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"user"`
	Title     *string       `gorm:"type:varchar(255)" json:"title"`
	Content   *string       `gorm:"type:text" json:"content"`
	PostType  PostType      `gorm:"type:enum('text','image','video','link');not null" json:"post_type"`
	CreatedAt time.Time     `gorm:"autoCreateTime;index:idx_posts_created;index:idx_posts_user_created,priority:2" json:"created_at"`
	UpdatedAt time.Time     `gorm:"autoUpdateTime" json:"updated_at"`
	Media     []PostMedia   `gorm:"foreignKey:PostID;constraint:OnDelete:CASCADE" json:"media,omitempty"`
	Link      *PostLink     `gorm:"foreignKey:PostID;constraint:OnDelete:CASCADE" json:"link,omitempty"`
	Likes     []PostLike    `gorm:"foreignKey:PostID;constraint:OnDelete:CASCADE" json:"likes,omitempty"`
	Comments  []PostComment `gorm:"foreignKey:PostID;constraint:OnDelete:CASCADE" json:"comments,omitempty"`
}
