package controllers

import (
	"fmt"
	"strconv"
	"time"

	http "github.com/goravel/framework/contracts/http"
	"goravel/app/models"
	"goravel/pkg/db"
	"gorm.io/gorm"
)

func activityFilters(c http.Context, query *gorm.DB, userColumn, dateColumn string) (*gorm.DB, int, error) {
	limit, err := strconv.Atoi(c.Request().Query("limit", "50"))
	if err != nil || limit < 1 || limit > 100 {
		return nil, 0, fmt.Errorf("Invalid limit")
	}
	if raw := c.Request().Query("user_id", ""); raw != "" {
		id, err := strconv.ParseInt(raw, 10, 64)
		if err != nil || id < 1 {
			return nil, 0, fmt.Errorf("Invalid user")
		}
		query = query.Where(userColumn+" = ?", id)
	}
	var from, to time.Time
	if raw := c.Request().Query("from", ""); raw != "" {
		from, err = time.Parse("2006-01-02", raw)
		if err != nil {
			return nil, 0, fmt.Errorf("Invalid start date")
		}
		query = query.Where(dateColumn+" >= ?", from)
	}
	if raw := c.Request().Query("to", ""); raw != "" {
		to, err = time.Parse("2006-01-02", raw)
		if err != nil || (!from.IsZero() && to.Before(from)) {
			return nil, 0, fmt.Errorf("Invalid end date")
		}
		query = query.Where(dateColumn+" < ?", to.AddDate(0, 0, 1))
	}
	return query, limit, nil
}

func AdminActivity(c http.Context) http.Response {
	query, limit, err := activityFilters(c, db.DB.Preload("User"), "user_id", "created_at")
	if err != nil {
		return c.Response().Json(400, http.Json{"error": err.Error()})
	}
	if raw := c.Request().Query("before_id", ""); raw != "" {
		id, err := strconv.ParseUint(raw, 10, 64)
		if err != nil || id == 0 {
			return c.Response().Json(400, http.Json{"error": "Invalid cursor"})
		}
		query = query.Where("id < ?", id)
	}
	if action := c.Request().Query("action", ""); action != "" {
		if action != "GET" && action != "POST" && action != "PUT" && action != "PATCH" && action != "DELETE" {
			return c.Response().Json(400, http.Json{"error": "Invalid action"})
		}
		query = query.Where("action = ?", action)
	}
	items := make([]models.UserActivity, 0)
	if query.Order("id desc").Limit(limit+1).Find(&items).Error != nil {
		return c.Response().Json(503, http.Json{"error": "Gagal membaca aktivitas"})
	}
	more := len(items) > limit
	if more {
		items = items[:limit]
	}
	for i := range items {
		items[i].User.HidePrivateData()
		if items[i].Description == "" {
			items[i].Description = models.ActivityDescription(items[i].Action, items[i].Target)
		}
	}
	return c.Response().Json(200, http.Json{"items": items, "has_more": more})
}

func AdminSessions(c http.Context) http.Response {
	query, limit, err := activityFilters(c, db.DB.Table("login_sessions s").Joins("JOIN users ON users.id=s.user_id"), "s.user_id", "s.last_activity")
	offset, e2 := strconv.Atoi(c.Request().Query("offset", "0"))
	if err != nil || e2 != nil || offset < 0 || offset > 1000000 {
		return c.Response().Json(400, http.Json{"error": "Invalid session filters"})
	}
	items := []struct {
		ID           string    `json:"id"`
		UserID       int64     `json:"user_id"`
		Name         string    `json:"name"`
		Username     *string   `json:"username"`
		LastActivity time.Time `json:"last_activity"`
		ExpiresAt    time.Time `json:"expires_at"`
	}{}
	if query.Select("s.id, s.user_id, users.name, users.username, s.last_activity, s.expires_at").Order("s.last_activity desc, s.id desc").Offset(offset).Limit(limit+1).Scan(&items).Error != nil {
		return c.Response().Json(503, http.Json{"error": "Gagal membaca sesi"})
	}
	more := len(items) > limit
	if more {
		items = items[:limit]
	}
	return c.Response().Json(200, http.Json{"items": items, "has_more": more})
}
