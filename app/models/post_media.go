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
	DurationSeconds int `gorm:"not null;default:0" json:"duration_seconds"`
	IsShort bool `gorm:"not null;default:false;index" json:"is_short"`
	ProcessingStatus string `gorm:"type:varchar(20);not null;default:'ready';index" json:"processing_status"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
}
