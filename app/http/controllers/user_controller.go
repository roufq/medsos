package controllers

import (
	"bytes"
	"net/http"
	"strconv"
	"strings"
	"time"

	"goravel/app/dto"
	"goravel/app/models"
	"goravel/app/services"
	"goravel/pkg/csrf"
	"goravel/pkg/db"
	"goravel/pkg/jwt"
	"goravel/pkg/session"
	"goravel/resources/views/backend"

	goravelhttp "github.com/goravel/framework/contracts/http"
)

type UserController struct {
	userService services.UserService
	authService services.AuthService
	postService services.PostService
}

func NewUserController(userService services.UserService, authService services.AuthService, postService services.PostService) *UserController {
	return &UserController{
		userService: userService,
		authService: authService,
		postService: postService,
	}
}

// getWebUser is a helper to authenticate web SSR views using cookies
func (h *UserController) getWebUser(c goravelhttp.Context) (*models.User, goravelhttp.Response) {
	tokenStr := c.Request().Cookie("token")
	if tokenStr == "" {
		// Attempt session recovery using refresh token
		refTokenStr := c.Request().Cookie("refresh_token")
		if refTokenStr == "" {
			return nil, c.Response().Redirect(http.StatusSeeOther, "/web/login")
		}

		res, refreshErr := h.authService.Refresh(&dto.RefreshRequest{RefreshToken: refTokenStr})
		if refreshErr != nil {
			clearAuthCookies(c)
			return nil, c.Response().Redirect(http.StatusSeeOther, "/web/login")
		}

		setAuthCookies(c, res.AccessToken, res.RefreshToken)
		tokenStr = res.AccessToken
	}

	claims, err := jwt.ValidateAccessToken(tokenStr)
	if err != nil {
		return nil, c.Response().Redirect(http.StatusSeeOther, "/web/login")
	}
	if _, err := session.Validate(claims); err != nil {
		clearAuthCookies(c)
		return nil, c.Response().Redirect(http.StatusSeeOther, "/web/login")
	}

	if !csrf.SafeMethod(c.Request().Method()) && c.Request().Header("Sec-Fetch-Site") != "same-origin" && !csrf.Valid(c.Request().Cookie(csrf.CookieName), c.Request().Header(csrf.HeaderName), c.Request().Input("_csrf")) {
		return nil, c.Response().String(http.StatusForbidden, "invalid CSRF token")
	}
	user, err := h.userService.GetByID(claims.UserID)
	if err != nil {
		return nil, c.Response().Redirect(http.StatusSeeOther, "/web/login")
	}

	return user, nil
}

// ==========================================
// REST API Controllers (JSON)
// ==========================================

func (h *UserController) GetProfileAPI(c goravelhttp.Context) goravelhttp.Response {
	viewerID, viewerErr := authenticatedUserID(c)
	if viewerErr != nil {
		return c.Response().Json(http.StatusUnauthorized, goravelhttp.Json{"error": "Unauthorized"})
	}
	var targetID int64
	idParam := c.Request().Route("id")

	if idParam != "" && idParam != "me" {
		parsed, err := strconv.ParseInt(idParam, 10, 64)
		if err != nil {
			// Not numeric: resolve @username links (mentions) to an ID.
			var found models.User
			if db.DB.Select("id").Where("LOWER(username) = LOWER(?)", strings.TrimPrefix(idParam, "@")).First(&found).Error != nil {
				return c.Response().Json(http.StatusNotFound, goravelhttp.Json{"error": "User not found"})
			}
			parsed = found.ID
		}
		targetID = parsed
	} else {
		// Default to authenticated context user
		ctxID := c.Value("userID")
		if ctxID == nil {
			return c.Response().Json(http.StatusUnauthorized, goravelhttp.Json{"error": "Unauthorized context"})
		}
		targetID = ctxID.(int64)
	}

	user, err := h.userService.GetByID(targetID)
	if err != nil {
		return c.Response().Json(http.StatusNotFound, goravelhttp.Json{"error": "User not found"})
	}
	if user.AccountStatus != "active" {
		return c.Response().Json(http.StatusNotFound, goravelhttp.Json{"error": "User not found"})
	}
	if viewerID != targetID {
		// Someone the viewer blocked stays visible (so they can unblock);
		// someone who blocked the viewer does not.
		var blockedByMe, blockedMe int64
		db.DB.Model(&models.UserBlock{}).Where("blocker_id = ? AND blocked_id = ?", viewerID, targetID).Count(&blockedByMe)
		db.DB.Model(&models.UserBlock{}).Where("blocker_id = ? AND blocked_id = ?", targetID, viewerID).Count(&blockedMe)
		if blockedMe > 0 {
			return c.Response().Json(http.StatusNotFound, goravelhttp.Json{"error": "User not found"})
		}
		user.IsBlockedByMe = blockedByMe > 0
		var follow models.Follow
		if db.DB.Where("follower_id = ? AND followed_id = ?", viewerID, targetID).First(&follow).Error == nil {
			user.FollowStatus = follow.Status
		}
	}
	db.DB.Model(&models.Follow{}).Where("followed_id = ? AND status = 'accepted'", targetID).Count(&user.FollowersCount)
	db.DB.Model(&models.Follow{}).Where("follower_id = ? AND status = 'accepted'", targetID).Count(&user.FollowingCount)
	user.IsFollowedByMe = user.FollowStatus == "accepted"
	if viewerID != targetID {
		user.HidePrivateData()
		if user.IsPrivate && !user.IsFollowedByMe {
			user.ProfileLocked = true
		}
	}

	return c.Response().Json(http.StatusOK, user)
}

