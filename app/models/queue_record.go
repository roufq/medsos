package models

import "time"

// QueueRecord mirrors the table consumed by Goravel's database queue driver.
type QueueRecord struct {
	ID          uint       `gorm:"primaryKey;autoIncrement"`
	Queue       string     `gorm:"type:varchar(255);not null;index:idx_jobs_available,priority:1"`
	Payload     string     `gorm:"type:longtext;not null"`
	Attempts    uint8      `gorm:"not null;default:0"`
	ReservedAt  *time.Time `gorm:"index:idx_jobs_available,priority:2"`
	AvailableAt time.Time  `gorm:"not null;index:idx_jobs_available,priority:3"`
	CreatedAt   time.Time  `gorm:"not null"`
}

func (QueueRecord) TableName() string {
	return "jobs"
}

type FailedQueueRecord struct {
	ID         uint      `gorm:"primaryKey;autoIncrement"`
	UUID       string    `gorm:"type:varchar(255);not null;uniqueIndex"`
	Connection string    `gorm:"type:text;not null"`
	Queue      string    `gorm:"type:text;not null"`
	Payload    string    `gorm:"type:longtext;not null"`
	Exception  string    `gorm:"type:longtext;not null"`
	FailedAt   time.Time `gorm:"not null"`
}

func (FailedQueueRecord) TableName() string {
	return "failed_jobs"
}
