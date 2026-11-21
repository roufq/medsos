package middleware

import (
	http "github.com/goravel/framework/contracts/http"
	"goravel/app/models"
	"strings"
)

func StaffAllowed(role models.UserRole, method, path string) bool {
	if role == models.RoleAdmin {
		return true
	}
	if role != models.RoleModerator {
		return false
	}
	path = strings.Trim(strings.TrimPrefix(path, "/api/v1/"), "/")
	if method == "GET" {
		return path == "admin/stats" || path == "admin/posts" || path == "admin/reports" || path == "admin/conversation-reports"
	}
	parts := strings.Split(path, "/")
	if len(parts) == 3 && parts[0] == "admin" && parts[2] != "" {
		return (parts[1] == "posts" && (method == "PUT" || method == "DELETE")) || ((parts[1] == "reports" || parts[1] == "conversation-reports") && method == "PUT")
	}
	return len(parts) == 4 && parts[0] == "admin" && parts[1] == "posts" && parts[2] != "" && parts[3] == "restore" && method == "POST"
}
func StaffMiddleware() http.Middleware {
	return func(c http.Context) {
		role, _ := c.Value("userRole").(models.UserRole)
		if !StaffAllowed(role, c.Request().Method(), c.Request().Path()) {
			c.Request().AbortWithStatusJson(403, http.Json{"error": "Staff permission denied"})
			return
		}
		c.Request().Next()
	}
}