func (h *UserController) UpdateProfileAPI(c goravelhttp.Context) goravelhttp.Response {
	ctxID := c.Value("userID")
	if ctxID == nil {
		return c.Response().Json(http.StatusUnauthorized, goravelhttp.Json{"error": "Unauthorized context"})
	}
	userID := ctxID.(int64)

	var req struct {
		Name      string  `json:"name"`
		Bio       *string `json:"bio"`
		AvatarURL *string `json:"avatar_url"`
		CoverURL  *string `json:"cover_url"`
		Title     *string `json:"title"`
		Company   *string `json:"company"`
		Location  *string `json:"location"`
		Website   *string `json:"website"`
	}

	if err := c.Request().Bind(&req); err != nil {
		return c.Response().Json(http.StatusBadRequest, goravelhttp.Json{"error": err.Error()})
	}

	user, err := h.userService.UpdateProfile(userID, req.Name, req.Bio, req.AvatarURL, req.CoverURL, req.Title, req.Company, req.Location, req.Website)
	if err != nil {
		return c.Response().Json(http.StatusBadRequest, goravelhttp.Json{"error": err.Error()})
	}

	return c.Response().Json(http.StatusOK, user)
}

func (h *UserController) AdminGetUsersAPI(c goravelhttp.Context) goravelhttp.Response {
	users, err := h.userService.ListAll()
	if err != nil {
		return c.Response().Json(http.StatusInternalServerError, goravelhttp.Json{"error": "Failed to load users"})
	}
	return c.Response().Json(http.StatusOK, users)
}

