package middleware

import (
	"net/http"
	"strings"

	"goravel/app/models"
	"goravel/pkg/csrf"
	"goravel/pkg/jwt"

	goravelhttp "github.com/goravel/framework/contracts/http"
)

// stateChangingMethods are the HTTP methods a cross-site request could use
// to actually mutate data - a CSRF check only matters for these.
var stateChangingMethods = map[string]bool{
	http.MethodPost: true, http.MethodPut: true, http.MethodPatch: true, http.MethodDelete: true,
}

// AuthMiddleware secures routes by verifying the access token, accepted
// either as a Bearer header (non-browser API clients) or the httpOnly
// "token" cookie the SPA and SSR web login flow both set.
//
// A Bearer header can't be attached by a cross-site request, so it needs no
// further check. A cookie can, so any state-changing request authenticated
// via the cookie must also echo the csrf_token cookie back in a header -
// see pkg/csrf for why that stops a cross-site request from mutating data.
func AuthMiddleware() goravelhttp.Middleware {
	return func(c goravelhttp.Context) {
		tokenStr := c.Request().Cookie("token")
		viaCookie := tokenStr != ""
		if !viaCookie {
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
			tokenStr = parts[1]
		}

		if viaCookie && stateChangingMethods[c.Request().Method()] {
			if !csrf.Valid(c.Request().Cookie(csrf.CookieName), c.Request().Header(csrf.HeaderName, "")) {
				c.Request().AbortWithStatusJson(http.StatusForbidden, goravelhttp.Json{"error": "CSRF token is missing or invalid"})
				return
			}
		}

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
		role, ok := c.Value("userRole").(models.UserRole)
		if !ok || role != models.RoleAdmin {
			c.Request().AbortWithStatusJson(http.StatusForbidden, goravelhttp.Json{"error": "Forbidden: Admin access required"})
			return
		}
		c.Request().Next()
	}
}
