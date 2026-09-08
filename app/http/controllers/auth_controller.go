package controllers

import (
	"bytes"
	"net/http"

	"goravel/app/dto"
	"goravel/app/models"
	"goravel/app/services"
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

func (h *AuthController) RegisterAPI(c goravelhttp.Context) goravelhttp.Response {
	var req dto.RegisterRequest
	if err := c.Request().Bind(&req); err != nil {
		return c.Response().Json(http.StatusBadRequest, goravelhttp.Json{"error": err.Error()})
	}

	res, err := h.authService.Register(&req)
	if err != nil {
		return c.Response().Json(http.StatusBadRequest, goravelhttp.Json{"error": err.Error()})
	}

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

	return c.Response().Json(http.StatusOK, res)
}

func (h *AuthController) RefreshAPI(c goravelhttp.Context) goravelhttp.Response {
	var req dto.RefreshRequest
	if err := c.Request().Bind(&req); err != nil {
		return c.Response().Json(http.StatusBadRequest, goravelhttp.Json{"error": err.Error()})
	}

	res, err := h.authService.Refresh(&req)
	if err != nil {
		return c.Response().Json(http.StatusUnauthorized, goravelhttp.Json{"error": err.Error()})
	}

	return c.Response().Json(http.StatusOK, res)
}

func (h *AuthController) LogoutAPI(c goravelhttp.Context) goravelhttp.Response {
	// Clear the cookies to synchronize state if they were used
	c.Response().Cookie(goravelhttp.Cookie{Name: "token", Value: "", MaxAge: -1, Path: "/", HttpOnly: true})
	c.Response().Cookie(goravelhttp.Cookie{Name: "refresh_token", Value: "", MaxAge: -1, Path: "/", HttpOnly: true})
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
			c.Response().Cookie(goravelhttp.Cookie{Name: "token", Value: res.AccessToken, MaxAge: 900, Path: "/", HttpOnly: true})
			c.Response().Cookie(goravelhttp.Cookie{Name: "refresh_token", Value: res.RefreshToken, MaxAge: 604800, Path: "/", HttpOnly: true})

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

	c.Response().Cookie(goravelhttp.Cookie{Name: "token", Value: res.AccessToken, MaxAge: 900, Path: "/", HttpOnly: true})
	c.Response().Cookie(goravelhttp.Cookie{Name: "refresh_token", Value: res.RefreshToken, MaxAge: 604800, Path: "/", HttpOnly: true})

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

	c.Response().Cookie(goravelhttp.Cookie{Name: "token", Value: res.AccessToken, MaxAge: 900, Path: "/", HttpOnly: true})
	c.Response().Cookie(goravelhttp.Cookie{Name: "refresh_token", Value: res.RefreshToken, MaxAge: 604800, Path: "/", HttpOnly: true})

	return c.Response().Redirect(http.StatusSeeOther, "/web/beranda")
}

func (h *AuthController) HandleLogoutWeb(c goravelhttp.Context) goravelhttp.Response {
	c.Response().Cookie(goravelhttp.Cookie{Name: "token", Value: "", MaxAge: -1, Path: "/", HttpOnly: true})
	c.Response().Cookie(goravelhttp.Cookie{Name: "refresh_token", Value: "", MaxAge: -1, Path: "/", HttpOnly: true})
	return c.Response().Redirect(http.StatusSeeOther, "/web/login")
}
