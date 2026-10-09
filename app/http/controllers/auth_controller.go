package controllers

import (
	"bytes"
	"net/http"
	"os"
	"strings"

	"goravel/app/dto"
	"goravel/app/models"
	"goravel/app/services"
	"goravel/pkg/csrf"
	"goravel/pkg/jwt"
	"goravel/resources/views/backend"

	goravelhttp "github.com/goravel/framework/contracts/http"
)

type AuthController struct {
	authService services.AuthService
}

func NewAuthController(authService services.AuthService) *AuthController {
	return &AuthController{authService: authService}
}

// ==========================================
// REST API Controllers (JSON)
// ==========================================

// setAuthCookies mirrors the httpOnly cookies already issued by the SSR web
// login flow (see checkActiveWebSession/HandleLoginWeb below), so the SPA's
// access/refresh tokens are no longer readable by JavaScript - a page-level
// XSS elsewhere in the React app can no longer exfiltrate a long-lived
// refresh token out of localStorage.
//
// Cookie-based API auth is otherwise CSRF-exposed (a cross-site form/fetch
// rides the browser's automatic cookie attachment), which the Bearer-header
// flow never was, so a matching non-httpOnly CSRF cookie is issued alongside
// it: JS on our own origin can read it and echo it back as a header, but a
// cross-site page can neither read this cookie nor set that header, so
// middleware.AuthMiddleware can require the two to match for cookie-backed
// requests. See pkg/csrf.
func setAuthCookies(c goravelhttp.Context, accessToken, refreshToken string) {
	c.Response().Cookie(authCookie("token", accessToken, int(jwt.AccessTTL.Seconds()), true))
	c.Response().Cookie(authCookie("refresh_token", refreshToken, int(jwt.RefreshTTL.Seconds()), true))
	if csrfToken, err := csrf.NewToken(); err == nil {
		c.Response().Cookie(authCookie(csrf.CookieName, csrfToken, int(jwt.RefreshTTL.Seconds()), false))
	}
}

func clearAuthCookies(c goravelhttp.Context) {
	c.Response().Cookie(authCookie("token", "", -1, true))
	c.Response().Cookie(authCookie("refresh_token", "", -1, true))
	c.Response().Cookie(authCookie(csrf.CookieName, "", -1, false))
}

// authCookie applies SameSite=Lax everywhere and Secure whenever the app is
// served over HTTPS, so session cookies never travel over plain HTTP.
func authCookie(name, value string, maxAge int, httpOnly bool) goravelhttp.Cookie {
	secure := strings.HasPrefix(strings.ToLower(os.Getenv("APP_URL")), "https://")
	return goravelhttp.Cookie{Name: name, Value: value, MaxAge: maxAge, Path: "/", HttpOnly: httpOnly, Secure: secure, SameSite: "Lax"}
}

func (h *AuthController) RegisterAPI(c goravelhttp.Context) goravelhttp.Response {
	var req dto.RegisterRequest
	if err := c.Request().Bind(&req); err != nil {
		return c.Response().Json(http.StatusBadRequest, goravelhttp.Json{"error": err.Error()})
	}

	res, err := h.authService.Register(&req)
	if err != nil {
		return c.Response().Json(http.StatusBadRequest, goravelhttp.Json{"error": err.Error()})
	}

	setAuthCookies(c, res.AccessToken, res.RefreshToken)
	return c.Response().Json(http.StatusCreated, res)
}

func (h *AuthController) LoginAPI(c goravelhttp.Context) goravelhttp.Response {
	var req dto.LoginRequest
	if err := c.Request().Bind(&req); err != nil {
		return c.Response().Json(http.StatusBadRequest, goravelhttp.Json{"error": err.Error()})
	}

	res, err := h.authService.Login(&req)
	if err != nil {
		return c.Response().Json(http.StatusUnauthorized, goravelhttp.Json{"error": err.Error()})
	}

	setAuthCookies(c, res.AccessToken, res.RefreshToken)
	return c.Response().Json(http.StatusOK, res)
}

func (h *AuthController) RefreshAPI(c goravelhttp.Context) goravelhttp.Response {
	var req dto.RefreshRequest
	// The SPA sends no body and relies on the httpOnly refresh_token cookie;
	// other API clients (mobile, scripts) can still pass it in the JSON body.
	if cookie := c.Request().Cookie("refresh_token"); cookie != "" {
		req.RefreshToken = cookie
	} else if err := c.Request().Bind(&req); err != nil {
		return c.Response().Json(http.StatusBadRequest, goravelhttp.Json{"error": err.Error()})
	}
	if req.RefreshToken == "" {
		return c.Response().Json(http.StatusBadRequest, goravelhttp.Json{"error": "refresh_token is required"})
	}

	res, err := h.authService.Refresh(&req)
	if err != nil {
		return c.Response().Json(http.StatusUnauthorized, goravelhttp.Json{"error": err.Error()})
	}

	setAuthCookies(c, res.AccessToken, res.RefreshToken)
	return c.Response().Json(http.StatusOK, res)
}

