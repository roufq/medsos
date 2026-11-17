package controllers

import (
	"errors"
	http "github.com/goravel/framework/contracts/http"
	"goravel/app/models"
	"goravel/app/services"
	"goravel/pkg/db"
	"gorm.io/gorm"
)

func moderatePostResponse(c http.Context, restore bool) http.Response {
	adminID, err := authenticatedUserID(c)
	if err != nil {
		return c.Response().Json(403, http.Json{"error": "Forbidden"})
	}
	var input struct {
		Reason string `json:"reason"`
	}
	if c.Request().Bind(&input) != nil {
		return c.Response().Json(400, http.Json{"error": "Invalid moderation request"})
	}
	token := c.Request().Route("id")
	var post models.Post
	if !postHashPattern.MatchString(token) || db.DB.Unscoped().Select("id").Where("public_hash = ?", token).First(&post).Error != nil {
		return c.Response().Json(404, http.Json{"error": "Postingan tidak ditemukan"})
	}
	err = db.DB.Transaction(func(tx *gorm.DB) error { return services.ModeratePost(tx, adminID, post.ID, input.Reason, restore) })
	if errors.Is(err, services.ErrForbidden) {
		return c.Response().Json(403, http.Json{"error": "Forbidden"})
	}
	if errors.Is(err, services.ErrModerationReason) {
		return c.Response().Json(400, http.Json{"error": err.Error()})
	}
	if errors.Is(err, services.ErrModerationState) {
		return c.Response().Json(409, http.Json{"error": err.Error()})
	}
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return c.Response().Json(404, http.Json{"error": "Postingan tidak ditemukan"})
	}
	if err != nil {
		return c.Response().Json(503, http.Json{"error": "Moderasi belum dapat disimpan. Silakan coba lagi."})
	}
	return c.Response().Json(200, http.Json{"ok": true})
}

func (h *PostController) AdminDeletePost(c http.Context) http.Response {
	return moderatePostResponse(c, false)
}
func AdminRestorePost(c http.Context) http.Response { return moderatePostResponse(c, true) }
