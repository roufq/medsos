package models

import (
	"gorm.io/gorm"
	"time"
)

type NotificationDelivery struct {
	ID             uint64 `gorm:"primaryKey"`
	NotificationID int64  `gorm:"uniqueIndex"`
	Attempts       int
	NextAttempt    time.Time `gorm:"index"`
	LeaseUntil     *time.Time
	Done           bool `gorm:"index"`
	EmailSent      bool
	PushSent       bool
}
type PushSubscription struct {
	ID        string `gorm:"type:varchar(64);primaryKey" json:"id"`
	UserID    int64  `gorm:"index" json:"-"`
	Endpoint  string `gorm:"type:text" json:"-"`
	Auth      string `gorm:"size:100" json:"-"`
	P256dh    string `gorm:"size:200" json:"-"`
	CreatedAt time.Time
}
type PushKey struct {
	ID      uint   `gorm:"primaryKey"`
	Public  string `gorm:"size:200"`
	Private string `gorm:"type:text"`
}

func (n *Notification) AfterCreate(tx *gorm.DB) error {
	return tx.Create(&NotificationDelivery{NotificationID: n.ID, NextAttempt: time.Now()}).Error
}
