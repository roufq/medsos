package services

import (
	"errors"
	"fmt"
	"net/url"
	"strings"
	"unicode/utf8"

	"goravel/app/models"
	"goravel/app/repositories"
	"goravel/pkg/db"
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

	if name = strings.TrimSpace(name); name != "" {
		if utf8.RuneCountInString(name) < 2 || utf8.RuneCountInString(name) > 100 {
			return nil, errors.New("name must be 2-100 characters")
		}
		user.Name = name
	}
	if bio != nil {
		if utf8.RuneCountInString(strings.TrimSpace(*bio)) > ProfileBioMaxChars {
			return nil, fmt.Errorf("bio must be at most %d characters", ProfileBioMaxChars)
		}
		user.Bio = trimmedOrNil(*bio)
	}
	// Re-submitting the current value (e.g. an OAuth provider avatar) is fine.
	if avatarURL != nil && strings.TrimSpace(*avatarURL) != valueOrEmpty(user.AvatarURL) {
		if err := ValidateOwnImage(id, *avatarURL); err != nil {
			return nil, err
		}
		user.AvatarURL = trimmedOrNil(*avatarURL)
	}
	if coverURL != nil && strings.TrimSpace(*coverURL) != valueOrEmpty(user.CoverURL) {
		if err := ValidateOwnImage(id, *coverURL); err != nil {
			return nil, err
		}
		user.CoverURL = trimmedOrNil(*coverURL)
	}
	for _, field := range []struct {
		value  *string
		target **string
		label  string
	}{{title, &user.Title, "title"}, {company, &user.Company, "company"}, {location, &user.Location, "location"}} {
		if field.value == nil {
			continue
		}
		if utf8.RuneCountInString(strings.TrimSpace(*field.value)) > 100 {
			return nil, fmt.Errorf("%s must be at most 100 characters", field.label)
		}
		*field.target = trimmedOrNil(*field.value)
	}
	if website != nil {
		if err := ValidateWebsite(*website); err != nil {
			return nil, err
		}
		user.Website = trimmedOrNil(*website)
	}

	if err := s.userRepo.Update(user); err != nil {
		return nil, err
	}

	return user, nil
}

// ProfileBioMaxChars bounds the profile bio.
const ProfileBioMaxChars = 500

func trimmedOrNil(value string) *string {
	value = strings.TrimSpace(value)
	if value == "" {
		return nil
	}
	return &value
}

// ValidateWebsite only allows absolute http(s) links, so a profile link can
// never become a javascript: or data: URL.
func ValidateWebsite(website string) error {
	website = strings.TrimSpace(website)
	if website == "" {
		return nil
	}
	parsed, err := url.ParseRequestURI(website)
	if err != nil || (parsed.Scheme != "http" && parsed.Scheme != "https") || parsed.Hostname() == "" || len(website) > 500 {
		return errors.New("website must be a valid HTTP/HTTPS URL")
	}
	return nil
}

// ValidateOwnImage requires profile photos/headers to be images the user
// uploaded through /media/upload (empty clears the image).
func ValidateOwnImage(userID int64, imageURL string) error {
	imageURL = strings.TrimSpace(imageURL)
	if imageURL == "" {
		return nil
	}
	var count int64
	db.DB.Model(&models.MediaUpload{}).Where("user_id = ? AND url = ? AND media_type = ?", userID, imageURL, models.MediaTypeImage).Count(&count)
	if count == 0 {
		return errors.New("profile images must be uploaded through /media/upload first")
	}
	return nil
}

func (s *userService) ListAll() ([]models.User, error) {
	return s.userRepo.ListAll()
}
