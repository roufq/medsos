package middleware

import (
	http "github.com/goravel/framework/contracts/http"
	"goravel/app/models"
	"goravel/pkg/db"
	"goravel/pkg/platform"
	"strings"
)

func PublicMaintenance() http.Middleware {
	return func(c http.Context) {
		if strings.HasSuffix(c.Request().Path(), "/platform/settings") {
			c.Request().Next()
			return
		}
		s, e := platform.Settings()
		if e != nil {
			c.Request().AbortWithStatusJson(503, http.Json{"error": "Settings unavailable"})
			return
		}
		if s.Maintenance {
			c.Request().AbortWithStatusJson(503, http.Json{"error": "Maintenance mode", "message": s.MaintenanceMessage})
			return
		}
		c.Request().Next()
	}
}
func PlatformPolicy() http.Middleware {
	return func(c http.Context) {
		s, e := platform.Settings()
		if e != nil {
			c.Request().AbortWithStatusJson(503, http.Json{"error": "Platform settings unavailable"})
			return
		}
		path := c.Request().Path()
		role, _ := c.Value("userRole").(models.UserRole)
		if s.Maintenance && role != models.RoleAdmin && !strings.Contains(path, "/auth/") {
			c.Request().AbortWithStatusJson(503, http.Json{"error": "Maintenance mode", "message": s.MaintenanceMessage})
			return
		}
		if s.RequireEmailVerification && role != models.RoleAdmin && c.Request().Method() != "GET" && !strings.Contains(path, "/auth/") && !strings.HasSuffix(path, "/view") {
			id, _ := c.Value("userID").(int64)
			var user models.User
			if db.DB.Select("id,email_verified_at").First(&user, id).Error != nil || user.EmailVerifiedAt == nil {
				c.Request().AbortWithStatusJson(403, http.Json{"error": "Verify your email before using this feature", "code": "email_verification_required"})
				return
			}
		}
		c.Request().Next()
	}
}
