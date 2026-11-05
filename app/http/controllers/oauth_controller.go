package controllers

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"regexp"
	"strings"
	"time"

	"goravel/app/models"
	"goravel/app/services"
	"goravel/pkg/db"
	"goravel/pkg/hash"
	"goravel/pkg/session"

	goravelhttp "github.com/goravel/framework/contracts/http"
)

type OAuthController struct{ client *http.Client }

func NewOAuthController() *OAuthController {
	return &OAuthController{client: &http.Client{Timeout: 12 * time.Second}}
}

type oauthProvider struct {
	name, clientID, clientSecret, authURL, tokenURL, userURL, scope string
	devMode                                                         bool
}

func providerConfig(name string) (oauthProvider, error) {
	name = strings.ToLower(name)
	values := map[string]oauthProvider{
		"google":   {name: "google", authURL: "https://accounts.google.com/o/oauth2/v2/auth", tokenURL: "https://oauth2.googleapis.com/token", userURL: "https://openidconnect.googleapis.com/v1/userinfo", scope: "openid email profile"},
		"facebook": {name: "facebook", authURL: "https://www.facebook.com/v23.0/dialog/oauth", tokenURL: "https://graph.facebook.com/v23.0/oauth/access_token", userURL: "https://graph.facebook.com/me?fields=id,name,email,picture", scope: "email,public_profile"},
		"linkedin": {name: "linkedin", authURL: "https://www.linkedin.com/oauth/v2/authorization", tokenURL: "https://www.linkedin.com/oauth/v2/accessToken", userURL: "https://api.linkedin.com/v2/userinfo", scope: "openid profile email"},
		"tiktok":   {name: "tiktok", authURL: "https://www.tiktok.com/v2/auth/authorize/", tokenURL: "https://open.tiktokapis.com/v2/oauth/token/", userURL: "https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,avatar_url", scope: "user.info.basic"},
		"apple":    {name: "apple", authURL: "https://appleid.apple.com/auth/authorize", tokenURL: "https://appleid.apple.com/auth/token", scope: "name email"},
	}
	p, ok := values[name]
	if !ok {
		return p, errors.New("unsupported OAuth provider")
	}
	prefix := "OAUTH_" + strings.ToUpper(name) + "_"
	p.clientID, p.clientSecret = strings.TrimSpace(os.Getenv(prefix+"CLIENT_ID")), strings.TrimSpace(os.Getenv(prefix+"CLIENT_SECRET"))
	if value := strings.TrimSpace(os.Getenv(prefix + "AUTH_URL")); value != "" {
		p.authURL = value
	}
	if value := strings.TrimSpace(os.Getenv(prefix + "TOKEN_URL")); value != "" {
		p.tokenURL = value
	}
	if value := strings.TrimSpace(os.Getenv(prefix + "USERINFO_URL")); value != "" {
		p.userURL = value
	}
	if p.clientID == "" || p.clientSecret == "" {
		// shortcut: local/dev OAuth simulation when credentials are empty, disable in production via OAUTH_DEV_MODE=false and APP_ENV=production
		if strings.EqualFold(os.Getenv("OAUTH_DEV_MODE"), "true") || strings.EqualFold(os.Getenv("APP_ENV"), "local") {
			p.devMode = true
			return p, nil
		}
		return p, errors.New("OAuth provider is not configured")
	}
	return p, nil
}

func randomURLToken(size int) (string, error) {
	b := make([]byte, size)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(b), nil
}
func sha256Hex(value string) string {
	sum := sha256.Sum256([]byte(value))
	return fmt.Sprintf("%x", sum[:])
}
func oauthRedirect(provider string) string {
	base := strings.TrimRight(os.Getenv("APP_URL"), "/")
	if base == "" {
		base = "http://127.0.0.1:3000"
	}
	return base + "/api/v1/auth/oauth/" + provider + "/callback"
}

