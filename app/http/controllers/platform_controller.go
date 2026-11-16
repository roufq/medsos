package controllers

import (
	goravelhttp "github.com/goravel/framework/contracts/http"
	"goravel/app/models"
	"goravel/pkg/db"
	"goravel/pkg/platform"
	"goravel/pkg/session"
	"gorm.io/gorm"
	"net/http"
	"strconv"
	"strings"
	"time"
)

func PlatformSettings(c goravelhttp.Context) goravelhttp.Response {
	settings, err := platform.Settings()
	if err != nil {
		return c.Response().Json(503, goravelhttp.Json{"error": "Pengaturan belum tersedia"})
	}
	return c.Response().Json(200, settings)
}

func UpdatePlatformSettings(c goravelhttp.Context) goravelhttp.Response {
	var input struct {
		Enabled *bool `json:"upload_limits_enabled"`
	}
	if c.Request().Bind(&input) != nil || input.Enabled == nil {
		return c.Response().Json(400, goravelhttp.Json{"error": "upload_limits_enabled wajib berupa boolean"})
	}
	setting := models.PlatformSetting{ID: 1, UploadLimitsEnabled: *input.Enabled}
	if db.DB.Save(&setting).Error != nil {
		return c.Response().Json(500, goravelhttp.Json{"error": "Gagal menyimpan pengaturan"})
	}
	return c.Response().Json(200, setting)
}

func (h *PostController) PublicFeed(c goravelhttp.Context) goravelhttp.Response {
	limit, err := strconv.Atoi(c.Request().Query("limit", "30"))
	offset, e2 := strconv.Atoi(c.Request().Query("offset", "0"))
	before, e3 := strconv.ParseInt(c.Request().Query("before_id", "0"), 10, 64)
	if err != nil || e2 != nil || e3 != nil || limit < 1 || limit > 50 || offset < 0 || offset > 10000 || before < 0 {
		return c.Response().Json(400, goravelhttp.Json{"error": "Invalid pagination"})
	}
	var posts []models.Post
	if id := c.Request().Query("user_id", ""); id != "" {
		target, parseErr := strconv.ParseInt(id, 10, 64)
		if parseErr != nil || target < 1 {
			return c.Response().Json(400, goravelhttp.Json{"error": "Invalid user"})
		}
		var user models.User
		if db.DB.First(&user, target).Error != nil || user.AccountStatus != "active" {
			return c.Response().Json(404, goravelhttp.Json{"error": "Profil tidak ditemukan"})
		}
		posts, err = h.postService.GetUserPosts(0, target)
	} else {
		posts, err = h.postService.GetFeed(0, limit, offset, before, false, c.Request().Query("kind", ""))
	}
	if err != nil {
		return c.Response().Json(500, goravelhttp.Json{"error": "Gagal memuat postingan"})
	}
	return c.Response().Json(200, posts)
}

func (h *PostController) PublicPost(c goravelhttp.Context) goravelhttp.Response {
	id, err := routePostID(c)
	if err != nil {
		return c.Response().Json(404, goravelhttp.Json{"error": "Postingan tidak ditemukan"})
	}
	post, err := h.postService.GetPost(0, id)
	if err != nil || !canViewPost(0, post) {
		return c.Response().Json(404, goravelhttp.Json{"error": "Postingan tidak ditemukan"})
	}
	return c.Response().Json(200, post)
}

func PublicProfile(c goravelhttp.Context) goravelhttp.Response {
	token := strings.TrimPrefix(c.Request().Route("id"), "@")
	var user models.User
	if token == "me" || db.DB.Where("(LOWER(username) = LOWER(?) OR public_hash = ?) AND account_status = 'active'", token, token).First(&user).Error != nil {
		return c.Response().Json(404, goravelhttp.Json{"error": "Profil tidak ditemukan"})
	}
	user.HidePrivateData()
	user.ProfileLocked = user.IsPrivate
	db.DB.Model(&models.Follow{}).Where("followed_id = ? AND status = 'accepted'", user.ID).Count(&user.FollowersCount)
	db.DB.Model(&models.Follow{}).Where("follower_id = ? AND status = 'accepted'", user.ID).Count(&user.FollowingCount)
	return c.Response().Json(200, user)
}

func AdminActivity(c goravelhttp.Context) goravelhttp.Response {
	var activities []models.UserActivity
	query := db.DB.Preload("User").Order("id desc").Limit(100)
	if id := c.Request().Query("user_id", ""); id != "" {
		query = query.Where("user_id = ?", id)
	}
	if query.Find(&activities).Error != nil {
		return c.Response().Json(500, goravelhttp.Json{"error": "Gagal membaca aktivitas"})
	}
	for i := range activities {
		activities[i].User.HidePrivateData()
	}
	return c.Response().Json(200, activities)
}

func AdminSessions(c goravelhttp.Context) goravelhttp.Response {
	var sessions []struct {
		UserID       int64     `json:"user_id"`
		Name         string    `json:"name"`
		Username     *string   `json:"username"`
		LastActivity time.Time `json:"last_activity"`
		ExpiresAt    time.Time `json:"expires_at"`
	}
	if db.DB.Table("login_sessions s").Select("s.user_id, users.name, users.username, s.last_activity, s.expires_at").Joins("JOIN users ON users.id = s.user_id").Order("s.last_activity desc").Limit(100).Scan(&sessions).Error != nil {
		return c.Response().Json(500, goravelhttp.Json{"error": "Gagal membaca sesi"})
	}
	return c.Response().Json(200, sessions)
}

