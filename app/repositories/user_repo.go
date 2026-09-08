package repositories

import (
	"goravel/app/models"
	"goravel/pkg/db"
)

type UserRepository interface {
	GetByID(id int64) (*models.User, error)
	GetByEmail(email string) (*models.User, error)
	Create(user *models.User) error
	Update(user *models.User) error
	ListAll() ([]models.User, error)
}

type userRepo struct{}

func NewUserRepository() UserRepository {
	return &userRepo{}
}

func (r *userRepo) GetByID(id int64) (*models.User, error) {
	var user models.User
	if err := db.DB.First(&user, id).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepo) GetByEmail(email string) (*models.User, error) {
	var user models.User
	if err := db.DB.Where("email = ?", email).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepo) Create(user *models.User) error {
	return db.DB.Create(user).Error
}

func (r *userRepo) Update(user *models.User) error {
	return db.DB.Save(user).Error
}

func (r *userRepo) ListAll() ([]models.User, error) {
	var users []models.User
	if err := db.DB.Order("created_at desc").Limit(500).Find(&users).Error; err != nil {
		return nil, err
	}
	return users, nil
}
