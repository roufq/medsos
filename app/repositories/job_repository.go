package repositories

import (
	"goravel/app/models"
	"goravel/pkg/db"
)

type JobRepository interface {
	GetAllJobs() ([]models.JobPosting, error)
	ApplyJob(userID, jobID int64) error
	GetAppliedJobIDs(userID int64) ([]int64, error)
}

type JobRepositoryImpl struct{}

func NewJobRepository() JobRepository {
	return &JobRepositoryImpl{}
}

func (r *JobRepositoryImpl) GetAllJobs() ([]models.JobPosting, error) {
	var jobs []models.JobPosting
	err := db.DB.Preload("Employer").Order("created_at desc").Limit(100).Find(&jobs).Error
	return jobs, err
}

func (r *JobRepositoryImpl) ApplyJob(userID, jobID int64) error {
	app := models.JobApplication{
		ApplicantID:  userID,
		JobPostingID: jobID,
		Status:       "applied",
	}
	return db.DB.Create(&app).Error
}

func (r *JobRepositoryImpl) GetAppliedJobIDs(userID int64) ([]int64, error) {
	var ids []int64
	err := db.DB.Model(&models.JobApplication{}).Where("applicant_id = ?", userID).Pluck("job_posting_id", &ids).Error
	return ids, err
}