func (h *UserController) AdminGetStatsAPI(c goravelhttp.Context) goravelhttp.Response {
	now := time.Now()
	startToday := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	weekStart := startToday.AddDate(0, 0, -6)

	counts := map[string]int64{}

	var userCounts struct {
		Total   int64
		Active  int64
		Today   int64
		Blocked int64
	}
	if err := db.DB.Raw(
		`SELECT COUNT(*) AS total,
			COALESCE(SUM(CASE WHEN account_status = 'active' THEN 1 ELSE 0 END), 0) AS active,
			COALESCE(SUM(CASE WHEN created_at >= ? THEN 1 ELSE 0 END), 0) AS today,
			COALESCE(SUM(CASE WHEN account_status = 'blocked' THEN 1 ELSE 0 END), 0) AS blocked
		FROM users`, startToday).Scan(&userCounts).Error; err != nil {
		return c.Response().Json(http.StatusInternalServerError, goravelhttp.Json{"error": "Failed to load stats"})
	}
	counts["total_users"], counts["active_users"], counts["new_users_today"], counts["blocked_users"] =
		userCounts.Total, userCounts.Active, userCounts.Today, userCounts.Blocked

	var postCounts struct {
		Total int64
		Today int64
	}
	if err := db.DB.Raw(
		`SELECT COUNT(*) AS total,
			COALESCE(SUM(CASE WHEN created_at >= ? THEN 1 ELSE 0 END), 0) AS today
		FROM posts`, startToday).Scan(&postCounts).Error; err != nil {
		return c.Response().Json(http.StatusInternalServerError, goravelhttp.Json{"error": "Failed to load stats"})
	}
	counts["total_posts"], counts["new_posts_today"] = postCounts.Total, postCounts.Today

	var reportCounts struct {
		Pending  int64
		Today    int64
		Resolved int64
	}
	if err := db.DB.Raw(
		`SELECT COALESCE(SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END), 0) AS pending,
			COALESCE(SUM(CASE WHEN created_at >= ? THEN 1 ELSE 0 END), 0) AS today,
			COALESCE(SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END), 0) AS resolved
		FROM post_reports`, startToday).Scan(&reportCounts).Error; err != nil {
		return c.Response().Json(http.StatusInternalServerError, goravelhttp.Json{"error": "Failed to load stats"})
	}
	counts["pending_reports"], counts["reports_today"], counts["resolved_reports"] =
		reportCounts.Pending, reportCounts.Today, reportCounts.Resolved

	type dailyGrowth struct {
		Date  string `json:"date"`
		Label string `json:"label"`
		Users int64  `json:"users"`
		Posts int64  `json:"posts"`
	}
	type dailyCount struct {
		Day   string
		Count int64
	}
	userByDay := map[string]int64{}
	var userDaily []dailyCount
	if err := db.DB.Raw(`SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS day, COUNT(*) AS count FROM users WHERE created_at >= ? GROUP BY day`, weekStart).Scan(&userDaily).Error; err != nil {
		return c.Response().Json(http.StatusInternalServerError, goravelhttp.Json{"error": "Failed to load user growth"})
	}
	for _, d := range userDaily {
		userByDay[d.Day] = d.Count
	}
	postByDay := map[string]int64{}
	var postDaily []dailyCount
	if err := db.DB.Raw(`SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS day, COUNT(*) AS count FROM posts WHERE created_at >= ? GROUP BY day`, weekStart).Scan(&postDaily).Error; err != nil {
		return c.Response().Json(http.StatusInternalServerError, goravelhttp.Json{"error": "Failed to load post growth"})
	}
	for _, d := range postDaily {
		postByDay[d.Day] = d.Count
	}
	growth := make([]dailyGrowth, 0, 7)
	for daysAgo := 6; daysAgo >= 0; daysAgo-- {
		dayStart := startToday.AddDate(0, 0, -daysAgo)
		key := dayStart.Format("2006-01-02")
		growth = append(growth, dailyGrowth{Date: key, Label: dayStart.Format("Mon"), Users: userByDay[key], Posts: postByDay[key]})
	}

	var recentUsers []models.User
	if err := db.DB.Order("created_at desc").Limit(5).Find(&recentUsers).Error; err != nil {
		return c.Response().Json(http.StatusInternalServerError, goravelhttp.Json{"error": "Failed to load recent users"})
	}
	return c.Response().Json(http.StatusOK, goravelhttp.Json{
		"total_users":       counts["total_users"],
		"active_users":      counts["active_users"],
		"active_now":        counts["active_users"],
		"new_users_today":   counts["new_users_today"],
		"new_today":         counts["new_users_today"],
		"total_posts":       counts["total_posts"],
		"new_posts_today":   counts["new_posts_today"],
		"pending_reports":   counts["pending_reports"],
		"reported_accounts": counts["pending_reports"],
		"reports_today":     counts["reports_today"],
		"resolved_reports":  counts["resolved_reports"],
		"blocked_users":     counts["blocked_users"],
		"growth":            growth,
		"recent_users":      recentUsers,
	})
}

// ==========================================
// SSR Web Controllers (HTML)
// ==========================================

func (h *UserController) ShowProfileWeb(c goravelhttp.Context) goravelhttp.Response {
	currentUser, resp := h.getWebUser(c)
	if resp != nil {
		return resp
	}

	targetUser := currentUser
	idParam := c.Request().Route("id")
	if idParam != "" && idParam != "me" {
		parsed, err := strconv.ParseInt(idParam, 10, 64)
		if err == nil {
			fetched, err := h.userService.GetByID(parsed)
			if err == nil && fetched.AccountStatus == "active" && !blockedBetween(currentUser.ID, fetched.ID) && (!fetched.IsPrivate || currentUser.ID == fetched.ID || acceptedFollower(currentUser.ID, fetched.ID)) {
				targetUser = fetched
			}
		}
	}

	// Fetch target user posts
	posts, _ := h.postService.GetUserPosts(currentUser.ID, targetUser.ID)

	var buf bytes.Buffer
	data := backend.ProfileData{
		User:  *targetUser,
		Posts: posts,
	}
	_ = backend.RenderProfile(&buf, data)
	return c.Response().Data(http.StatusOK, "text/html; charset=utf-8", buf.Bytes())
}

