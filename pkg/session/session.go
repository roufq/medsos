// Package session decides whether a structurally valid JWT still represents a
// live session: the account must be active, the token's version must match the
// user's current token_version, and a refresh token must not be revoked.
package session

import (
	"errors"
	"sync"
	"time"

	"goravel/app/models"
	"goravel/pkg/db"
	"goravel/pkg/jwt"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// cacheTTL bounds how long a blocked/deleted account can keep using an access
// token on another instance; Invalidate makes the change immediate locally.
const cacheTTL = 10 * time.Second

var (
	ErrRevoked  = errors.New("session has been revoked")
	ErrInactive = errors.New("account is not active")
)

type State struct {
	Status       string
	Role         models.UserRole
	TokenVersion int64
}

type entry struct {
	state   State
	expires time.Time
}

var (
	mu      sync.Mutex
	cache   = map[int64]entry{}
	inserts int
)

// Lookup returns the user's current session state, using a short-lived cache
// so the auth middleware does not hit the database on every request.
func Lookup(userID int64) (State, error) {
	now := time.Now()
	mu.Lock()
	if cached, ok := cache[userID]; ok && now.Before(cached.expires) {
		mu.Unlock()
		return cached.state, nil
	}
	mu.Unlock()

	var row struct {
		AccountStatus string
		Role          models.UserRole
		TokenVersion  int64
	}
	if err := db.DB.Model(&models.User{}).Select("account_status", "role", "token_version").Where("id = ?", userID).Take(&row).Error; err != nil {
		return State{}, err
	}
	state := State{Status: row.AccountStatus, Role: row.Role, TokenVersion: row.TokenVersion}

	mu.Lock()
	cache[userID] = entry{state: state, expires: now.Add(cacheTTL)}
	inserts++
	if inserts >= 4096 {
		inserts = 0
		for id, cached := range cache {
			if now.After(cached.expires) {
				delete(cache, id)
			}
		}
	}
	mu.Unlock()
	return state, nil
}

// Invalidate drops the cached state so the next request re-reads the database.
func Invalidate(userID int64) {
	mu.Lock()
	delete(cache, userID)
	mu.Unlock()
}

// Validate checks that the claims belong to an active account whose tokens
// have not been revoked, and returns the current state (including the role
// from the database, so a demoted admin loses access immediately).
func Validate(claims *jwt.Claims) (State, error) {
	state, err := Lookup(claims.UserID)
	if err != nil {
		return State{}, ErrRevoked
	}
	// Status first: blocking also bumps token_version, and the client should
	// learn the account is inactive rather than that its session expired.
	if state.Status != "active" {
		return State{}, ErrInactive
	}
	if state.TokenVersion != claims.TokenVersion {
		return State{}, ErrRevoked
	}
	if claims.Type == jwt.TypeRefresh && IsRevoked(claims.ID) {
		return State{}, ErrRevoked
	}
	if err := CheckIdle(claims); err != nil {
		return State{}, err
	}
	return state, nil
}

// RevokeAll invalidates every access and refresh token of the user by bumping
// token_version. Use it on password change/reset, blocking, and deletion.
func RevokeAll(tx *gorm.DB, userID int64) error {
	if tx == nil {
		tx = db.DB
	}
	err := tx.Model(&models.User{}).Where("id = ?", userID).UpdateColumn("token_version", gorm.Expr("token_version + 1")).Error
	Invalidate(userID)
	return err
}

// RevokeRefresh revokes a single refresh token (logout or rotation).
func RevokeRefresh(claims *jwt.Claims) error {
	if claims == nil || claims.ID == "" || claims.ExpiresAt == nil {
		return nil
	}
	return db.DB.Clauses(clause.OnConflict{DoNothing: true}).Create(&models.RevokedToken{JTI: claims.ID, ExpiresAt: claims.ExpiresAt.Time}).Error
}

// ConsumeRefresh atomically marks a refresh token as used. It returns false
// when the token was already consumed or revoked, so two concurrent refreshes
// with the same token cannot both succeed.
func ConsumeRefresh(claims *jwt.Claims) (bool, error) {
	if claims == nil || claims.ID == "" || claims.ExpiresAt == nil {
		return false, nil
	}
	result := db.DB.Clauses(clause.OnConflict{DoNothing: true}).Create(&models.RevokedToken{JTI: claims.ID, ExpiresAt: claims.ExpiresAt.Time})
	if result.Error != nil {
		return false, result.Error
	}
	return result.RowsAffected == 1, nil
}

// IsRevoked reports whether a refresh token was logged out or already rotated.
func IsRevoked(jti string) bool {
	if jti == "" {
		return true
	}
	var count int64
	db.DB.Model(&models.RevokedToken{}).Where("jti = ?", jti).Count(&count)
	return count > 0
}
