package session

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"goravel/app/models"
	"goravel/pkg/db"
	"goravel/pkg/jwt"
	"os"
	"strconv"
	"time"
)

var ErrIdleExpired = errors.New("session expired due to inactivity")

func IdleTimeout() time.Duration {
	seconds, err := strconv.Atoi(os.Getenv("SESSION_IDLE_TIMEOUT_SECONDS"))
	if err != nil || seconds < 60 {
		seconds = 1800
	}
	return time.Duration(seconds) * time.Second
}
func Start(userID int64) (string, error) {
	var random [16]byte
	if _, err := rand.Read(random[:]); err != nil {
		return "", err
	}
	id := hex.EncodeToString(random[:])
	now := time.Now()
	return id, db.DB.Create(&models.LoginSession{ID: id, UserID: userID, LastActivity: now, ExpiresAt: now.Add(jwt.RefreshTTL)}).Error
}
func CheckIdle(claims *jwt.Claims) error {
	if claims.SessionID == "" {
		if claims.IssuedAt != nil && time.Since(claims.IssuedAt.Time) >= IdleTimeout() {
			return ErrIdleExpired
		}
		return nil
	}
	var row models.LoginSession
	if db.DB.Where("id = ? AND user_id = ?", claims.SessionID, claims.UserID).First(&row).Error != nil {
		return ErrRevoked
	}
	if idleExpired(row, time.Now()) {
		return ErrIdleExpired
	}
	return nil
}
func Touch(claims *jwt.Claims) error {
	if claims.SessionID == "" {
		return nil
	}
	now := time.Now()
	result := db.DB.Model(&models.LoginSession{}).Where("id = ? AND user_id = ? AND last_activity > ? AND expires_at > ?", claims.SessionID, claims.UserID, now.Add(-IdleTimeout()), now).UpdateColumn("last_activity", now)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return ErrIdleExpired
	}
	return nil
}
func End(id string) {
	if id != "" {
		db.DB.Where("id = ?", id).Delete(&models.LoginSession{})
	}
}
func Extend(id string) error {
	if id == "" {
		return nil
	}
	return db.DB.Model(&models.LoginSession{}).Where("id = ?", id).UpdateColumn("expires_at", time.Now().Add(jwt.RefreshTTL)).Error
}

func idleExpired(row models.LoginSession, now time.Time) bool {
	return now.Sub(row.LastActivity) >= IdleTimeout() || !now.Before(row.ExpiresAt)
}
