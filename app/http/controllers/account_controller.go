package controllers

import (
	"crypto/rand"
	"errors"
	"fmt"
	"net/http"
	"net/mail"
	"net/url"
	"os"
	"regexp"
	"strings"
	"time"

	"goravel/app/models"
	"goravel/pkg/db"
	"goravel/pkg/hash"
	"goravel/pkg/notify"

	goravelhttp "github.com/goravel/framework/contracts/http"
	"gorm.io/gorm"
)

type AccountController struct{}

func NewAccountController() *AccountController { return &AccountController{} }

var validUsername = regexp.MustCompile(`^[a-z0-9_]{3,40}$`)
var validPhone = regexp.MustCompile(`^\+[1-9][0-9]{7,14}$`)

func (h *AccountController) UpdateSettings(c goravelhttp.Context) goravelhttp.Response {
	userID, err := authenticatedUserID(c)
	if err != nil {
		return c.Response().Json(http.StatusUnauthorized, goravelhttp.Json{"error": "Unauthorized"})
	}
	var input struct {
		Username      *string  `json:"username"`
		Name          *string  `json:"name"`
		Phone         *string  `json:"phone"`
		Email         *string  `json:"email"`
		City          *string  `json:"city"`
		Country       *string  `json:"country"`
		BirthDate     *string  `json:"birth_date"`
		Gender        *string  `json:"gender"`
		AccountType   *string  `json:"account_type"`
		Interests     []string `json:"interests"`
		ShopCategory  *string  `json:"shop_category"`
		IsPrivate     *bool    `json:"is_private"`
		ProfileLayout *string  `json:"profile_layout"`
		Website       *string  `json:"website"`
	}
	if err := c.Request().Bind(&input); err != nil {
		return c.Response().Json(http.StatusBadRequest, goravelhttp.Json{"error": err.Error()})
	}
	updates := map[string]any{}
	if input.Username != nil {
		username := strings.ToLower(strings.TrimSpace(*input.Username))
		if !validUsername.MatchString(username) {
			return c.Response().Json(400, goravelhttp.Json{"error": "username must be 3-40 lowercase letters, numbers, or underscores"})
		}
		updates["username"] = username
	}
	if input.Name != nil {
		name := strings.TrimSpace(*input.Name)
		if len(name) < 2 || len(name) > 100 {
			return c.Response().Json(400, goravelhttp.Json{"error": "name must be 2-100 characters"})
		}
		updates["name"] = name
	}
	if input.Phone != nil {
		phone := strings.TrimSpace(*input.Phone)
		if phone != "" && !validPhone.MatchString(phone) {
			return c.Response().Json(400, goravelhttp.Json{"error": "phone must use E.164 format, for example +628123456789"})
		}
		updates["phone"] = nullableString(phone)
		updates["phone_verified_at"] = nil
	}
	if input.Email != nil {
		email := strings.ToLower(strings.TrimSpace(*input.Email))
		if _, err := mail.ParseAddress(email); err != nil || !strings.Contains(email, "@") {
			return c.Response().Json(400, goravelhttp.Json{"error": "invalid email"})
		}
		updates["email"] = email
		updates["email_verified_at"] = nil
	}
	copyText := func(column string, value *string, maximum int) error {
		if value == nil {
			return nil
		}
		trimmed := strings.TrimSpace(*value)
		if len(trimmed) > maximum {
			return fmt.Errorf("%s is too long", column)
		}
		updates[column] = nullableString(trimmed)
		return nil
	}
	if err := copyText("city", input.City, 100); err != nil {
		return c.Response().Json(400, goravelhttp.Json{"error": err.Error()})
	}
	if err := copyText("country", input.Country, 100); err != nil {
		return c.Response().Json(400, goravelhttp.Json{"error": err.Error()})
	}
	if err := copyText("shop_category", input.ShopCategory, 100); err != nil {
		return c.Response().Json(400, goravelhttp.Json{"error": err.Error()})
	}
	if input.Website != nil {
		website := strings.TrimSpace(*input.Website)
		if website != "" {
			parsed, err := url.ParseRequestURI(website)
			if err != nil || (parsed.Scheme != "http" && parsed.Scheme != "https") {
				return c.Response().Json(400, goravelhttp.Json{"error": "website must be a valid HTTP/HTTPS URL"})
			}
		}
		updates["website"] = nullableString(website)
	}
	if input.BirthDate != nil {
		if strings.TrimSpace(*input.BirthDate) == "" {
			updates["birth_date"] = nil
		} else {
			birth, err := time.Parse("2006-01-02", *input.BirthDate)
			if err != nil || birth.After(time.Now()) {
				return c.Response().Json(400, goravelhttp.Json{"error": "invalid birth_date"})
			}
			updates["birth_date"] = birth
		}
	}
	if input.Gender != nil {
		gender := strings.ToLower(strings.TrimSpace(*input.Gender))
		if gender != "male" && gender != "female" && gender != "other" {
			return c.Response().Json(400, goravelhttp.Json{"error": "gender must be male, female, or other"})
		}
		updates["gender"] = gender
	}
	if input.AccountType != nil {
		kind := strings.ToLower(strings.TrimSpace(*input.AccountType))
		if kind != "personal" && kind != "business" && kind != "team" {
			return c.Response().Json(400, goravelhttp.Json{"error": "account_type must be personal, business, or team"})
		}
		updates["account_type"] = kind
	}
	if input.Interests != nil {
		if len(input.Interests) > 30 {
			return c.Response().Json(400, goravelhttp.Json{"error": "a maximum of 30 interests is allowed"})
		}
		updates["interests"] = input.Interests
	}
	if input.IsPrivate != nil {
		updates["is_private"] = *input.IsPrivate
	}
	if input.ProfileLayout != nil {
		layout := strings.ToLower(strings.TrimSpace(*input.ProfileLayout))
		if layout != "grid" && layout != "long" {
			return c.Response().Json(400, goravelhttp.Json{"error": "profile_layout must be grid or long"})
		}
		updates["profile_layout"] = layout
	}
	if len(updates) == 0 {
		return c.Response().Json(400, goravelhttp.Json{"error": "no settings supplied"})
	}
	if err := db.DB.Model(&models.User{}).Where("id = ?", userID).Updates(updates).Error; err != nil {
		return c.Response().Json(409, goravelhttp.Json{"error": "username, email, or phone is already used"})
	}
	var user models.User
	db.DB.First(&user, userID)
	return c.Response().Json(200, user)
}