func (h *UserController) ShowAdminDashboardWeb(c goravelhttp.Context) goravelhttp.Response {
	user, resp := h.getWebUser(c)
	if resp != nil {
		return resp
	}

	if user.Role != models.RoleAdmin {
		return c.Response().String(http.StatusForbidden, "Forbidden: Only administrators can access this area.")
	}

	var buf bytes.Buffer
	
	var stats backend.DashboardStats
	db.DB.Model(&models.User{}).Count(&stats.TotalUsers)
	db.DB.Model(&models.Post{}).Where("created_at > ?", time.Now().Add(-30*24*time.Hour)).Count(&stats.NewPosts)
	db.DB.Model(&models.PostReport{}).Where("status = ?", "pending").Count(&stats.ActiveReports)
	db.DB.Model(&models.ShopProduct{}).Count(&stats.TotalShops)
	
	_ = backend.RenderDashboardAdminIkhtisarV3NewBrand(&buf, user, stats)

	return c.Response().Data(http.StatusOK, "text/html; charset=utf-8", buf.Bytes())
}

func (h *UserController) ShowAdminUsersWeb(c goravelhttp.Context) goravelhttp.Response {
	user, resp := h.getWebUser(c)
	if resp != nil {
		return resp
	}

	if user.Role != models.RoleAdmin {
		return c.Response().String(http.StatusForbidden, "Forbidden: Only administrators can access this area.")
	}

	allUsers, _ := h.userService.ListAll()
	var buf bytes.Buffer
	_ = backend.RenderDashboardAdminManajemenPenggunaV2(&buf, allUsers, user)
	return c.Response().Data(http.StatusOK, "text/html; charset=utf-8", buf.Bytes())
}

func (h *UserController) ShowAdminPostsWeb(c goravelhttp.Context) goravelhttp.Response {
	user, resp := h.getWebUser(c)
	if resp != nil {
		return resp
	}

	if user.Role != models.RoleAdmin {
		return c.Response().String(http.StatusForbidden, "Forbidden: Only administrators can access this area.")
	}

	posts, _ := h.postService.GetFeed(user.ID, 100, 0, 0, false)
	var buf bytes.Buffer
	_ = backend.RenderDashboardAdminPosts(&buf, posts, user)
	return c.Response().Data(http.StatusOK, "text/html; charset=utf-8", buf.Bytes())
}

func (h *UserController) HandleAdminDeletePostWeb(c goravelhttp.Context) goravelhttp.Response {
	user, resp := h.getWebUser(c)
	if resp != nil {
		return resp
	}

	if user.Role != models.RoleAdmin {
		return c.Response().String(http.StatusForbidden, "Forbidden: Only administrators can access this area.")
	}

	postID, err := routePostID(c)
	if err != nil {
		return c.Response().String(http.StatusBadRequest, "Invalid post ID")
	}

	if err := h.postService.DeletePostAsAdmin(postID); err != nil {
		return c.Response().String(http.StatusInternalServerError, "Failed to delete post")
	}

	return c.Response().Redirect(http.StatusSeeOther, "/web/admin/posts")
}

func (h *UserController) ShowAdminModerationWeb(c goravelhttp.Context) goravelhttp.Response {
	user, resp := h.getWebUser(c)
	if resp != nil {
		return resp
	}

	if user.Role != models.RoleAdmin {
		return c.Response().String(http.StatusForbidden, "Forbidden: Only administrators can access this area.")
	}

	var buf bytes.Buffer
	_ = backend.RenderDashboardAdminModerasiKontenNewBrand(&buf, user)
	return c.Response().Data(http.StatusOK, "text/html; charset=utf-8", buf.Bytes())
}

func (h *UserController) ShowAdminSettingsWeb(c goravelhttp.Context) goravelhttp.Response {
	user, resp := h.getWebUser(c)
	if resp != nil {
		return resp
	}

	if user.Role != models.RoleAdmin {
		return c.Response().String(http.StatusForbidden, "Forbidden: Only administrators can access this area.")
	}

	var buf bytes.Buffer
	_ = backend.RenderDashboardAdminPengaturanSistemNewBrand(&buf, user)
	return c.Response().Data(http.StatusOK, "text/html; charset=utf-8", buf.Bytes())
}
