package middleware

import (
	http "github.com/goravel/framework/contracts/http"
	"goravel/app/models"
	"goravel/pkg/db"
	"log"
)

var activitySem = make(chan struct{}, 256)

// Store successful actions, never request bodies or private message contents.
func ActivityLog() http.Middleware {
	return func(c http.Context) {
		c.Request().Next()
		status := c.Response().Origin().Status()
		id, ok := c.Value("userID").(int64)
		if !ok || id < 1 || status < 200 || status >= 400 {
			return
		}
		target := c.Request().Path()
		method := c.Request().Method()
		if !models.ShouldRecordActivity(method, target) {
			return
		}
		if len(target) > 255 {
			target = target[:255]
		}
		entry := models.UserActivity{UserID: id, Action: method, Target: target, IPAddress: c.Request().Ip(), Description: models.ActivityDescription(method, target)}
		select {
		case activitySem <- struct{}{}:
			go func() {
				defer func() { <-activitySem }()
				if err := db.DB.Create(&entry).Error; err != nil {
					log.Printf("activity recording failed: %v", err)
				}
			}()
		default:
		}
	}
}
