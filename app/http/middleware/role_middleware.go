package middleware

import (
	"net/http"

	"goravel/app/models"

	goravelhttp "github.com/goravel/framework/contracts/http"
)

// RoleMiddleware checks if the authenticated user has the required role
func RoleMiddleware(requiredRole models.UserRole) goravelhttp.Middleware {
	return func(c goravelhttp.Context) {
		role, ok := c.Value("userRole").(models.UserRole)
		if !ok || role != requiredRole {
			c.Request().AbortWithStatusJson(http.StatusForbidden, goravelhttp.Json{"error": "Forbidden: Insufficient privileges"})
			return
		}

		c.Request().Next()
	}
}