func oauthErrorRedirect(c goravelhttp.Context, page, reason string, status int, msg string) goravelhttp.Response {
	if page != "register" {
		page = "login"
	}
	accept := c.Request().Header("Accept", "")
	if strings.Contains(accept, "application/json") && !strings.Contains(accept, "text/html") {
		return c.Response().Json(status, goravelhttp.Json{"error": msg})
	}
	return c.Response().Redirect(http.StatusFound, frontendURL("/"+page+"?oauth_error="+url.QueryEscape(reason)))
}

func (h *OAuthController) Start(c goravelhttp.Context) goravelhttp.Response {
	from := strings.ToLower(strings.TrimSpace(c.Request().Query("from", "login")))
	p, err := providerConfig(c.Request().Route("provider"))
	if err != nil {
		return oauthErrorRedirect(c, from, "oauth_not_configured", 503, err.Error())
	}
	state, err := randomURLToken(32)
	if err != nil {
		return oauthErrorRedirect(c, from, "oauth_failed", 500, "failed to initialize OAuth")
	}
	verifier, _ := randomURLToken(48)
	challengeBytes := sha256.Sum256([]byte(verifier))
	challenge := base64.RawURLEncoding.EncodeToString(challengeBytes[:])
	storedVerifier := verifier
	if ref := strings.TrimSpace(c.Request().Query("ref", "")); ref != "" {
		if len(ref) > 40 {
			ref = ref[:40]
		}
		storedVerifier = verifier + "|" + ref
	}
	db.DB.Where("expires_at < ?", time.Now()).Delete(&models.OAuthLoginState{})
	record := models.OAuthLoginState{StateHash: sha256Hex(state), Provider: p.name, CodeVerifier: storedVerifier, ExpiresAt: time.Now().Add(10 * time.Minute)}
	if db.DB.Create(&record).Error != nil {
		return oauthErrorRedirect(c, from, "oauth_failed", 500, "failed to initialize OAuth")
	}
	if p.devMode {
		return c.Response().Redirect(http.StatusFound, oauthRedirect(p.name)+"?state="+url.QueryEscape(state)+"&code=dev_"+p.name)
	}
	query := url.Values{"client_id": {p.clientID}, "redirect_uri": {oauthRedirect(p.name)}, "response_type": {"code"}, "scope": {p.scope}, "state": {state}, "code_challenge": {challenge}, "code_challenge_method": {"S256"}}
	if p.name == "tiktok" {
		query.Set("client_key", p.clientID)
		query.Del("client_id")
	}
	if p.name == "apple" {
		query.Set("response_mode", "form_post")
	}
	return c.Response().Redirect(http.StatusFound, p.authURL+"?"+query.Encode())
}

