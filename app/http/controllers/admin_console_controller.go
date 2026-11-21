package controllers

import (
	"errors"
	http "github.com/goravel/framework/contracts/http"
	"goravel/app/models"
	"goravel/pkg/db"
	"goravel/pkg/hash"
	"goravel/pkg/platform"
	"goravel/pkg/session"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
	"net/mail"
	"net/url"
	"strconv"
	"strings"
	"time"
	"unicode/utf8"
)

func consoleError(c http.Context, status int, message string) http.Response {
	return c.Response().Json(status, http.Json{"error": message})
}
func consolePage(c http.Context) (int, int) {
	page, _ := strconv.Atoi(c.Request().Query("page", "1"))
	if page < 1 {
		page = 1
	}
	if page > 100000 {
		page = 100000
	}
	size := 20
	if settings, e := platform.Settings(); e == nil && settings.ItemsPerPage >= 10 && settings.ItemsPerPage <= 50 {
		size = settings.ItemsPerPage
	}
	return page, size
}
func consoleRange(c http.Context) time.Time {
	days, _ := strconv.Atoi(c.Request().Query("days", "30"))
	if days != 7 && days != 30 && days != 90 && days != 365 {
		days = 30
	}
	return time.Now().UTC().AddDate(0, 0, -days)
}
func safeConsoleURL(value string, local bool) bool {
	if value == "" {
		return true
	}
	if local && strings.HasPrefix(value, "/uploads/") && !strings.Contains(value, "\\") {
		return true
	}
	u, e := url.Parse(value)
	return e == nil && (u.Scheme == "https" || u.Scheme == "http") && u.Host != "" && u.User == nil
}
func AdminConsoleUsers(c http.Context) http.Response {
	page, size := consolePage(c)
	q := db.DB.Model(&models.User{})
	if search := strings.TrimSpace(c.Request().Query("q", "")); search != "" {
		value := "%" + search + "%"
		q = q.Where("name LIKE ? OR username LIKE ? OR email LIKE ?", value, value, value)
	}
	if role := c.Request().Query("role", ""); role != "" {
		q = q.Where("role = ?", role)
	}
	if state := c.Request().Query("status", ""); state != "" {
		if state == "verified" {
			q = q.Where("is_blue_verified = ?", true)
		} else {
			q = q.Where("account_status = ?", state)
		}
	}
	var total int64
	if q.Count(&total).Error != nil {
		return consoleError(c, 503, "Cannot load users")
	}
	items := []models.User{}
	if q.Select("users.*, (SELECT COUNT(*) FROM follows WHERE followed_id=users.id AND status='accepted') AS followers_count, (SELECT COUNT(*) FROM follows WHERE follower_id=users.id AND status='accepted') AS following_count").Order("users.id desc").Offset((page-1)*size).Limit(size).Find(&items).Error != nil {
		return consoleError(c, 503, "Cannot load users")
	}
	return c.Response().Json(200, http.Json{"items": items, "total": total, "page": page, "page_size": size})
}
func AdminConsoleUser(c http.Context) http.Response {
	id, parseErr := strconv.ParseInt(c.Request().Route("id"), 10, 64)
	var user models.User
	if parseErr != nil || id < 1 || db.DB.First(&user, id).Error != nil {
		return consoleError(c, 404, "User not found")
	}
	var posts, likes int64
	db.DB.Model(&models.Post{}).Where("user_id = ?", user.ID).Count(&posts)
	db.DB.Model(&models.PostLike{}).Joins("JOIN posts ON posts.id=post_likes.post_id AND posts.deleted_at IS NULL").Where("posts.user_id = ?", user.ID).Count(&likes)
	db.DB.Model(&models.Follow{}).Where("followed_id = ? AND status='accepted'", user.ID).Count(&user.FollowersCount)
	db.DB.Model(&models.Follow{}).Where("follower_id = ? AND status='accepted'", user.ID).Count(&user.FollowingCount)
	content := []models.Post{}
	db.DB.Where("user_id = ?", user.ID).Preload("Media").Order("id desc").Limit(12).Find(&content)
	activity := []models.UserActivity{}
	db.DB.Where("user_id = ?", user.ID).Order("id desc").Limit(20).Find(&activity)
	connections := []models.User{}
	db.DB.Joins("JOIN follows ON follows.followed_id=users.id").Where("follows.follower_id = ? AND follows.status='accepted'", user.ID).Limit(50).Find(&connections)
	for i := range connections {
		connections[i].HidePrivateData()
	}
	reports := []models.PostReport{}
	db.DB.Joins("JOIN posts ON posts.id=post_reports.post_id").Where("posts.user_id = ?", user.ID).Limit(50).Order("post_reports.id desc").Find(&reports)
	var lastSession models.LoginSession
	db.DB.Where("user_id = ?", user.ID).Order("created_at DESC").First(&lastSession)
	return c.Response().Json(200, http.Json{"last_login_at": lastSession.CreatedAt, "last_login_ip": lastSession.IPAddress, "user": user, "posts_count": posts, "likes_count": likes, "content": content, "activity": activity, "connections": connections, "reports": reports})
}

