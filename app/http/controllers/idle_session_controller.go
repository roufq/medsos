package controllers

import (
	goravelhttp "github.com/goravel/framework/contracts/http"
	"goravel/app/models"
	"goravel/pkg/db"
	"goravel/pkg/jwt"
	"goravel/pkg/session"
)

func SessionInfo(c goravelhttp.Context) goravelhttp.Response {
	claims, ok := c.Value("tokenClaims").(*jwt.Claims)
	if !ok {
		return c.Response().Json(401, goravelhttp.Json{"error": "Unauthorized"})
	}
	var row models.LoginSession
	if claims.SessionID != "" {
		if db.DB.Where("id = ?", claims.SessionID).First(&row).Error != nil {
			return c.Response().Json(401, goravelhttp.Json{"error": "Session unavailable"})
		}
	} else if claims.IssuedAt != nil {
		row.LastActivity = claims.IssuedAt.Time
	}
	return c.Response().Json(200, goravelhttp.Json{"session_id": claims.SessionID, "last_activity": row.LastActivity, "idle_timeout_seconds": int(session.IdleTimeout().Seconds())})
}
func SessionActivity(c goravelhttp.Context) goravelhttp.Response {
	claims, ok := c.Value("tokenClaims").(*jwt.Claims)
	if !ok {
		return c.Response().Json(401, goravelhttp.Json{"error": "Unauthorized"})
	}
	if err := session.Touch(claims); err != nil {
		return c.Response().Json(401, goravelhttp.Json{"error": "Session expired", "code": "session_idle_expired"})
	}
	return c.Response().Json(200, goravelhttp.Json{"active": true})
}
