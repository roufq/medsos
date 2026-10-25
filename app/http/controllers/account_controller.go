package controllers

import (
	"crypto/rand"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/mail"
	"os"
	"regexp"
	"strings"
	"time"
	"unicode/utf8"

	"goravel/app/facades"
	"goravel/app/jobs"
	"goravel/app/models"
	"goravel/app/services"
	"goravel/pkg/db"
	"goravel/pkg/hash"
	"goravel/pkg/session"

	"github.com/goravel/framework/contracts/queue"

	goravelhttp "github.com/goravel/framework/contracts/http"
	"gorm.io/gorm"
)

type AccountController struct{}

func NewAccountController() *AccountController { return &AccountController{} }

var validUsername = regexp.MustCompile(`^[a-z0-9_]{3,40}$`)

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
		Bio           *string  `json:"bio"`
		Title         *string  `json:"title"`
		Company       *string  `json:"company"`
		Location      *string  `json:"location"`
		BirthPlace    *string  `json:"birth_place"`
		PhoneCountry     *string  `json:"phone_country"`
		SubscriptionPlan *string  `json:"subscription_plan"`
	}
	if err := c.Request().Bind(&input); err != nil {
		return c.Response().Json(http.StatusBadRequest, goravelhttp.Json{"error": err.Error()})
	}
	var current models.User
	if err := db.DB.First(&current, userID).Error; err != nil {
		return c.Response().Json(http.StatusNotFound, goravelhttp.Json{"error": "user not found"})
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
	if input.PhoneCountry != nil {
		country := strings.ToUpper(strings.TrimSpace(*input.PhoneCountry))
		if country != "" && !services.ValidCountryCode.MatchString(country) {
			return c.Response().Json(400, goravelhttp.Json{"error": "phone_country must be an ISO 3166-1 alpha-2 code"})
		}
		updates["phone_country"] = nullableString(country)
	}
	if input.Phone != nil {
		phone := strings.TrimSpace(*input.Phone)
		if phone != "" && !services.ValidPhone.MatchString(phone) {
			return c.Response().Json(400, goravelhttp.Json{"error": "phone must use E.164 format, for example +628123456789"})
		}
		// Only a different number needs to be verified again.
		if phone != valueOf(current.Phone) {
			updates["phone"] = nullableString(phone)
			updates["phone_verified_at"] = nil
		}
	}
	if input.Email != nil {
		email := strings.ToLower(strings.TrimSpace(*input.Email))
		if _, err := mail.ParseAddress(email); err != nil || !strings.Contains(email, "@") {
			return c.Response().Json(400, goravelhttp.Json{"error": "invalid email"})
		}
		if email != strings.ToLower(current.Email) {
			updates["email"] = email
			updates["email_verified_at"] = nil
		}
	}
	copyText := func(column string, value *string, maximum int) error {
		if value == nil {
			return nil
		}
		trimmed := strings.TrimSpace(*value)
		if utf8.RuneCountInString(trimmed) > maximum {
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
	for _, field := range []struct {
		column string
		value  *string
		max    int
	}{{"bio", input.Bio, services.ProfileBioMaxChars}, {"title", input.Title, 100}, {"company", input.Company, 100}, {"location", input.Location, 100}, {"birth_place", input.BirthPlace, 100}} {
		if err := copyText(field.column, field.value, field.max); err != nil {
			return c.Response().Json(400, goravelhttp.Json{"error": err.Error()})
		}
	}
	if input.Website != nil {
		website := strings.TrimSpace(*input.Website)
		if err := services.ValidateWebsite(website); err != nil {
			return c.Response().Json(400, goravelhttp.Json{"error": err.Error()})
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
		interests := make([]string, 0, len(input.Interests))
		seen := map[string]bool{}
		for _, interest := range input.Interests {
			interest = strings.TrimSpace(interest)
			key := strings.ToLower(interest)
			if interest == "" || seen[key] {
				continue
			}
			if utf8.RuneCountInString(interest) > 50 {
				return c.Response().Json(400, goravelhttp.Json{"error": "each interest must be at most 50 characters"})
			}
			seen[key] = true
			interests = append(interests, interest)
		}
		if len(interests) > 30 {
			return c.Response().Json(400, goravelhttp.Json{"error": "a maximum of 30 interests is allowed"})
		}
		// Map updates bypass the model's JSON serializer, so encode explicitly.
		encoded, _ := json.Marshal(interests)
		updates["interests"] = string(encoded)
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
	if input.SubscriptionPlan != nil {
		// shortcut: activates subscription directly without payment gateway, hook Midtrans/Xendit webhook here when payment gateway is added
		planKey := strings.ToLower(strings.TrimSpace(*input.SubscriptionPlan))
		plan, ok := services.SubscriptionPlans[planKey]
		if !ok {
			return c.Response().Json(400, goravelhttp.Json{"error": "invalid subscription_plan"})
		}
		updates["subscription_plan"] = planKey
		updates["is_blue_verified"] = plan.BlueVerified
		if planKey == "free" {
			updates["subscription_expires_at"] = nil
		} else {
			updates["subscription_expires_at"] = time.Now().Add(30 * 24 * time.Hour)
		}
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

func valueOf(value *string) string {
	if value == nil {
		return ""
	}
	return *value
}

func nullableString(value string) any {
	if value == "" {
		return nil
	}
	return value
}

// ChangePassword updates the password, or sets the first local password for an
// OAuth-created account (needs_password), which has no current password to
// confirm. Every other session is revoked; the caller receives fresh tokens.
func (h *AccountController) ChangePassword(c goravelhttp.Context) goravelhttp.Response {
	userID, err := authenticatedUserID(c)
	if err != nil {
		return c.Response().Json(401, goravelhttp.Json{"error": "Unauthorized"})
	}
	var input struct {
		CurrentPassword string `json:"current_password"`
		NewPassword     string `json:"new_password"`
	}
	if err := c.Request().Bind(&input); err != nil || !validPassword(input.NewPassword) {
		return c.Response().Json(400, goravelhttp.Json{"error": "new_password must contain 8-72 characters"})
	}
	var user models.User
	if err := db.DB.First(&user, userID).Error; err != nil {
		return c.Response().Json(404, goravelhttp.Json{"error": "user not found"})
	}
	if !user.NeedsPassword && !hash.CheckPasswordHash(input.CurrentPassword, user.Password) {
		return c.Response().Json(401, goravelhttp.Json{"error": "current password is incorrect"})
	}
	encoded, err := hash.HashPassword(input.NewPassword)
	if err != nil {
		return c.Response().Json(500, goravelhttp.Json{"error": "failed to secure password"})
	}
	if err := setPasswordAndRevoke(&user, encoded); err != nil {
		return c.Response().Json(500, goravelhttp.Json{"error": "failed to update password"})
	}
	tokens, err := services.IssueTokens(&user)
	if err != nil {
		return c.Response().Json(500, goravelhttp.Json{"error": "password updated; please sign in again"})
	}
	setAuthCookies(c, tokens.AccessToken, tokens.RefreshToken)
	return c.Response().Json(200, goravelhttp.Json{"message": "password updated", "access_token": tokens.AccessToken, "refresh_token": tokens.RefreshToken})
}

// validPassword enforces the bcrypt input limit (72 bytes) alongside a minimum.
func validPassword(password string) bool {
	return len(password) >= 8 && len(password) <= 72
}

// setPasswordAndRevoke stores the new hash and revokes all existing tokens in
// one transaction, then refreshes user so newly issued tokens carry the new
// token_version.
func setPasswordAndRevoke(user *models.User, encoded string) error {
	err := db.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(user).Updates(map[string]any{"password": encoded, "password_changed_at": time.Now(), "needs_password": false}).Error; err != nil {
			return err
		}
		return session.RevokeAll(tx, user.ID)
	})
	if err != nil {
		return err
	}
	session.Invalidate(user.ID)
	return db.DB.First(user, user.ID).Error
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
	// Delivery (SMTP/webhook) can block for several seconds, so it runs on the
	// queue instead of inline in the request handler.
	if err := facades.Queue().Job(&jobs.SendVerificationCode{}, []queue.Arg{
		{Value: channel, Type: "string"},
		{Value: target, Type: "string"},
		{Value: code, Type: "string"},
		{Value: purpose, Type: "string"},
	}).Dispatch(); err != nil {
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
	// The response is identical whether the account exists, the requested
	// channel has no phone on file, or delivery dispatch fails - any
	// difference here (status code, message, or timing-sensitive branching)
	// would let an attacker enumerate which accounts/channels exist.
	user, err := findUserByTarget(input.Target)
	if err == nil && (input.Channel == "email" || user.Phone != nil) {
		target := user.Email
		if input.Channel != "email" {
			target = *user.Phone
		}
		code, deliveryErr := issueCode(user, target, input.Channel, "password_reset")
		if deliveryErr == nil && strings.EqualFold(os.Getenv("APP_ENV"), "local") && strings.EqualFold(os.Getenv("VERIFICATION_DEV_MODE"), "true") {
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
	if err := c.Request().Bind(&input); err != nil || !validPassword(input.NewPassword) {
		return c.Response().Json(400, goravelhttp.Json{"error": "target, code, and a new password of 8-72 characters are required"})
	}
	user, err := findUserByTarget(input.Target)
	if err != nil || verifyCode(user.ID, "password_reset", input.Code) != nil {
		return c.Response().Json(400, goravelhttp.Json{"error": "invalid or expired verification code"})
	}
	encoded, err := hash.HashPassword(input.NewPassword)
	if err != nil {
		return c.Response().Json(500, goravelhttp.Json{"error": "failed to secure password"})
	}
	// A reset typically follows a suspected compromise: log out everywhere.
	if err := setPasswordAndRevoke(user, encoded); err != nil {
		return c.Response().Json(500, goravelhttp.Json{"error": "failed to reset password"})
	}
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
		// Confirm must be "DELETE" for OAuth accounts that have no password.
		Confirm string `json:"confirm"`
	}
	_ = c.Request().Bind(&input)
	var user models.User
	if db.DB.First(&user, userID).Error != nil {
		return c.Response().Json(404, goravelhttp.Json{"error": "user not found"})
	}
	if user.NeedsPassword {
		if input.Confirm != "DELETE" {
			return c.Response().Json(400, goravelhttp.Json{"error": "type DELETE to confirm account deletion"})
		}
	} else if !hash.CheckPasswordHash(input.Password, user.Password) {
		return c.Response().Json(401, goravelhttp.Json{"error": "password is incorrect"})
	}
	now := time.Now()
	err = db.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&user).Updates(map[string]any{"account_status": "pending_deletion", "deletion_requested_at": now}).Error; err != nil {
			return err
		}
		return session.RevokeAll(tx, user.ID)
	})
	if err != nil {
		return c.Response().Json(500, goravelhttp.Json{"error": "failed to delete account"})
	}
	session.Invalidate(user.ID)
	clearAuthCookies(c)
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
	if user.AccountStatus != "pending_deletion" || user.DeletionRequestedAt == nil || user.DeletionRequestedAt.Before(time.Now().Add(-30*24*time.Hour)) {
		return c.Response().Json(400, goravelhttp.Json{"error": "account cannot be reactivated"})
	}
	db.DB.Model(user).Updates(map[string]any{"account_status": "active", "deletion_requested_at": nil})
	session.Invalidate(user.ID)
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
	return c.Response().Json(200, publicUsers(users))
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
