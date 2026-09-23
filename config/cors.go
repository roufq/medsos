package config

import (
	"strings"

	"goravel/app/facades"
)

func init() {
	config := facades.Config()
	originValue := config.Env("CORS_ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173").(string)
	allowedOrigins := make([]string, 0)
	for _, origin := range strings.Split(originValue, ",") {
		if trimmed := strings.TrimSpace(origin); trimmed != "" && trimmed != "*" {
			allowedOrigins = append(allowedOrigins, trimmed)
		}
	}
	config.Add("cors", map[string]any{
		// Cross-Origin Resource Sharing (CORS) Configuration
		//
		// Here you may configure your settings for cross-origin resource sharing
		// or "CORS". This determines what cross-origin operations may execute
		// in web browsers. You are free to adjust these settings as needed.
		//
		// To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
		"paths":                []string{"api/*"},
		"allowed_methods":      []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		"allowed_origins":      allowedOrigins,
		"allowed_headers":      []string{"Authorization", "Content-Type", "Accept", "X-CSRF-Token"},
		"exposed_headers":      []string{},
		"max_age":              0,
		"supports_credentials": false,
	})
}