func nullableString(value string) any {
	if value == "" {
		return nil
	}
	return value
}

func (h *AccountController) ChangePassword(c goravelhttp.Context) goravelhttp.Response {
	userID, err := authenticatedUserID(c)
	if err != nil {
		return c.Response().Json(401, goravelhttp.Json{"error": "Unauthorized"})
	}
	var input struct {
		CurrentPassword string `json:"current_password"`
		NewPassword     string `json:"new_password"`
	}
	if err := c.Request().Bind(&input); err != nil || len(input.NewPassword) < 8 {
		return c.Response().Json(400, goravelhttp.Json{"error": "new_password must contain at least 8 characters"})
	}
	var user models.User
	if err := db.DB.First(&user, userID).Error; err != nil || !hash.CheckPasswordHash(input.CurrentPassword, user.Password) {
		return c.Response().Json(401, goravelhttp.Json{"error": "current password is incorrect"})
	}
	encoded, err := hash.HashPassword(input.NewPassword)
	if err != nil {
		return c.Response().Json(500, goravelhttp.Json{"error": "failed to secure password"})
	}
	now := time.Now()
	db.DB.Model(&user).Updates(map[string]any{"password": encoded, "password_changed_at": now})
	return c.Response().Json(200, goravelhttp.Json{"message": "password updated"})
}

