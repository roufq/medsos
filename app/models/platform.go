package models

import "time"

type PlatformSetting struct {
	ID                  uint      `gorm:"primaryKey" json:"-"`
	UploadLimitsEnabled bool      `gorm:"not null;default:false" json:"upload_limits_enabled"`
	UpdatedAt           time.Time `json:"updated_at"`
}

type UserActivity struct {
	ID          uint64    `gorm:"primaryKey" json:"id"`
	UserID      int64     `gorm:"index;not null" json:"user_id"`
	User        User      `gorm:"foreignKey:UserID" json:"user"`
	Action      string    `gorm:"size:32;not null" json:"action"`
	Target      string    `gorm:"size:255" json:"target"`
	Description string    `gorm:"size:255" json:"description"`
	Reason      string    `gorm:"size:300" json:"reason,omitempty"`
	CreatedAt   time.Time `gorm:"index" json:"created_at"`
}
