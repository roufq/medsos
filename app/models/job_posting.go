package models

import "time"

type JobPosting struct {
	ID          int64     `gorm:"primaryKey;autoIncrement" json:"id"`
	EmployerID  int64     `gorm:"not null;index" json:"employer_id"`
	Title       string    `gorm:"type:varchar(255);not null" json:"title"`
	Company     string    `gorm:"type:varchar(255);not null" json:"company"`
	Location    string    `gorm:"type:varchar(255)" json:"location"`
	Type        string    `gorm:"type:varchar(50)" json:"type"`
	Description string    `gorm:"type:text" json:"description"`
	Category    string    `gorm:"type:varchar(100)" json:"category"`
	Salary      string    `gorm:"type:varchar(100)" json:"salary"`
	CreatedAt   time.Time `gorm:"autoCreateTime;index" json:"created_at"`
	UpdatedAt   time.Time `gorm:"autoUpdateTime" json:"updated_at"`

	Employer User `gorm:"foreignKey:EmployerID;constraint:OnDelete:CASCADE" json:"employer"`
}
