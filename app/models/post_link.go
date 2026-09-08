package models

import (
	"time"
)

type LinkPreviewStatus string

const (
	LinkPreviewPending    LinkPreviewStatus = "pending"
	LinkPreviewProcessing LinkPreviewStatus = "processing"
	LinkPreviewReady      LinkPreviewStatus = "ready"
	LinkPreviewFailed     LinkPreviewStatus = "failed"
)

type PostLink struct {
	ID            int64             `gorm:"primaryKey;autoIncrement" json:"id"`
	PostID        int64             `gorm:"not null;uniqueIndex" json:"post_id"`
	URL           string            `gorm:"type:varchar(500);not null" json:"url"`
	Title         *string           `gorm:"type:varchar(255)" json:"title"`
	Description   *string           `gorm:"type:text" json:"description"`
	ImageURL      *string           `gorm:"type:varchar(255)" json:"image_url"`
	SiteName      *string           `gorm:"type:varchar(100)" json:"site_name"`
	PreviewStatus LinkPreviewStatus `gorm:"type:varchar(20);not null;default:'pending';index" json:"preview_status"`
	PreviewError  string            `gorm:"type:varchar(255)" json:"preview_error,omitempty"`
	CreatedAt     time.Time         `gorm:"autoCreateTime" json:"created_at"`
}
