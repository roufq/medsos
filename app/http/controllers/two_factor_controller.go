package controllers

import (
	http "github.com/goravel/framework/contracts/http"
	"goravel/app/models"
	"goravel/pkg/db"
	"goravel/pkg/hash"
	"goravel/pkg/totp"
	"net/url"
	"strings"
	"time"
)

func TwoFactorSetup(c http.Context) http.Response {
	id, _ := authenticatedUserID(c)
	var user models.User
	if db.DB.First(&user, id).Error != nil {
		return c.Response().Json(404, http.Json{"error": "Account not found"})
	}
	var input struct {
		Password string `json:"password"`
	}
	if c.Request().Bind(&input) != nil || !hash.CheckPasswordHash(input.Password, user.Password) {
		return c.Response().Json(400, http.Json{"error": "Confirm your current password first"})
	}
	if user.TwoFactorEnabled {
		return c.Response().Json(409, http.Json{"error": "2FA is already enabled"})
	}
	secret, e := totp.NewSecret()
	if e != nil {
		return c.Response().Json(503, http.Json{"error": "2FA unavailable"})
	}
	encrypted, e := totp.Encrypt(secret)
	if e != nil {
		return c.Response().Json(503, http.Json{"error": "2FA unavailable"})
	}
	if db.DB.Model(&user).Update("two_factor_pending", encrypted).Error != nil {
		return c.Response().Json(503, http.Json{"error": "Cannot prepare 2FA"})
	}
	return c.Response().Json(200, http.Json{"secret": secret, "uri": "otpauth://totp/" + url.PathEscape("Postter:"+user.Email) + "?secret=" + secret + "&issuer=Postter&digits=6&period=30"})
}
func TwoFactorConfirm(c http.Context) http.Response {
	id, _ := authenticatedUserID(c)
	var user models.User
	db.DB.First(&user, id)
	var input struct {
		Code     string `json:"code"`
		Password string `json:"password"`
		Disable  bool   `json:"disable"`
	}
	if c.Request().Bind(&input) != nil {
		return c.Response().Json(400, http.Json{"error": "Invalid request"})
	}
	encrypted := user.TwoFactorPending
	if input.Disable {
		encrypted = user.TwoFactorSecret
	}
	secret, e := totp.Decrypt(encrypted)
	counter, ok := totp.Validate(secret, strings.TrimSpace(input.Code), user.TwoFactorCounter, time.Now())
	if e != nil || !ok {
		return c.Response().Json(400, http.Json{"error": "Invalid or already used authenticator code"})
	}
	if input.Disable {
		var settings models.PlatformSetting
		db.DB.First(&settings, 1)
		if user.TwoFactorRequired || (settings.RequireAdminTwoFactor && user.Role == models.RoleAdmin) {
			return c.Response().Json(403, http.Json{"error": "2FA is required for this account"})
		}
		if !hash.CheckPasswordHash(input.Password, user.Password) {
			return c.Response().Json(400, http.Json{"error": "Invalid password"})
		}
	}
	values := map[string]any{"two_factor_enabled": !input.Disable, "two_factor_secret": encrypted, "two_factor_pending": "", "two_factor_counter": counter}
	if input.Disable {
		values["two_factor_secret"] = ""
	}
	result := db.DB.Model(&models.User{}).Where("id = ? AND two_factor_counter = ?", id, user.TwoFactorCounter).Updates(values)
	if result.Error != nil || result.RowsAffected != 1 {
		return c.Response().Json(409, http.Json{"error": "2FA state changed; try again"})
	}
	return c.Response().Json(200, http.Json{"enabled": !input.Disable})
}
