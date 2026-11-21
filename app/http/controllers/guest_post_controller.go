package controllers

import (
	http "github.com/goravel/framework/contracts/http"
	"goravel/app/models"
	"goravel/app/services"
	"goravel/pkg/db"
	"goravel/pkg/hash"
	"goravel/pkg/platform"
	"gorm.io/gorm"
	"strings"
	"time"
	"unicode/utf8"
)

func GuestPost(c http.Context) http.Response {
	settings, e := platform.Settings()
	if e != nil || settings.Maintenance || !settings.GuestPosting {
		return consoleError(c, 403, "Guest posting is disabled")
	}
	var input struct {
		Content string `json:"content"`
		Title   string `json:"title"`
	}
	if c.Request().Bind(&input) != nil || utf8.RuneCountInString(strings.TrimSpace(input.Content)) < 2 || utf8.RuneCountInString(input.Content) > 5000 || utf8.RuneCountInString(input.Title) > 160 {
		return consoleError(c, 400, "Guest posts require 2-5000 characters")
	}
	e = db.DB.Transaction(func(tx *gorm.DB) error {
		var guest models.User
		err := tx.Where("is_guest = ?", true).First(&guest).Error
		if err != nil {
			password, e := services.RandomPassword()
			if e != nil {
				return e
			}
			encoded, e := hash.HashPassword(password)
			if e != nil {
				return e
			}
			token, e := models.NewPostHash()
			if e != nil {
				return e
			}
			username := "guest_" + token[:12]
			guest = models.User{Name: "Guest", Username: &username, Email: token + "@guest.invalid", Password: encoded, Role: models.RoleUser, AccountStatus: "active", IsGuest: true}
			if e = tx.Create(&guest).Error; e != nil {
				return e
			}
		}
		reason := "Guest submission awaiting administrator approval"
		post := models.Post{UserID: guest.ID, Title: &input.Title, Content: &input.Content, PostType: models.PostTypeText, Visibility: "public", DeletedAt: gorm.DeletedAt{Time: time.Now(), Valid: true}, RemovalReason: reason}
		if e := tx.Create(&post).Error; e != nil {
			return e
		}
		admins := []models.User{}
		if settings.AdminNotifications && tx.Where("role='admin' AND account_status='active'").Find(&admins).Error == nil {
			for _, admin := range admins {
				id := post.ID
				if e := tx.Create(&models.Notification{UserID: admin.ID, Type: "report", EntityType: "content_review", EntityID: &id, Message: "New guest post awaits review in admin content trash."}).Error; e != nil {
					return e
				}
			}
		}
		return nil
	})
	if e != nil {
		return consoleError(c, 503, "Cannot submit guest post")
	}
	return c.Response().Json(201, http.Json{"message": "Guest post submitted for moderation; it is not public yet"})
}
