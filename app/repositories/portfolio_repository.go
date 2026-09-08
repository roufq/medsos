package repositories

import (
	"goravel/app/models"

	"gorm.io/gorm"
)

type PortfolioRepository interface {
	Create(portfolio *models.Portfolio) error
	GetByUserID(userID int64) ([]models.Portfolio, error)
	GetByID(id int64) (*models.Portfolio, error)
	Delete(id int64) error
}

type portfolioRepository struct {
	db *gorm.DB
}

func NewPortfolioRepository(db *gorm.DB) PortfolioRepository {
	return &portfolioRepository{db}
}

func (r *portfolioRepository) Create(portfolio *models.Portfolio) error {
	return r.db.Create(portfolio).Error
}

func (r *portfolioRepository) GetByUserID(userID int64) ([]models.Portfolio, error) {
	var portfolios []models.Portfolio
	err := r.db.Where("user_id = ?", userID).Order("created_at desc").Limit(100).Find(&portfolios).Error
	return portfolios, err
}

func (r *portfolioRepository) GetByID(id int64) (*models.Portfolio, error) {
	var portfolio models.Portfolio
	err := r.db.Where("id = ?", id).First(&portfolio).Error
	return &portfolio, err
}

func (r *portfolioRepository) Delete(id int64) error {
	return r.db.Delete(&models.Portfolio{}, "id = ?", id).Error
}