func (h *OAuthController) Callback(c goravelhttp.Context) goravelhttp.Response {
	providerName := strings.ToLower(c.Request().Route("provider"))
	p, err := providerConfig(providerName)
	if err != nil {
		return oauthErrorRedirect(c, "login", "oauth_not_configured", 503, err.Error())
	}
	if errParam := c.Request().Query("error", c.Request().Input("error")); errParam != "" {
		return oauthErrorRedirect(c, "login", "oauth_cancelled", 400, errParam)
	}
	state, code := c.Request().Input("state"), c.Request().Input("code")
	if state == "" {
		state = c.Request().Query("state", "")
	}
	if code == "" {
		code = c.Request().Query("code", "")
	}
	var stored models.OAuthLoginState
	if db.DB.Where("state_hash = ? AND provider = ?", sha256Hex(state), providerName).First(&stored).Error != nil || stored.ExpiresAt.Before(time.Now()) {
		return oauthErrorRedirect(c, "login", "oauth_expired", 400, "invalid or expired OAuth state")
	}
	db.DB.Delete(&stored)
	verifier, referralCode := stored.CodeVerifier, ""
	if parts := strings.SplitN(stored.CodeVerifier, "|", 2); len(parts) == 2 {
		verifier, referralCode = parts[0], parts[1]
	}

	var identity oauthIdentityPayload
	if p.devMode && strings.HasPrefix(code, "dev_") {
		title := strings.ToUpper(p.name[:1]) + p.name[1:]
		identity = oauthIdentityPayload{
			Subject:       "dev-" + p.name + "-user",
			Name:          title + " User",
			Email:         p.name + ".user@postter.local",
			EmailVerified: true,
		}
	} else {
		token, idToken, err := h.exchangeCode(p, code, verifier)
		if err != nil {
			return oauthErrorRedirect(c, "login", "oauth_failed", 401, err.Error())
		}
		identity, err = h.fetchIdentity(p, token, idToken)
		if err != nil {
			return oauthErrorRedirect(c, "login", "oauth_failed", 401, err.Error())
		}
		if p.name == "apple" {
			if appleName := parseAppleUserJSON(c.Request().Input("user")); appleName != "" {
				identity.Name = appleName
			}
		}
	}

	user, err := upsertOAuthUser(p.name, identity, referralCode)
	if err != nil {
		return oauthErrorRedirect(c, "login", "oauth_failed", 500, "failed to create OAuth account")
	}
	// Signing in with the provider within the 30-day window reactivates a
	// deleted account (OAuth-only users have no password for /reactivate).
	if user.AccountStatus == "pending_deletion" && user.DeletionRequestedAt != nil && user.DeletionRequestedAt.After(time.Now().Add(-30*24*time.Hour)) {
		if db.DB.Model(user).Updates(map[string]any{"account_status": "active", "deletion_requested_at": nil}).Error == nil {
			user.AccountStatus, user.DeletionRequestedAt = "active", nil
			session.Invalidate(user.ID)
		}
	}
	// OAuth must not bypass the blocked check of password login.
	if user.AccountStatus != "active" {
		return c.Response().Redirect(http.StatusFound, frontendURL("/login?oauth_error=account_inactive"))
	}
	tokens, err := services.IssueTokens(user)
	if err != nil {
		return oauthErrorRedirect(c, "login", "oauth_failed", 500, "failed to create session")
	}
	setAuthCookies(c, tokens.AccessToken, tokens.RefreshToken)
	// The browser arrives here through a top-level redirect from the provider,
	// so send it back into the SPA (the session lives in httpOnly cookies).
	return c.Response().Redirect(http.StatusFound, frontendURL("/"))
}

func parseAppleUserJSON(raw string) string {
	if strings.TrimSpace(raw) == "" {
		return ""
	}
	var payload struct {
		Name struct {
			FirstName string `json:"firstName"`
			LastName  string `json:"lastName"`
		} `json:"name"`
	}
	if json.Unmarshal([]byte(raw), &payload) != nil {
		return ""
	}
	return strings.TrimSpace(payload.Name.FirstName + " " + payload.Name.LastName)
}

func frontendURL(path string) string {
	base := strings.TrimRight(os.Getenv("FRONTEND_URL"), "/")
	if base == "" {
		base = strings.TrimRight(os.Getenv("APP_URL"), "/")
	}
	return base + path
}