func randomCode() (string, error) {
	var b [4]byte
	if _, err := rand.Read(b[:]); err != nil {
		return "", err
	}
	value := (uint32(b[0])<<24 | uint32(b[1])<<16 | uint32(b[2])<<8 | uint32(b[3])) % 1000000
	return fmt.Sprintf("%06d", value), nil
}

func findUserByTarget(target string) (*models.User, error) {
	var user models.User
	target = strings.TrimSpace(target)
	err := db.DB.Where("LOWER(email) = LOWER(?) OR LOWER(username) = LOWER(?) OR phone = ?", target, target, target).First(&user).Error
	return &user, err
}

func issueCode(user *models.User, target, channel, purpose string) (string, error) {
	code, err := randomCode()
	if err != nil {
		return "", err
	}
	encoded, err := hash.HashPassword(code)
	if err != nil {
		return "", err
	}
	db.DB.Where("user_id = ? AND purpose = ? AND used_at IS NULL", user.ID, purpose).Delete(&models.VerificationCode{})
	record := models.VerificationCode{UserID: user.ID, Target: target, Channel: channel, Purpose: purpose, CodeHash: encoded, ExpiresAt: time.Now().Add(10 * time.Minute)}
	if err := db.DB.Create(&record).Error; err != nil {
		return "", err
	}
	if err := notify.SendVerification(channel, target, code, purpose); err != nil {
		if strings.EqualFold(os.Getenv("APP_ENV"), "local") && strings.EqualFold(os.Getenv("VERIFICATION_DEV_MODE"), "true") {
			return code, nil
		}
		return "", err
	}
	return code, nil
}

func verifyCode(userID int64, purpose, code string) error {
	var record models.VerificationCode
	if err := db.DB.Where("user_id = ? AND purpose = ? AND used_at IS NULL", userID, purpose).Order("id desc").First(&record).Error; err != nil {
		return errors.New("verification code is invalid")
	}
	if record.ExpiresAt.Before(time.Now()) {
		return errors.New("verification code has expired")
	}
	if record.Attempts >= 5 {
		return errors.New("too many verification attempts")
	}
	if !hash.CheckPasswordHash(code, record.CodeHash) {
		db.DB.Model(&record).UpdateColumn("attempts", gorm.Expr("attempts + 1"))
		return errors.New("verification code is invalid")
	}
	now := time.Now()
	return db.DB.Model(&record).Update("used_at", now).Error
}

func (h *AccountController) ForgotPassword(c goravelhttp.Context) goravelhttp.Response {
	var input struct {
		Target  string `json:"target"`
		Channel string `json:"channel"`
	}
	if err := c.Request().Bind(&input); err != nil || strings.TrimSpace(input.Target) == "" {
		return c.Response().Json(400, goravelhttp.Json{"error": "target and channel are required"})
	}
	if input.Channel != "email" && input.Channel != "sms" && input.Channel != "whatsapp" {
		return c.Response().Json(400, goravelhttp.Json{"error": "channel must be email, sms, or whatsapp"})
	}
	user, err := findUserByTarget(input.Target)
	if err == nil {
		target := user.Email
		if input.Channel != "email" {
			if user.Phone == nil {
				return c.Response().Json(400, goravelhttp.Json{"error": "account has no phone number"})
			}
			target = *user.Phone
		}
		code, deliveryErr := issueCode(user, target, input.Channel, "password_reset")
		if deliveryErr != nil {
			return c.Response().Json(503, goravelhttp.Json{"error": deliveryErr.Error()})
		}
		if strings.EqualFold(os.Getenv("APP_ENV"), "local") && strings.EqualFold(os.Getenv("VERIFICATION_DEV_MODE"), "true") {
			return c.Response().Json(200, goravelhttp.Json{"message": "verification code sent", "dev_code": code})
		}
	}
	return c.Response().Json(200, goravelhttp.Json{"message": "if the account exists, a verification code was sent"})
}

