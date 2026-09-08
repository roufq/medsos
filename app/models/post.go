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
	PostTypeShop  PostType = "shop"
)

type Post struct {
	ID            int64         `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID        int64         `gorm:"not null;index:idx_posts_user_created,priority:1" json:"user_id"`
	User          User          `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"user"`
	Title         *string       `gorm:"type:varchar(255)" json:"title"`
	Content       *string       `gorm:"type:text" json:"content"`
	PostType      PostType      `gorm:"type:varchar(20);not null;index" json:"post_type"`
	Location      *string       `gorm:"type:varchar(255);index" json:"location,omitempty"`
	Visibility    string        `gorm:"type:varchar(20);not null;default:'public';index" json:"visibility"`
	RepostOfID    *int64        `gorm:"index" json:"repost_of_id,omitempty"`
	OriginalPost  *Post         `gorm:"foreignKey:RepostOfID;constraint:OnDelete:SET NULL" json:"original_post,omitempty"`
	CreatedAt     time.Time     `gorm:"autoCreateTime;index:idx_posts_created;index:idx_posts_user_created,priority:2" json:"created_at"`
	UpdatedAt     time.Time     `gorm:"autoUpdateTime" json:"updated_at"`
	Media         []PostMedia   `gorm:"foreignKey:PostID;constraint:OnDelete:CASCADE" json:"media,omitempty"`
	Link          *PostLink     `gorm:"foreignKey:PostID;constraint:OnDelete:CASCADE" json:"link,omitempty"`
	Hashtags      []PostHashtag `gorm:"foreignKey:PostID;constraint:OnDelete:CASCADE" json:"hashtags,omitempty"`
	Mentions      []PostMention `gorm:"foreignKey:PostID;constraint:OnDelete:CASCADE" json:"mentions,omitempty"`
	Shop          *ShopProduct  `gorm:"foreignKey:PostID;constraint:OnDelete:CASCADE" json:"shop,omitempty"`
	Likes         []PostLike    `gorm:"foreignKey:PostID;constraint:OnDelete:CASCADE" json:"likes,omitempty"`
	Comments      []PostComment `gorm:"foreignKey:PostID;constraint:OnDelete:CASCADE" json:"comments,omitempty"`
	LikesCount    int64         `gorm:"column:likes_count;->" json:"likes_count"`
	CommentsCount int64         `gorm:"column:comments_count;->" json:"comments_count"`
	IsLikedByMe   bool          `gorm:"column:is_liked_by_me;->" json:"is_liked_by_me"`
	IsSavedByMe   bool          `gorm:"column:is_saved_by_me;->" json:"is_saved_by_me"`
	ViewsCount    int64         `gorm:"column:views_count;->" json:"views_count"`
	SharesCount   int64         `gorm:"column:shares_count;->" json:"shares_count"`
}
