package jwt

import (
	"errors"
	"fmt"
	"strings"
	"time"

	"goravel/app/facades"
	"goravel/app/models"

	"github.com/golang-jwt/jwt/v5"
)

const insecureDefaultSecret = "super-secret-key"

func signingSecret() ([]byte, error) {
	value := facades.Config().Env("JWT_SECRET", "").(string)
	if len(value) < 32 || value == insecureDefaultSecret || strings.TrimSpace(value) == "" {
		return nil, errors.New("JWT_SECRET must be set to a random value of at least 32 characters")
	}
	return []byte(value), nil
}

// ValidateConfiguration lets startup fail fast instead of issuing weak tokens.
func ValidateConfiguration() error {
	_, err := signingSecret()
	return err
}

// Claims defines custom claims for our JWT tokens
type Claims struct {
	UserID int64           `json:"user_id"`
	Email  string          `json:"email"`
	Role   models.UserRole `json:"role"`
	jwt.RegisteredClaims
}

// GenerateAccessToken creates a short-lived access token (15 mins)
func GenerateAccessToken(user *models.User) (string, error) {
	claims := &Claims{
		UserID: user.ID,
		Email:  user.Email,
		Role:   user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(15 * time.Minute)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	secret, err := signingSecret()
	if err != nil {
		return "", err
	}
	return token.SignedString(secret)
}

// GenerateRefreshToken creates a long-lived refresh token (7 days)
func GenerateRefreshToken(user *models.User) (string, error) {
	claims := &Claims{
		UserID: user.ID,
		Email:  user.Email,
		Role:   user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(7 * 24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	secret, err := signingSecret()
	if err != nil {
		return "", err
	}
	return token.SignedString(secret)
}

// ValidateAccessToken parses and validates an access token
func ValidateAccessToken(tokenStr string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		if token.Method.Alg() != jwt.SigningMethodHS256.Alg() {
			return nil, errors.New("unexpected signing method")
		}
		secret, secretErr := signingSecret()
		if secretErr != nil {
			return nil, fmt.Errorf("JWT configuration error: %w", secretErr)
		}
		return secret, nil
	})
	if err != nil {
		return nil, err
	}
	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, errors.New("invalid token")
	}
	return claims, nil
}

// ValidateRefreshToken parses and validates a refresh token
func ValidateRefreshToken(tokenStr string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		if token.Method.Alg() != jwt.SigningMethodHS256.Alg() {
			return nil, errors.New("unexpected signing method")
		}
		secret, secretErr := signingSecret()
		if secretErr != nil {
			return nil, fmt.Errorf("JWT configuration error: %w", secretErr)
		}
		return secret, nil
	})
	if err != nil {
		return nil, err
	}
	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, errors.New("invalid token")
	}
	return claims, nil
}