func (h *AccountController) ResetPassword(c goravelhttp.Context) goravelhttp.Response {
	var input struct {
		Target      string `json:"target"`
		Code        string `json:"code"`
		NewPassword string `json:"new_password"`
	}
	if err := c.Request().Bind(&input); err != nil || len(input.NewPassword) < 8 {
		return c.Response().Json(400, goravelhttp.Json{"error": "target, code, and a new password of at least 8 characters are required"})
	}
	user, err := findUserByTarget(input.Target)
	if err != nil || verifyCode(user.ID, "password_reset", input.Code) != nil {
		return c.Response().Json(400, goravelhttp.Json{"error": "invalid or expired verification code"})
	}
	encoded, _ := hash.HashPassword(input.NewPassword)
	now := time.Now()
	db.DB.Model(user).Updates(map[string]any{"password": encoded, "password_changed_at": now})
	return c.Response().Json(200, goravelhttp.Json{"message": "password reset successfully"})
}

func (h *AccountController) RequestVerification(c goravelhttp.Context) goravelhttp.Response {
	userID, err := authenticatedUserID(c)
	if err != nil {
		return c.Response().Json(401, goravelhttp.Json{"error": "Unauthorized"})
	}
	var input struct {
		Channel string `json:"channel"`
	}
	if err := c.Request().Bind(&input); err != nil {
		return c.Response().Json(400, goravelhttp.Json{"error": "channel is required"})
	}
	var user models.User
	if db.DB.First(&user, userID).Error != nil {
		return c.Response().Json(404, goravelhttp.Json{"error": "user not found"})
	}
	target, purpose := user.Email, "verify_email"
	if input.Channel == "sms" || input.Channel == "whatsapp" {
		if user.Phone == nil {
			return c.Response().Json(400, goravelhttp.Json{"error": "phone number is not configured"})
		}
		target, purpose = *user.Phone, "verify_phone"
	}
	code, err := issueCode(&user, target, input.Channel, purpose)
	if err != nil {
		return c.Response().Json(503, goravelhttp.Json{"error": err.Error()})
	}
	response := goravelhttp.Json{"message": "verification code sent"}
	if strings.EqualFold(os.Getenv("APP_ENV"), "local") && strings.EqualFold(os.Getenv("VERIFICATION_DEV_MODE"), "true") {
		response["dev_code"] = code
	}
	return c.Response().Json(200, response)
}

func (h *AccountController) ConfirmVerification(c goravelhttp.Context) goravelhttp.Response {
	userID, err := authenticatedUserID(c)
	if err != nil {
		return c.Response().Json(401, goravelhttp.Json{"error": "Unauthorized"})
	}
	var input struct {
		Purpose string `json:"purpose"`
		Code    string `json:"code"`
	}
	if err := c.Request().Bind(&input); err != nil || (input.Purpose != "verify_email" && input.Purpose != "verify_phone") {
		return c.Response().Json(400, goravelhttp.Json{"error": "purpose and code are required"})
	}
	if err := verifyCode(userID, input.Purpose, input.Code); err != nil {
		return c.Response().Json(400, goravelhttp.Json{"error": err.Error()})
	}
	column := "email_verified_at"
	if input.Purpose == "verify_phone" {
		column = "phone_verified_at"
	}
	db.DB.Model(&models.User{}).Where("id = ?", userID).Update(column, time.Now())
	return c.Response().Json(200, goravelhttp.Json{"message": "account contact verified"})
}

func (h *AccountController) DeleteAccount(c goravelhttp.Context) goravelhttp.Response {
	userID, err := authenticatedUserID(c)
	if err != nil {
		return c.Response().Json(401, goravelhttp.Json{"error": "Unauthorized"})
	}
	var input struct {
		Password string `json:"password"`
	}
	_ = c.Request().Bind(&input)
	var user models.User
	if db.DB.First(&user, userID).Error != nil || !hash.CheckPasswordHash(input.Password, user.Password) {
		return c.Response().Json(401, goravelhttp.Json{"error": "password is incorrect"})
	}
	now := time.Now()
	db.DB.Model(&user).Updates(map[string]any{"account_status": "pending_deletion", "deletion_requested_at": now})
	return c.Response().Json(200, goravelhttp.Json{"message": "account scheduled for deletion", "recoverable_until": now.Add(30 * 24 * time.Hour)})
}

