package controllers

import (
	"bytes"
	"net/http"
	"strconv"

	"goravel/app/dto"
	"goravel/app/models"
	"goravel/app/services"
	"goravel/pkg/db"
	"goravel/pkg/jwt"
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
			// Clear invalid cookies
			c.Response().Cookie(goravelhttp.Cookie{Name: "token", Value: "", MaxAge: -1, Path: "/", HttpOnly: true})
			c.Response().Cookie(goravelhttp.Cookie{Name: "refresh_token", Value: "", MaxAge: -1, Path: "/", HttpOnly: true})
			return nil, c.Response().Redirect(http.StatusSeeOther, "/web/login")
		}

		c.Response().Cookie(goravelhttp.Cookie{Name: "token", Value: res.AccessToken, MaxAge: 900, Path: "/", HttpOnly: true})
		c.Response().Cookie(goravelhttp.Cookie{Name: "refresh_token", Value: res.RefreshToken, MaxAge: 604800, Path: "/", HttpOnly: true})
		tokenStr = res.AccessToken
	}

	claims, err := jwt.ValidateAccessToken(tokenStr)
	if err != nil {
		return nil, c.Response().Redirect(http.StatusSeeOther, "/web/login")
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
			return c.Response().Json(http.StatusBadRequest, goravelhttp.Json{"error": "Invalid user ID"})
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
	if user.AccountStatus != "active" || blockedBetween(viewerID, targetID) {
		return c.Response().Json(http.StatusNotFound, goravelhttp.Json{"error": "User not found"})
	}
	if user.IsPrivate && viewerID != targetID && !acceptedFollower(viewerID, targetID) {
		return c.Response().Json(http.StatusForbidden, goravelhttp.Json{"error": "Profile is private"})
	}
	db.DB.Model(&models.Follow{}).Where("followed_id = ? AND status = 'accepted'", targetID).Count(&user.FollowersCount)
	db.DB.Model(&models.Follow{}).Where("follower_id = ? AND status = 'accepted'", targetID).Count(&user.FollowingCount)
	user.IsFollowedByMe = viewerID != targetID && acceptedFollower(viewerID, targetID)
	if viewerID != targetID {
		user.Email = ""
		user.Phone = nil
		user.BirthDate = nil
		user.EmailVerifiedAt = nil
		user.PhoneVerifiedAt = nil
		user.PasswordChangedAt = nil
		user.DeletionRequestedAt = nil
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
	users, err := h.userService.ListAll()
	if err != nil {
		return c.Response().Json(http.StatusInternalServerError, goravelhttp.Json{"error": "Failed to load stats"})
	}

	totalUsers := len(users)
	return c.Response().Json(http.StatusOK, goravelhttp.Json{
		"total_users":       totalUsers,
		"active_now":        124,
		"reported_accounts": 3,
		"new_today":         12,
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
			if err == nil {
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
	_ = backend.RenderDashboardAdminIkhtisarV3NewBrand(&buf)
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
	_ = backend.RenderDashboardAdminManajemenPenggunaV2(&buf, allUsers)
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

	posts, _ := h.postService.GetFeed(user.ID, 100, 0, 0)
	var buf bytes.Buffer
	_ = backend.RenderDashboardAdminPosts(&buf, posts)
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

	postIDStr := c.Request().Route("id")
	postID, err := strconv.ParseInt(postIDStr, 10, 64)
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
	_ = backend.RenderDashboardAdminModerasiKontenNewBrand(&buf)
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
	_ = backend.RenderDashboardAdminPengaturanSistemNewBrand(&buf)
	return c.Response().Data(http.StatusOK, "text/html; charset=utf-8", buf.Bytes())
}
