package services

import (
	"errors"
	"fmt"
	"strings"
	"unicode/utf8"

	"goravel/app/models"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

var ErrModerationReason = errors.New("Alasan moderasi harus terdiri dari 5–300 karakter")
var ErrModerationState = errors.New("Status konten sudah berubah. Muat ulang daftar konten")

// Caller owns the transaction so report resolution and moderation remain atomic.
func ModeratePost(tx *gorm.DB, adminID, postID int64, reason string, restore bool) error {
	var admin models.User
	if tx.First(&admin, adminID).Error != nil || (admin.Role != models.RoleAdmin && admin.Role != models.RoleModerator) || admin.AccountStatus != "active" {
		return ErrForbidden
	}
	reason = strings.TrimSpace(reason)
	if restore && reason == "" {
		reason = "Dipulihkan setelah peninjauan administrator"
	}
	if utf8.RuneCountInString(reason) < 5 || utf8.RuneCountInString(reason) > 300 {
		return ErrModerationReason
	}
	var post models.Post
	if err := tx.Unscoped().Clauses(clause.Locking{Strength: "UPDATE"}).First(&post, postID).Error; err != nil {
		return err
	}
	if post.DeletedAt.Valid != restore {
		return ErrModerationState
	}
	description, method := "Menghapus konten melalui moderasi", "DELETE"
	if restore {
		description, method = "Memulihkan konten melalui moderasi", "POST"
		if err := tx.Unscoped().Model(&post).Updates(map[string]any{"deleted_at": nil, "removal_reason": ""}).Error; err != nil {
			return err
		}
	} else {
		if err := tx.Model(&post).Update("removal_reason", reason).Error; err != nil {
			return err
		}
		if err := tx.Delete(&post).Error; err != nil {
			return err
		}
	}
	if err := tx.Create(&models.UserActivity{UserID: adminID, Action: method, Target: "/api/v1/admin/posts/" + post.PublicToken(), Description: description, Reason: reason}).Error; err != nil {
		return err
	}
	title := "Postingan"
	if post.Title != nil {
		title = *post.Title
	}
	runes := []rune(title)
	if len(runes) > 70 {
		title = string(runes[:70]) + "…"
	}
	message := fmt.Sprintf("Postingan “%s” dihapus oleh administrator. Alasan: %s", title, reason)
	kind, entityType := "post_removed", "moderation"
	if restore {
		message = fmt.Sprintf("Postingan “%s” dipulihkan oleh administrator. Alasan: %s", title, reason)
		kind, entityType = "post_restored", "post"
	}
	return tx.Create(&models.Notification{UserID: post.UserID, ActorID: &adminID, Type: kind, EntityType: entityType, EntityID: &post.ID, Message: message}).Error
}
