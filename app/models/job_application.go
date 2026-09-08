package models

import "time"

type JobApplication struct {
	ID           int64     `gorm:"primaryKey;autoIncrement" json:"id"`
	JobPostingID int64     `gorm:"not null;uniqueIndex:idx_job_applicant" json:"job_posting_id"`
	ApplicantID  int64     `gorm:"not null;uniqueIndex:idx_job_applicant" json:"applicant_id"`
	Status       string    `gorm:"type:varchar(50);default:'applied'" json:"status"`
	CreatedAt    time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt    time.Time `gorm:"autoUpdateTime" json:"updated_at"`

	JobPosting JobPosting `gorm:"foreignKey:JobPostingID;constraint:OnDelete:CASCADE" json:"job_posting"`
	Applicant  User       `gorm:"foreignKey:ApplicantID;constraint:OnDelete:CASCADE" json:"applicant"`
}
