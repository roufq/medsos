package services

import (
	"crypto/rand"
	"errors"
	"fmt"
	"net/mail"
	"regexp"
	"strings"

	"goravel/app/dto"
	"goravel/app/models"
	"goravel/app/repositories"
	"goravel/pkg/hash"
	"goravel/pkg/jwt"
	"goravel/pkg/session"
)

type AuthService interface {
	Register(req *dto.RegisterRequest) (*dto.AuthResponse, error)
	Login(req *dto.LoginRequest) (*dto.AuthResponse, error)
	Refresh(req *dto.RefreshRequest) (*dto.AuthResponse, error)
	Logout(refreshToken string)
}

type authService struct {
	userRepo repositories.UserRepository
}

// ValidPhone accepts E.164 numbers (country calling code included).
var ValidPhone = regexp.MustCompile(`^\+[1-9][0-9]{7,14}$`)

// ValidCountryCode accepts ISO 3166-1 alpha-2 country codes.
var ValidCountryCode = regexp.MustCompile(`^[A-Z]{2}$`)

var usernameCleanup = regexp.MustCompile(`[^a-z0-9_]+`)

func normalizeUsername(value string) string {
	value = strings.ToLower(strings.TrimSpace(value))
	value = strings.ReplaceAll(value, " ", "_")
	return strings.Trim(usernameCleanup.ReplaceAllString(value, ""), "_")
}

func (s *authService) availableUsername(requested, name string) (string, error) {
	base := normalizeUsername(requested)
	if base == "" {
		base = normalizeUsername(name)
	}
	if len(base) < 3 {
		base = "user"
	}
	if len(base) > 40 {
		base = base[:40]
	}
	for attempt := 0; attempt < 20; attempt++ {
		candidate := base
		if attempt > 0 {
			candidate = fmt.Sprintf("%s_%d", base, attempt)
		}
		if _, err := s.userRepo.GetByUsername(candidate); err != nil {
			return candidate, nil
		}
	}
	return "", errors.New("unable to allocate username")
}

func NewAuthService(userRepo repositories.UserRepository) AuthService {
	return &authService{userRepo: userRepo}
}

func (s *authService) Register(req *dto.RegisterRequest) (*dto.AuthResponse, error) {
	req.Email = strings.ToLower(strings.TrimSpace(req.Email))
	req.Name = strings.TrimSpace(req.Name)
	if len(req.Name) < 2 || len(req.Name) > 100 {
		return nil, errors.New("name must be 2-100 characters")
	}
	if _, err := mail.ParseAddress(req.Email); err != nil || len(req.Email) > 100 {
		return nil, errors.New("invalid email")
	}
	if len(req.Password) < 8 || len(req.Password) > 72 {
		return nil, errors.New("password must contain 8-72 characters")
	}
	// Check if user already exists
	if _, err := s.userRepo.GetByEmail(req.Email); err == nil {
		return nil, errors.New("email is already registered")
	}

	// Hash the password
	hashedPassword, err := hash.HashPassword(req.Password)
	if err != nil {
		return nil, err
	}

	username, err := s.availableUsername(req.Username, req.Name)
	if err != nil {
		return nil, err
	}
	accountType := strings.ToLower(strings.TrimSpace(req.AccountType))
	if accountType == "" {
		accountType = "personal"
	}
	if accountType != "personal" && accountType != "business" && accountType != "team" {
		return nil, errors.New("account_type must be personal, business, or team")
	}
	var phone, phoneCountry *string
	if cleaned := strings.TrimSpace(req.Phone); cleaned != "" {
		if !ValidPhone.MatchString(cleaned) {
			return nil, errors.New("phone must use E.164 format, for example +628123456789")
		}
		if _, err := s.userRepo.GetByPhone(cleaned); err == nil {
			return nil, errors.New("phone number is already registered")
		}
		phone = &cleaned
	}
	if country := strings.ToUpper(strings.TrimSpace(req.PhoneCountry)); country != "" {
		if !ValidCountryCode.MatchString(country) {
			return nil, errors.New("phone_country must be an ISO 3166-1 alpha-2 code")
		}
		phoneCountry = &country
	}
	user := &models.User{
		Name:          req.Name,
		Username:      &username,
		Email:         req.Email,
		Phone:         phone,
		PhoneCountry:  phoneCountry,
		Password:      hashedPassword,
		Role:          models.RoleUser, // Default is standard user
		AccountType:   accountType,
		AccountStatus: "active",
		ProfileLayout: "grid",
	}

	if err := s.userRepo.Create(user); err != nil {
		return nil, err
	}

	return issueTokens(user)
}

func (s *authService) Login(req *dto.LoginRequest) (*dto.AuthResponse, error) {
	identifier := strings.TrimSpace(req.Identifier)
	if identifier == "" {
		identifier = strings.TrimSpace(req.Email)
	}
	if identifier == "" {
		identifier = strings.TrimSpace(req.Username)
	}
	if identifier == "" {
		return nil, errors.New("email or username is required")
	}
	user, err := s.userRepo.GetByIdentifier(identifier)
	if err != nil {
		return nil, errors.New("invalid email or password")
	}

	// Verify the password hash
	if !hash.CheckPasswordHash(req.Password, user.Password) {
		return nil, errors.New("invalid email or password")
	}
	if user.AccountStatus == "blocked" {
		return nil, errors.New("account is blocked")
	}
	if user.DeletionRequestedAt != nil || user.AccountStatus == "pending_deletion" {
		return nil, errors.New("account is pending deletion; reactivate it first")
	}
	if user.AccountStatus != "active" {
		return nil, errors.New("account is not active")
	}

	return issueTokens(user)
}

func RandomPassword() (string, error) {
	buffer := make([]byte, 32)
	if _, err := rand.Read(buffer); err != nil {
		return "", err
	}
	return fmt.Sprintf("%x", buffer), nil
}

func (s *authService) Refresh(req *dto.RefreshRequest) (*dto.AuthResponse, error) {
	claims, err := jwt.ValidateRefreshToken(req.RefreshToken)
	if err != nil {
		return nil, errors.New("invalid or expired refresh token")
	}
	// Blocked/deleted accounts and revoked sessions may not mint new tokens.
	if _, err := session.Validate(claims); err != nil {
		return nil, errors.New("invalid or expired refresh token")
	}
	// Rotation: each refresh token is single-use.
	consumed, err := session.ConsumeRefresh(claims)
	if err != nil || !consumed {
		return nil, errors.New("invalid or expired refresh token")
	}

	user, err := s.userRepo.GetByID(claims.UserID)
	if err != nil {
		return nil, errors.New("user not found")
	}
	return issueTokens(user)
}

// Logout revokes the given refresh token so it cannot be replayed.
func (s *authService) Logout(refreshToken string) {
	if claims, err := jwt.ValidateRefreshToken(refreshToken); err == nil {
		_ = session.RevokeRefresh(claims)
	}
}

func issueTokens(user *models.User) (*dto.AuthResponse, error) {
	accessToken, err := jwt.GenerateAccessToken(user)
	if err != nil {
		return nil, err
	}
	refreshToken, err := jwt.GenerateRefreshToken(user)
	if err != nil {
		return nil, err
	}
	return &dto.AuthResponse{AccessToken: accessToken, RefreshToken: refreshToken, User: *user}, nil
}

// IssueTokens creates a fresh token pair for an already-authenticated user.
func IssueTokens(user *models.User) (*dto.AuthResponse, error) { return issueTokens(user) }