type consoleUserInput struct {
	Name              string          `json:"name"`
	Email             string          `json:"email"`
	Bio               string          `json:"bio"`
	Location          string          `json:"location"`
	AvatarURL         string          `json:"avatar_url"`
	CoverURL          string          `json:"cover_url"`
	Website           string          `json:"website"`
	Password          string          `json:"password"`
	Role              models.UserRole `json:"role"`
	TwoFactorRequired bool            `json:"two_factor_required"`
}

func validateConsoleUser(input consoleUserInput) error {
	if utf8.RuneCountInString(strings.TrimSpace(input.Name)) < 2 || utf8.RuneCountInString(input.Name) > 100 || utf8.RuneCountInString(input.Bio) > 2000 || utf8.RuneCountInString(input.Location) > 100 {
		return errors.New("Invalid name, bio, or location length")
	}
	address, e := mail.ParseAddress(input.Email)
	if e != nil || address.Address != input.Email || len(input.Email) > 100 {
		return errors.New("Invalid email")
	}
	if input.Role != models.RoleAdmin && input.Role != models.RoleUser && input.Role != models.RoleModerator {
		return errors.New("Invalid role")
	}
	for _, v := range []string{input.AvatarURL, input.CoverURL} {
		if len(v) > 500 || !safeConsoleURL(v, true) {
			return errors.New("Invalid image URL")
		}
	}
	if len(input.Website) > 500 || !safeConsoleURL(input.Website, false) {
		return errors.New("Invalid website URL")
	}
	return nil
}
func AdminSaveUser(c http.Context) http.Response {
	var input consoleUserInput
	if c.Request().Bind(&input) != nil {
		return consoleError(c, 400, "Invalid request")
	}
	input.Name = strings.TrimSpace(input.Name)
	input.Email = strings.ToLower(strings.TrimSpace(input.Email))
	if e := validateConsoleUser(input); e != nil {
		return consoleError(c, 400, e.Error())
	}
	actor, _ := authenticatedUserID(c)
	target, _ := strconv.ParseInt(c.Request().Route("id"), 10, 64)
	var user models.User
	e := db.DB.Transaction(func(tx *gorm.DB) error {
		// Serialize role changes so concurrent requests cannot remove the last administrator.
		admins := []models.User{}
		if e := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("role = ?", models.RoleAdmin).Order("id").Find(&admins).Error; e != nil {
			return e
		}
		if e := tx.First(&user, target).Error; e != nil {
			return e
		}
		if user.AccountStatus == "deleted" {
			return errors.New("Deleted accounts cannot be edited")
		}
		if user.Role != input.Role && (user.ID == actor || (user.Role == models.RoleAdmin && len(admins) <= 1)) {
			return errors.New("Cannot change your own role or remove the last administrator")
		}
		settings, err := platform.Settings()
		if err != nil {
			return err
		}
		if input.Role == models.RoleAdmin && settings.RequireAdminTwoFactor && !user.TwoFactorEnabled {
			return errors.New("Set up 2FA before promoting to administrator")
		}
		if input.TwoFactorRequired && !user.TwoFactorEnabled {
			return errors.New("User must set up 2FA before it can be required")
		}
		values := map[string]any{"name": input.Name, "email": input.Email, "bio": input.Bio, "location": input.Location, "avatar_url": input.AvatarURL, "cover_url": input.CoverURL, "website": input.Website, "role": input.Role, "two_factor_required": input.TwoFactorRequired}
		if user.Role != input.Role || user.Email != input.Email {
			values["token_version"] = gorm.Expr("token_version + 1")
		}
		if user.Email != input.Email {
			values["email_verified_at"] = nil
		}
		return tx.Model(&user).Updates(values).Error
	})
	if e != nil {
		return consoleError(c, 400, "User not saved: "+e.Error())
	}
	session.Invalidate(target)
	return c.Response().Json(200, http.Json{"ok": true})
}
func AdminCreateUser(c http.Context) http.Response {
	var input consoleUserInput
	if c.Request().Bind(&input) != nil {
		return consoleError(c, 400, "Invalid request")
	}
	input.Email = strings.ToLower(strings.TrimSpace(input.Email))
	if e := validateConsoleUser(input); e != nil {
		return consoleError(c, 400, e.Error())
	}
	if len(input.Password) < 8 || len(input.Password) > 72 {
		return consoleError(c, 400, "Password must contain 8-72 characters")
	}
	settings, settingsErr := platform.Settings()
	if settingsErr != nil {
		return consoleError(c, 503, "Settings unavailable")
	}
	if input.Role == models.RoleAdmin && settings.RequireAdminTwoFactor {
		return consoleError(c, 409, "Create a regular user, enroll 2FA, then promote to administrator")
	}
	encoded, e := hash.HashPassword(input.Password)
	if e != nil {
		return consoleError(c, 503, "Cannot secure password")
	}
	username := models.GenerateUsername(db.DB, input.Name, input.Email, 0)
	user := models.User{Name: input.Name, Username: &username, Email: input.Email, Password: encoded, Role: input.Role, AccountStatus: "active", SubscriptionPlan: "free", Bio: &input.Bio, Location: &input.Location, AvatarURL: &input.AvatarURL, CoverURL: &input.CoverURL, Website: &input.Website}
	if db.DB.Create(&user).Error != nil {
		return consoleError(c, 409, "Cannot create user; email may already exist")
	}
	return c.Response().Json(201, user)
}
func AdminPurgePost(c http.Context) http.Response {
	var input struct {
		Reason  string `json:"reason"`
		Confirm string `json:"confirm"`
	}
	if c.Request().Bind(&input) != nil || input.Confirm != "DELETE" || utf8.RuneCountInString(strings.TrimSpace(input.Reason)) < 5 || utf8.RuneCountInString(input.Reason) > 300 {
		return consoleError(c, 400, "Type DELETE and provide a reason (5-300 characters)")
	}
	token := c.Request().Route("id")
	if !postHashPattern.MatchString(token) {
		return consoleError(c, 404, "Content not found")
	}
	actor, _ := authenticatedUserID(c)
	e := db.DB.Transaction(func(tx *gorm.DB) error {
		var post models.Post
		if e := tx.Unscoped().Clauses(clause.Locking{Strength: "UPDATE"}).Where("public_hash = ?", token).First(&post).Error; e != nil {
			return e
		}
		if !post.DeletedAt.Valid {
			return errors.New("Move the content to trash before deleting permanently")
		}
		if e := tx.Unscoped().Model(&models.Post{}).Where("repost_of_id = ?", post.ID).Update("repost_of_id", nil).Error; e != nil {
			return e
		}
		for _, model := range []any{&models.PostReport{}, &models.PostLike{}, &models.PostComment{}, &models.PostView{}, &models.PostShare{}, &models.SavedPost{}, &models.PostMedia{}, &models.PostLink{}, &models.PostMention{}, &models.PostHashtag{}, &models.ShopProduct{}} {
			if e := tx.Where("post_id = ?", post.ID).Delete(model).Error; e != nil {
				return e
			}
		}
		if e := tx.Unscoped().Delete(&post).Error; e != nil {
			return e
		}
		return tx.Create(&models.UserActivity{UserID: actor, Action: "DELETE", Target: "/api/v1/admin/posts/" + token + "/purge", Description: "Permanently deleted content", Reason: input.Reason, IPAddress: c.Request().Ip()}).Error
	})
	if e != nil {
		return consoleError(c, 409, "Cannot permanently delete content: "+e.Error())
	}
	return c.Response().Json(200, http.Json{"ok": true})
}
func AdminEditPost(c http.Context) http.Response {
	var input struct {
		Title    string `json:"title"`
		Content  string `json:"content"`
		Featured *bool  `json:"is_featured"`
	}
	if c.Request().Bind(&input) != nil || utf8.RuneCountInString(input.Title) > 255 || utf8.RuneCountInString(input.Content) > 100000 {
		return consoleError(c, 400, "Invalid content")
	}
	var post models.Post
	if !postHashPattern.MatchString(c.Request().Route("id")) || db.DB.Where("public_hash = ?", c.Request().Route("id")).First(&post).Error != nil {
		return consoleError(c, 404, "Content not found")
	}
	if input.Featured != nil && c.Value("userRole") != models.RoleAdmin {
		return consoleError(c, 403, "Only administrators can feature content")
	}
	values := map[string]any{"title": input.Title, "content": input.Content}
	if input.Featured != nil {
		values = map[string]any{"is_featured": *input.Featured}
	}
	if db.DB.Model(&post).Updates(values).Error != nil {
		return consoleError(c, 503, "Cannot save content")
	}
	return c.Response().Json(200, http.Json{"ok": true})
}
func AdminConsoleSettings(c http.Context) http.Response {
	if c.Request().Method() == "GET" {
		settings, e := platform.Settings()
		if e != nil {
			return consoleError(c, 503, "Settings unavailable")
		}
		return c.Response().Json(200, settings)
	}
	var input models.PlatformSetting
	if c.Request().Bind(&input) != nil {
		return consoleError(c, 400, "Invalid settings")
	}
	if utf8.RuneCountInString(input.SiteName) > 100 || utf8.RuneCountInString(input.Description) > 500 || utf8.RuneCountInString(input.MaintenanceMessage) > 500 || len(input.LogoURL) > 500 || !safeConsoleURL(input.LogoURL, true) {
		return consoleError(c, 400, "Invalid site information")
	}
	if input.Language != "id" && input.Language != "en" {
		return consoleError(c, 400, "Unsupported language")
	}
	if _, e := time.LoadLocation(input.Timezone); e != nil {
		return consoleError(c, 400, "Invalid timezone")
	}
	if input.ItemsPerPage < 10 || input.ItemsPerPage > 50 {
		return consoleError(c, 400, "Items per page must be 10-50")
	}
	if input.DefaultFeed != "home" && input.DefaultFeed != "explore" {
		return consoleError(c, 400, "Invalid default feed")
	}
	if input.RequireAdminTwoFactor {
		var count int64
		db.DB.Model(&models.User{}).Where("role = 'admin' AND account_status='active' AND two_factor_enabled = ?", false).Count(&count)
		if count > 0 {
			return consoleError(c, 409, "All active administrators must set up 2FA before enforcement")
		}
	}
	input.ID = 1
	if db.DB.Save(&input).Error != nil {
		return consoleError(c, 503, "Cannot save settings")
	}
	return c.Response().Json(200, input)
}
func AdminRevokeSession(c http.Context) http.Response {
	id := c.Request().Route("id")
	if len(id) > 128 || id == "" {
		return consoleError(c, 400, "Invalid session")
	}
	result := db.DB.Where("id = ?", id).Delete(&models.LoginSession{})
	if result.Error != nil {
		return consoleError(c, 503, "Cannot revoke session")
	}
	return c.Response().Json(200, http.Json{"ok": true})
}
func AdminAnalytics(c http.Context) http.Response {
	since := consoleRange(c)
	counts := map[string]int64{}
	queries := map[string]*gorm.DB{"users": db.DB.Model(&models.User{}), "content": db.DB.Model(&models.Post{}), "videos": db.DB.Model(&models.PostMedia{}).Where("media_type = 'video'"), "likes": db.DB.Model(&models.PostLike{}), "comments": db.DB.Model(&models.PostComment{}), "views": db.DB.Model(&models.PostView{}), "verified": db.DB.Model(&models.User{}).Where("is_blue_verified = ?", true), "active": db.DB.Model(&models.User{}).Where("account_status='active'"), "blocked": db.DB.Model(&models.User{}).Where("account_status='blocked'"), "ads": db.DB.Model(&models.AdCampaign{}), "visits": db.DB.Model(&models.TrafficEvent{}).Where("kind='visit' AND created_at >= ?", since), "clicks": db.DB.Model(&models.TrafficEvent{}).Where("kind='click' AND created_at >= ?", since)}
	for key, q := range queries {
		var count int64
		if q.Count(&count).Error != nil {
			return consoleError(c, 503, "Analytics unavailable; update the backend database")
		}
		counts[key] = count
	}
	type day struct {
		Date  string `json:"date"`
		Count int64  `json:"count"`
	}
	series := map[string][]day{}
	for key, table := range map[string]string{"users": "users", "posts": "posts", "views": "post_views", "clicks": "traffic_events"} {
		items := []day{}
		q := db.DB.Table(table).Select("DATE(created_at) AS date, COUNT(*) AS count").Where("created_at >= ?", since)
		if key == "clicks" {
			q = q.Where("kind='click'")
		}
		if q.Group("DATE(created_at)").Order("date").Scan(&items).Error != nil {
			return consoleError(c, 503, "Cannot load chart")
		}
		series[key] = items
	}
	type source struct {
		Source string `json:"source"`
		Count  int64  `json:"count"`
	}
	sources := []source{}
	if db.DB.Model(&models.TrafficEvent{}).Select("source, COUNT(*) AS count").Where("kind='visit' AND created_at >= ?", since).Group("source").Scan(&sources).Error != nil {
		return consoleError(c, 503, "Cannot load traffic sources")
	}
	top := []models.Post{}
	db.DB.Select("posts.*, (SELECT COUNT(*) FROM post_views WHERE post_id=posts.id) AS views_count, (SELECT COUNT(*) FROM post_likes WHERE post_id=posts.id) AS likes_count").Preload("Media").Order("views_count desc").Limit(5).Find(&top)
	return c.Response().Json(200, http.Json{"counts": counts, "series": series, "sources": sources, "top_content": top, "since": since, "traffic_note": "Traffic and ad events are recorded from feature activation; counts are not unique visitors."})
}
