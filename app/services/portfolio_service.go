package services

import (
	"errors"
	"goravel/app/dto"
	"goravel/app/models"
	"goravel/app/repositories"
)

type PortfolioService interface {
	CreatePortfolio(userID int64, req dto.CreatePortfolioRequest) (*models.Portfolio, error)
	GetPortfolios(userID int64) ([]models.Portfolio, error)
	DeletePortfolio(userID, portfolioID int64) error
}

type portfolioService struct {
	repo repositories.PortfolioRepository
}

func NewPortfolioService(repo repositories.PortfolioRepository) PortfolioService {
	return &portfolioService{repo}
}

func (s *portfolioService) CreatePortfolio(userID int64, req dto.CreatePortfolioRequest) (*models.Portfolio, error) {
	portfolio := &models.Portfolio{
		UserID:      userID,
		Title:       req.Title,
		Description: req.Description,
		ProjectType: req.ProjectType,
		ImageURL:    req.ImageURL,
		LinkURL:     req.LinkURL,
	}

	if err := s.repo.Create(portfolio); err != nil {
		return nil, err
	}

	return portfolio, nil
}

func (s *portfolioService) GetPortfolios(userID int64) ([]models.Portfolio, error) {
	return s.repo.GetByUserID(userID)
}

func (s *portfolioService) DeletePortfolio(userID, portfolioID int64) error {
	portfolio, err := s.repo.GetByID(portfolioID)
	if err != nil {
		return errors.New("portfolio not found")
	}

	if portfolio.UserID != userID {
		return errors.New("unauthorized to delete this portfolio")
	}

	return s.repo.Delete(portfolioID)
}