func (h *OAuthController) exchangeCode(p oauthProvider, code, verifier string) (string, string, error) {
	if code == "" {
		return "", "", errors.New("OAuth authorization code is missing")
	}
	values := url.Values{"grant_type": {"authorization_code"}, "code": {code}, "redirect_uri": {oauthRedirect(p.name)}, "client_id": {p.clientID}, "client_secret": {p.clientSecret}, "code_verifier": {verifier}}
	if p.name == "tiktok" {
		values.Set("client_key", p.clientID)
		values.Del("client_id")
	}
	request, _ := http.NewRequestWithContext(context.Background(), http.MethodPost, p.tokenURL, strings.NewReader(values.Encode()))
	request.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	response, err := h.client.Do(request)
	if err != nil {
		return "", "", errors.New("OAuth token exchange failed")
	}
	defer response.Body.Close()
	body, _ := io.ReadAll(io.LimitReader(response.Body, 1<<20))
	if response.StatusCode < 200 || response.StatusCode >= 300 {
		return "", "", fmt.Errorf("OAuth token exchange returned HTTP %d", response.StatusCode)
	}
	var payload struct {
		AccessToken string `json:"access_token"`
		IDToken     string `json:"id_token"`
	}
	if json.Unmarshal(body, &payload) != nil || (payload.AccessToken == "" && payload.IDToken == "") {
		return "", "", errors.New("OAuth provider returned an invalid token")
	}
	return payload.AccessToken, payload.IDToken, nil
}

type oauthIdentityPayload struct {
	Subject, Name, Email, Avatar string
	EmailVerified                bool
}

// flexBool accepts a provider's "email_verified" claim whether it's encoded
// as a JSON boolean (Google, LinkedIn) or a string (some Apple identity
// tokens), defaulting to false on anything else.
type flexBool bool

func (f *flexBool) UnmarshalJSON(data []byte) error {
	*f = flexBool(strings.Trim(string(data), `"`) == "true")
	return nil
}

func (h *OAuthController) fetchIdentity(p oauthProvider, token, idToken string) (oauthIdentityPayload, error) {
	if p.name == "apple" {
		return identityFromJWT(idToken, p.clientID)
	}
	request, _ := http.NewRequest(http.MethodGet, p.userURL, nil)
	request.Header.Set("Authorization", "Bearer "+token)
	response, err := h.client.Do(request)
	if err != nil {
		return oauthIdentityPayload{}, err
	}
	defer response.Body.Close()
	if response.StatusCode < 200 || response.StatusCode >= 300 {
		return oauthIdentityPayload{}, fmt.Errorf("OAuth userinfo returned HTTP %d", response.StatusCode)
	}
	body, _ := io.ReadAll(io.LimitReader(response.Body, 1<<20))
	var generic struct {
		Sub           string          `json:"sub"`
		ID            string          `json:"id"`
		Name          string          `json:"name"`
		Email         string          `json:"email"`
		EmailVerified flexBool        `json:"email_verified"`
		Picture       json.RawMessage `json:"picture"`
		Data          struct {
			User struct {
				OpenID      string `json:"open_id"`
				DisplayName string `json:"display_name"`
				AvatarURL   string `json:"avatar_url"`
			} `json:"user"`
		} `json:"data"`
	}
	if json.Unmarshal(body, &generic) != nil {
		return oauthIdentityPayload{}, errors.New("invalid OAuth userinfo")
	}
	subject, name, avatar := generic.Sub, generic.Name, parseOAuthPicture(generic.Picture)
	if subject == "" {
		subject = generic.ID
	}
	if p.name == "tiktok" {
		subject, name, avatar = generic.Data.User.OpenID, generic.Data.User.DisplayName, generic.Data.User.AvatarURL
	}
	if subject == "" {
		return oauthIdentityPayload{}, errors.New("OAuth subject is missing")
	}
	emailVerified := bool(generic.EmailVerified)
	if p.name == "facebook" && generic.Email != "" {
		emailVerified = true
	}
	return oauthIdentityPayload{Subject: subject, Name: name, Email: generic.Email, Avatar: avatar, EmailVerified: emailVerified}, nil
}

func parseOAuthPicture(raw json.RawMessage) string {
	if len(raw) == 0 {
		return ""
	}
	var direct string
	if json.Unmarshal(raw, &direct) == nil {
		return direct
	}
	var fbPic struct {
		Data struct {
			URL string `json:"url"`
		} `json:"data"`
	}
	if json.Unmarshal(raw, &fbPic) == nil {
		return fbPic.Data.URL
	}
	return ""
}

