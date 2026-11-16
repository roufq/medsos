package models

import "strings"

// Root-level profile names must not shadow application routes.
func ReservedUsername(name string) bool {
	switch strings.ToLower(name) {
	case "home", "me", "admin", "api", "web", "frontend", "uploads", "login", "register", "forgot-password", "thanks", "profile", "settings", "pricing", "post", "posts", "u", "p", "embed", "videos", "shorts", "search", "explore", "shop", "saved", "network", "messages", "notifications", "analytics", "jobs", "robots.txt", "sitemap.xml":
		return true
	}
	return false
}
