package jwt

import (
	"crypto/rand"
	"encoding/hex"
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

const (
	TypeAccess  = "access"
	TypeRefresh = "refresh"

	AccessTTL  = 15 * time.Minute
	RefreshTTL = 7 * 24 * time.Hour
)

// Claims defines custom claims for our JWT tokens. Type keeps a refresh token
// from being accepted as an access token, TokenVersion lets the server revoke
// every outstanding token of a user, and the registered ID (jti) identifies a
// single refresh token so logout/rotation can revoke just that session.
type Claims struct {
	SessionID    string          `json:"sid,omitempty"`
	UserID       int64           `json:"user_id"`
	Email        string          `json:"email"`
	Role         models.UserRole `json:"role"`
	Type         string          `json:"typ"`
	TokenVersion int64           `json:"tv"`
	jwt.RegisteredClaims
}

func newTokenID() (string, error) {
	var b [16]byte
	if _, err := rand.Read(b[:]); err != nil {
		return "", err
	}
	return hex.EncodeToString(b[:]), nil
}

func generate(user *models.User, tokenType string, ttl time.Duration, sessionID string) (string, error) {
	secret, err := signingSecret()
	if err != nil {
		return "", err
	}
	id, err := newTokenID()
	if err != nil {
		return "", err
	}
	now := time.Now()
	claims := &Claims{
		SessionID:    sessionID,
		UserID:       user.ID,
		Email:        user.Email,
		Role:         user.Role,
		Type:         tokenType,
		TokenVersion: user.TokenVersion,
		RegisteredClaims: jwt.RegisteredClaims{
			ID:        id,
			ExpiresAt: jwt.NewNumericDate(now.Add(ttl)),
			IssuedAt:  jwt.NewNumericDate(now),
		},
	}
	return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString(secret)
}

// GenerateAccessToken creates a short-lived access token.
func GenerateAccessToken(user *models.User, sessionID ...string) (string, error) {
	id := ""
	if len(sessionID) > 0 {
		id = sessionID[0]
	}
	return generate(user, TypeAccess, AccessTTL, id)
}

// GenerateRefreshToken creates a long-lived refresh token.
func GenerateRefreshToken(user *models.User, sessionID ...string) (string, error) {
	id := ""
	if len(sessionID) > 0 {
		id = sessionID[0]
	}
	return generate(user, TypeRefresh, RefreshTTL, id)
}

func parse(tokenStr, expectedType string) (*Claims, error) {
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
	if !ok || !token.Valid || claims.UserID <= 0 || claims.Type != expectedType {
		return nil, errors.New("invalid token")
	}
	return claims, nil
}

// ValidateAccessToken parses and validates an access token.
func ValidateAccessToken(tokenStr string) (*Claims, error) {
	return parse(tokenStr, TypeAccess)
}

// ValidateRefreshToken parses and validates a refresh token.
func ValidateRefreshToken(tokenStr string) (*Claims, error) {
	return parse(tokenStr, TypeRefresh)
}
