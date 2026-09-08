package middleware

import (
	"net/http"
	"strings"

	"goravel/pkg/jwt"

	goravelhttp "github.com/goravel/framework/contracts/http"
)

// AuthMiddleware secures routes by verifying the Bearer access token
func AuthMiddleware() goravelhttp.Middleware {
	return func(c goravelhttp.Context) {
		authHeader := c.Request().Header("Authorization", "")
		if authHeader == "" {
			c.Request().AbortWithStatusJson(http.StatusUnauthorized, goravelhttp.Json{"error": "Authorization header is required"})
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.Request().AbortWithStatusJson(http.StatusUnauthorized, goravelhttp.Json{"error": "Authorization header format must be Bearer <token>"})
			return
		}

		tokenStr := parts[1]
		claims, err := jwt.ValidateAccessToken(tokenStr)
		if err != nil {
			c.Request().AbortWithStatusJson(http.StatusUnauthorized, goravelhttp.Json{"error": "Invalid or expired access token"})
			return
		}

		// Inject user context variables into the Gin context
		c.WithValue("userID", claims.UserID)
		c.WithValue("userEmail", claims.Email)
		c.WithValue("userRole", claims.Role)

		c.Request().Next()
	}
}

// AdminMiddleware ensures the authenticated user has an admin role
func AdminMiddleware() goravelhttp.Middleware {
	return func(c goravelhttp.Context) {
		role := c.Value("userRole")
		if role == nil || role.(string) != "admin" {
			c.Request().AbortWithStatusJson(http.StatusForbidden, goravelhttp.Json{"error": "Forbidden: Admin access required"})
			return
		}
		c.Request().Next()
	}
}
