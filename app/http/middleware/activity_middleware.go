package middleware

import (
	http "github.com/goravel/framework/contracts/http"
	"goravel/app/models"
	"goravel/pkg/db"
	"log"
)

// Store successful actions, never request bodies or private message contents.
func ActivityLog() http.Middleware {
	return func(c http.Context) {
		c.Request().Next()
		status := c.Response().Origin().Status()
		id, ok := c.Value("userID").(int64)
		if !ok || id < 1 || c.Request().Method() == "GET" || status < 200 || status >= 400 {
			return
		}
		target := c.Request().Path()
		if len(target) > 255 {
			target = target[:255]
		}
		if err := db.DB.Create(&models.UserActivity{UserID: id, Action: c.Request().Method(), Target: target}).Error; err != nil {
			log.Printf("activity recording failed: %v", err)
		}
	}
}