func (h *AccountController) ReactivateAccount(c goravelhttp.Context) goravelhttp.Response {
	var input struct {
		Identifier string `json:"identifier"`
		Password   string `json:"password"`
	}
	if c.Request().Bind(&input) != nil {
		return c.Response().Json(400, goravelhttp.Json{"error": "identifier and password are required"})
	}
	user, err := findUserByTarget(input.Identifier)
	if err != nil || !hash.CheckPasswordHash(input.Password, user.Password) {
		return c.Response().Json(401, goravelhttp.Json{"error": "invalid credentials"})
	}
	if user.DeletionRequestedAt == nil || user.DeletionRequestedAt.Before(time.Now().Add(-30*24*time.Hour)) {
		return c.Response().Json(400, goravelhttp.Json{"error": "account cannot be reactivated"})
	}
	db.DB.Model(user).Updates(map[string]any{"account_status": "active", "deletion_requested_at": nil})
	return c.Response().Json(200, goravelhttp.Json{"message": "account reactivated; you can sign in"})
}

func (h *AccountController) BlockUser(c goravelhttp.Context) goravelhttp.Response {
	userID, err := authenticatedUserID(c)
	if err != nil {
		return c.Response().Json(401, goravelhttp.Json{"error": "Unauthorized"})
	}
	targetID, err := routeID(c, "id")
	if err != nil || targetID == userID {
		return c.Response().Json(400, goravelhttp.Json{"error": "invalid user"})
	}
	if db.DB.First(&models.User{}, targetID).Error != nil {
		return c.Response().Json(404, goravelhttp.Json{"error": "user not found"})
	}
	return dbTransactionResponse(c, func(tx *gorm.DB) error {
		if err := tx.Where(models.UserBlock{BlockerID: userID, BlockedID: targetID}).FirstOrCreate(&models.UserBlock{BlockerID: userID, BlockedID: targetID}).Error; err != nil {
			return err
		}
		return tx.Where("(follower_id = ? AND followed_id = ?) OR (follower_id = ? AND followed_id = ?)", userID, targetID, targetID, userID).Delete(&models.Follow{}).Error
	}, "user blocked")
}

func (h *AccountController) UnblockUser(c goravelhttp.Context) goravelhttp.Response {
	userID, err := authenticatedUserID(c)
	if err != nil {
		return c.Response().Json(401, goravelhttp.Json{"error": "Unauthorized"})
	}
	targetID, err := routeID(c, "id")
	if err != nil {
		return c.Response().Json(400, goravelhttp.Json{"error": "invalid user"})
	}
	db.DB.Where("blocker_id = ? AND blocked_id = ?", userID, targetID).Delete(&models.UserBlock{})
	return c.Response().Json(200, goravelhttp.Json{"message": "user unblocked"})
}

func (h *AccountController) BlockedUsers(c goravelhttp.Context) goravelhttp.Response {
	userID, err := authenticatedUserID(c)
	if err != nil {
		return c.Response().Json(401, goravelhttp.Json{"error": "Unauthorized"})
	}
	var users []models.User
	db.DB.Table("users").Joins("JOIN user_blocks ON user_blocks.blocked_id = users.id").Where("user_blocks.blocker_id = ?", userID).Limit(200).Scan(&users)
	return c.Response().Json(200, users)
}

func routeID(c goravelhttp.Context, name string) (int64, error) {
	var value int64
	_, err := fmt.Sscan(c.Request().Route(name), &value)
	if err != nil || value <= 0 {
		return 0, errors.New("invalid ID")
	}
	return value, nil
}

func dbTransactionResponse(c goravelhttp.Context, operation func(*gorm.DB) error, message string) goravelhttp.Response {
	if err := db.DB.Transaction(operation); err != nil {
		return c.Response().Json(500, goravelhttp.Json{"error": err.Error()})
	}
	return c.Response().Json(200, goravelhttp.Json{"message": message})
}
