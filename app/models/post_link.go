package models

import (
	"time"
)

type PostLink struct {
	ID          int64     `gorm:"primaryKey;autoIncrement" json:"id"`
	PostID      int64     `gorm:"not null;uniqueIndex" json:"post_id"`
	URL         string    `gorm:"type:varchar(500);not null" json:"url"`
	Title       *string   `gorm:"type:varchar(255)" json:"title"`
	Description *string   `gorm:"type:text" json:"description"`
	ImageURL    *string   `gorm:"type:varchar(255)" json:"image_url"`
	SiteName    *string   `gorm:"type:varchar(100)" json:"site_name"`
	CreatedAt   time.Time `gorm:"autoCreateTime" json:"created_at"`
}
