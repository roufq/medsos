package models

import "time"

// Settings belong to the viewer; the other participant never receives them.
type ConversationSetting struct {
	ID               int64  `gorm:"primaryKey" json:"-"`
	UserID           int64  `gorm:"not null;uniqueIndex:idx_chat_setting" json:"-"`
	PeerID           int64  `gorm:"not null;uniqueIndex:idx_chat_setting" json:"-"`
	Muted            bool   `json:"muted"`
	Nickname         string `gorm:"size:80" json:"nickname"`
	DeletedThroughID int64  `gorm:"not null;default:0" json:"-"`
	Hidden           bool   `json:"-"`
}

type ConversationReport struct {
	ID             int64      `gorm:"primaryKey" json:"id"`
	ReporterID     int64      `gorm:"not null;uniqueIndex:idx_chat_report" json:"reporter_id"`
	ReportedUserID int64      `gorm:"not null;uniqueIndex:idx_chat_report" json:"reported_user_id"`
	Reason         string     `gorm:"size:100;not null" json:"reason"`
	Details        string     `gorm:"type:text" json:"details"`
	Status         string     `gorm:"size:20;not null;default:'pending';index" json:"status"`
	ReviewedBy     *int64     `json:"reviewed_by,omitempty"`
	ReviewedAt     *time.Time `json:"reviewed_at,omitempty"`
	CreatedAt      time.Time  `json:"created_at"`
}
