package services

import (
	"goravel/app/models"
	"goravel/app/repositories"
)

type UserService interface {
	GetByID(id int64) (*models.User, error)
	UpdateProfile(id int64, name string, bio *string, avatarURL *string, coverURL *string, title *string, company *string, location *string, website *string) (*models.User, error)
	ListAll() ([]models.User, error)
}

type userService struct {
	userRepo repositories.UserRepository
}

func NewUserService(userRepo repositories.UserRepository) UserService {
	return &userService{userRepo: userRepo}
}

func (s *userService) GetByID(id int64) (*models.User, error) {
	return s.userRepo.GetByID(id)
}

func (s *userService) UpdateProfile(id int64, name string, bio *string, avatarURL *string, coverURL *string, title *string, company *string, location *string, website *string) (*models.User, error) {
	user, err := s.userRepo.GetByID(id)
	if err != nil {
		return nil, err
	}

	if name != "" {
		user.Name = name
	}
	if bio != nil {
		user.Bio = bio
	}
	if avatarURL != nil {
		user.AvatarURL = avatarURL
	}
	if coverURL != nil {
		user.CoverURL = coverURL
	}
	if title != nil {
		user.Title = title
	}
	if company != nil {
		user.Company = company
	}
	if location != nil {
		user.Location = location
	}
	if website != nil {
		user.Website = website
	}

	if err := s.userRepo.Update(user); err != nil {
		return nil, err
	}

	return user, nil
}

func (s *userService) ListAll() ([]models.User, error) {
	return s.userRepo.ListAll()
}