func (h *AuthController) LogoutAPI(c goravelhttp.Context) goravelhttp.Response {
	// Revoke the refresh token server-side, not just in the browser; API
	// clients may send it in the body instead of the cookie.
	refreshToken := c.Request().Cookie("refresh_token")
	if refreshToken == "" {
		var req dto.RefreshRequest
		_ = c.Request().Bind(&req)
		refreshToken = req.RefreshToken
	}
	h.authService.Logout(refreshToken)
	clearAuthCookies(c)
	return c.Response().Json(http.StatusOK, goravelhttp.Json{"message": "Logged out successfully"})
}

// ==========================================
// SSR Web Controllers (HTML)
// ==========================================

func (h *AuthController) checkActiveWebSession(c goravelhttp.Context) (bool, goravelhttp.Response) {
	tokenStr := c.Request().Cookie("token")
	if tokenStr != "" {
		claims, err := jwt.ValidateAccessToken(tokenStr)
		if err == nil {
			if claims.Role == models.RoleAdmin {
				return true, c.Response().Redirect(http.StatusSeeOther, "/web/admin/dashboard")
			} else {
				return true, c.Response().Redirect(http.StatusSeeOther, "/web/beranda")
			}
		}
	}

	// Try refresh token recovery
	refTokenStr := c.Request().Cookie("refresh_token")
	if refTokenStr != "" {
		res, refreshErr := h.authService.Refresh(&dto.RefreshRequest{RefreshToken: refTokenStr})
		if refreshErr == nil {
			setAuthCookies(c, res.AccessToken, res.RefreshToken)

			claims, _ := jwt.ValidateAccessToken(res.AccessToken)
			if claims.Role == models.RoleAdmin {
				return true, c.Response().Redirect(http.StatusSeeOther, "/web/admin/dashboard")
			} else {
				return true, c.Response().Redirect(http.StatusSeeOther, "/web/beranda")
			}
		}
	}

	return false, nil
}

func (h *AuthController) ShowLoginWeb(c goravelhttp.Context) goravelhttp.Response {
	if isActive, resp := h.checkActiveWebSession(c); isActive {
		return resp
	}

	var buf bytes.Buffer
	data := backend.LoginData{}
	_ = backend.RenderLogin(&buf, data)
	return c.Response().Data(http.StatusOK, "text/html; charset=utf-8", buf.Bytes())
}

func (h *AuthController) HandleLoginWeb(c goravelhttp.Context) goravelhttp.Response {
	email := c.Request().Input("Email address")
	if email == "" {
		email = c.Request().Input("email")
	}
	password := c.Request().Input("Password")
	if password == "" {
		password = c.Request().Input("password")
	}

	req := dto.LoginRequest{
		Email:    email,
		Password: password,
	}

	res, err := h.authService.Login(&req)
	if err != nil {
		var buf bytes.Buffer
		data := backend.LoginData{
			Email: email,
			Error: err.Error(),
		}
		_ = backend.RenderLogin(&buf, data)
		return c.Response().Data(http.StatusOK, "text/html; charset=utf-8", buf.Bytes())
	}

	setAuthCookies(c, res.AccessToken, res.RefreshToken)

	claims, _ := jwt.ValidateAccessToken(res.AccessToken)
	if claims.Role == models.RoleAdmin {
		return c.Response().Redirect(http.StatusSeeOther, "/web/admin/dashboard")
	}

	return c.Response().Redirect(http.StatusSeeOther, "/web/beranda")
}

func (h *AuthController) ShowRegisterWeb(c goravelhttp.Context) goravelhttp.Response {
	if isActive, resp := h.checkActiveWebSession(c); isActive {
		return resp
	}

	var buf bytes.Buffer
	data := backend.RegisterData{}
	_ = backend.RenderRegister(&buf, data)
	return c.Response().Data(http.StatusOK, "text/html; charset=utf-8", buf.Bytes())
}

func (h *AuthController) HandleRegisterWeb(c goravelhttp.Context) goravelhttp.Response {
	firstName := c.Request().Input("First name")
	if firstName == "" {
		firstName = c.Request().Input("first_name")
	}
	surname := c.Request().Input("Surname")
	if surname == "" {
		surname = c.Request().Input("surname")
	}
	email := c.Request().Input("Mobile number or email address")
	if email == "" {
		email = c.Request().Input("email")
	}
	password := c.Request().Input("New password")
	if password == "" {
		password = c.Request().Input("password")
	}

	req := dto.RegisterRequest{
		Name:     firstName + " " + surname,
		Email:    email,
		Password: password,
	}

	res, err := h.authService.Register(&req)
	if err != nil {
		var buf bytes.Buffer
		data := backend.RegisterData{
			FirstName: firstName,
			Surname:   surname,
			Email:     email,
			Error:     err.Error(),
		}
		_ = backend.RenderRegister(&buf, data)
		return c.Response().Data(http.StatusOK, "text/html; charset=utf-8", buf.Bytes())
	}

	setAuthCookies(c, res.AccessToken, res.RefreshToken)

	return c.Response().Redirect(http.StatusSeeOther, "/web/beranda")
}

func (h *AuthController) HandleLogoutWeb(c goravelhttp.Context) goravelhttp.Response {
	h.authService.Logout(c.Request().Cookie("refresh_token"))
	clearAuthCookies(c)
	return c.Response().Redirect(http.StatusSeeOther, "/web/login")
}
