package models

import "time"

type LoginSession struct {
	CreatedAt    *time.Time `gorm:"autoCreateTime" json:"created_at"`
	IPAddress    string     `gorm:"size:64" json:"ip_address,omitempty"`
	ID           string     `gorm:"type:varchar(32);primaryKey" json:"id"`
	UserID       int64      `gorm:"index;not null" json:"user_id"`
	LastActivity time.Time  `gorm:"not null" json:"last_activity"`
	ExpiresAt    time.Time  `gorm:"index;not null" json:"expires_at"`
}