func identityFromJWT(token, clientID string) (oauthIdentityPayload, error) {
	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		return oauthIdentityPayload{}, errors.New("Apple identity token is invalid")
	}
	payload, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return oauthIdentityPayload{}, err
	}
	var claims struct {
		Issuer        string   `json:"iss"`
		Audience      string   `json:"aud"`
		Subject       string   `json:"sub"`
		ExpiresAt     int64    `json:"exp"`
		Email         string   `json:"email"`
		EmailVerified flexBool `json:"email_verified"`
	}
	if parts[2] == "" || json.Unmarshal(payload, &claims) != nil || claims.Subject == "" || claims.Issuer != "https://appleid.apple.com" || (clientID != "" && claims.Audience != clientID) || claims.ExpiresAt <= time.Now().Unix() {
		return oauthIdentityPayload{}, errors.New("Apple identity token is invalid")
	}
	return oauthIdentityPayload{Subject: claims.Subject, Email: claims.Email, Name: "Apple User", EmailVerified: bool(claims.EmailVerified)}, nil
}

func upsertOAuthUser(provider string, identity oauthIdentityPayload, referralCode string) (*models.User, error) {
	var linked models.OAuthIdentity
	if db.DB.Where("provider = ? AND provider_user_id = ?", provider, identity.Subject).First(&linked).Error == nil {
		var user models.User
		return &user, db.DB.First(&user, linked.UserID).Error
	}
	var user models.User
	if identity.Email != "" && identity.EmailVerified {
		_ = db.DB.Where("LOWER(email) = LOWER(?)", identity.Email).First(&user).Error
	}
	if user.ID == 0 {
		password, _ := randomURLToken(48)
		encoded, _ := hash.HashPassword(password)
		name := strings.TrimSpace(identity.Name)
		if name == "" {
			name = strings.ToUpper(provider[:1]) + provider[1:] + " User"
		}
		base := normalizeOAuthUsername(name)
		username := base
		for n := 1; ; n++ {
			var count int64
			db.DB.Model(&models.User{}).Where("username = ?", username).Count(&count)
			if count == 0 {
				break
			}
			username = fmt.Sprintf("%s_%d", base, n)
		}
		email := strings.ToLower(strings.TrimSpace(identity.Email))
		if email == "" {
			email = provider + "-" + identity.Subject + "@oauth.invalid"
		}
		avatar := identity.Avatar
		user = models.User{Name: name, Username: &username, Email: email, Password: encoded, Role: models.RoleUser, AccountType: "personal", AccountStatus: "active", ProfileLayout: "grid", NeedsPassword: true}
		if avatar != "" {
			user.AvatarURL = &avatar
		}
		if err := db.DB.Create(&user).Error; err != nil {
			return nil, err
		}
		if ref := normalizeOAuthUsername(referralCode); ref != "" && ref != username {
			var referrer models.User
			if db.DB.Where("username = ? AND account_status = 'active'", ref).First(&referrer).Error == nil && referrer.ID != user.ID {
				_ = db.DB.Model(&models.User{}).Where("id = ?", referrer.ID).Update("referral_bonus_until", time.Now().Add(30*24*time.Hour)).Error
			}
		}
	}
	email := identity.Email
	linked = models.OAuthIdentity{UserID: user.ID, Provider: provider, ProviderUserID: identity.Subject}
	if email != "" {
		linked.Email = &email
	}
	if err := db.DB.Create(&linked).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

var oauthUsernameCleanup = regexp.MustCompile(`[^a-z0-9_]+`)

func normalizeOAuthUsername(value string) string {
	value = strings.ToLower(strings.TrimSpace(value))
	value = strings.ReplaceAll(value, " ", "_")
	value = strings.Trim(oauthUsernameCleanup.ReplaceAllString(value, ""), "_")
	if len(value) < 3 {
		value = "user"
	}
	if len(value) > 32 {
		value = value[:32]
	}
	return value
}