func AdminPosts(c goravelhttp.Context) goravelhttp.Response {
	var posts []models.Post
	query := db.DB.Preload("User").Preload("Media").Preload("Link").Order("id desc").Limit(100)
	if raw := c.Request().Query("before_id", ""); raw != "" {
		id, err := strconv.ParseInt(raw, 10, 64)
		if err != nil || id < 1 {
			return c.Response().Json(400, goravelhttp.Json{"error": "Invalid cursor"})
		}
		query = query.Where("posts.id < ?", id)
	}
	if search := strings.TrimSpace(c.Request().Query("q", "")); search != "" {
		query = query.Where("title LIKE ? OR content LIKE ? OR EXISTS (SELECT 1 FROM users WHERE users.id = posts.user_id AND (users.name LIKE ? OR users.username LIKE ?))", "%"+search+"%", "%"+search+"%", "%"+search+"%", "%"+search+"%")
	}
	if query.Find(&posts).Error != nil {
		return c.Response().Json(500, goravelhttp.Json{"error": "Gagal membaca postingan"})
	}
	for i := range posts {
		posts[i].User.HidePrivateData()
	}
	return c.Response().Json(200, posts)
}

func (h *PostController) AdminDeletePost(c goravelhttp.Context) goravelhttp.Response {
	id, err := routePostID(c)
	if err != nil {
		return c.Response().Json(404, goravelhttp.Json{"error": "Postingan tidak ditemukan"})
	}
	if err = h.postService.DeletePostAsAdmin(id); err != nil {
		return c.Response().Json(400, goravelhttp.Json{"error": "Gagal menghapus postingan"})
	}
	return c.Response().Json(200, goravelhttp.Json{"ok": true})
}

func AdminSponsorPost(c goravelhttp.Context) goravelhttp.Response {
	id, err := routePostID(c)
	var input struct {
		Sponsored *bool `json:"is_sponsored"`
	}
	if err != nil || c.Request().Bind(&input) != nil || input.Sponsored == nil {
		return c.Response().Json(400, goravelhttp.Json{"error": "Data iklan tidak valid"})
	}
	query := db.DB.Model(&models.Post{}).Where("id = ? AND repost_of_id IS NULL", id)
	if *input.Sponsored {
		query = query.Where("visibility = 'public' AND EXISTS (SELECT 1 FROM users WHERE users.id = posts.user_id AND users.is_private = 0 AND users.account_status = 'active')")
	}
	result := query.Update("is_sponsored", *input.Sponsored)
	if result.Error != nil || result.RowsAffected == 0 {
		return c.Response().Json(400, goravelhttp.Json{"error": "Iklan harus berupa postingan publik dari akun publik aktif"})
	}
	return c.Response().Json(200, goravelhttp.Json{"ok": true})
}

func AdminVerifyUser(c goravelhttp.Context) goravelhttp.Response {
	id, err := strconv.ParseInt(c.Request().Route("id"), 10, 64)
	var input struct {
		Verified *bool `json:"verified"`
	}
	if err != nil || id < 1 || c.Request().Bind(&input) != nil || input.Verified == nil {
		return c.Response().Json(400, goravelhttp.Json{"error": "Data verifikasi tidak valid"})
	}
	var user models.User
	if db.DB.First(&user, id).Error != nil {
		return c.Response().Json(404, goravelhttp.Json{"error": "Pengguna tidak ditemukan"})
	}
	paid := user.SubscriptionPlan != "" && user.SubscriptionPlan != "free" && (user.SubscriptionExpiresAt == nil || user.SubscriptionExpiresAt.After(time.Now()))
	if db.DB.Model(&models.User{}).Where("id = ?", id).Updates(map[string]any{"admin_verified": *input.Verified, "is_blue_verified": *input.Verified || paid}).Error != nil {
		return c.Response().Json(500, goravelhttp.Json{"error": "Gagal menyimpan verifikasi"})
	}
	return c.Response().Json(200, goravelhttp.Json{"ok": true})
}

func (h *PostController) AdminDeleteUser(c goravelhttp.Context) goravelhttp.Response {
	id, err := strconv.ParseInt(c.Request().Route("id"), 10, 64)
	actor, _ := authenticatedUserID(c)
	if err != nil || id < 1 || id == actor {
		return c.Response().Json(400, goravelhttp.Json{"error": "Akun sendiri tidak dapat dihapus dari moderasi"})
	}
	var user models.User
	if db.DB.First(&user, id).Error != nil {
		return c.Response().Json(404, goravelhttp.Json{"error": "Pengguna tidak ditemukan"})
	}
	if user.Role == models.RoleAdmin {
		return c.Response().Json(400, goravelhttp.Json{"error": "Ubah peran administrator terlebih dahulu"})
	}
	// Tombstone the account: content becomes inaccessible and its sessions are revoked.
	err = db.DB.Transaction(func(tx *gorm.DB) error {
		return tx.Model(&models.User{}).Where("id = ?", id).Updates(map[string]any{"account_status": "deleted", "token_version": gorm.Expr("token_version + 1"), "name": "Akun dihapus", "bio": nil, "avatar_url": nil, "cover_url": nil}).Error
	})
	if err != nil {
		return c.Response().Json(http.StatusInternalServerError, goravelhttp.Json{"error": "Gagal menghapus akun"})
	}
	session.Invalidate(id)
	return c.Response().Json(200, goravelhttp.Json{"ok": true})
}
