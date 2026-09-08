package models

import (
	"time"
)

type MediaType string

const (
	MediaTypeImage MediaType = "image"
	MediaTypeVideo MediaType = "video"
)

type PostMedia struct {
	ID        int64     `gorm:"primaryKey;autoIncrement" json:"id"`
	PostID    int64     `gorm:"not null;index" json:"post_id"`
	MediaType MediaType `gorm:"type:enum('image','video');not null" json:"media_type"`
	MediaURL  string    `gorm:"type:varchar(255);not null" json:"media_url"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
}
