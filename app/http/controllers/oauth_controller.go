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
	"goravel/pkg/db"
	"goravel/pkg/hash"
	appjwt "goravel/pkg/jwt"

	goravelhttp "github.com/goravel/framework/contracts/http"
)

type OAuthController struct{ client *http.Client }

func NewOAuthController() *OAuthController {
	return &OAuthController{client: &http.Client{Timeout: 12 * time.Second}}
}

type oauthProvider struct{ name, clientID, clientSecret, authURL, tokenURL, userURL, scope string }

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

func (h *OAuthController) Start(c goravelhttp.Context) goravelhttp.Response {
	p, err := providerConfig(c.Request().Route("provider"))
	if err != nil {
		return c.Response().Json(503, goravelhttp.Json{"error": err.Error()})
	}
	state, err := randomURLToken(32)
	if err != nil {
		return c.Response().Json(500, goravelhttp.Json{"error": "failed to initialize OAuth"})
	}
	verifier, _ := randomURLToken(48)
	challengeBytes := sha256.Sum256([]byte(verifier))
	challenge := base64.RawURLEncoding.EncodeToString(challengeBytes[:])
	db.DB.Where("expires_at < ?", time.Now()).Delete(&models.OAuthLoginState{})
	record := models.OAuthLoginState{StateHash: sha256Hex(state), Provider: p.name, CodeVerifier: verifier, ExpiresAt: time.Now().Add(10 * time.Minute)}
	if db.DB.Create(&record).Error != nil {
		return c.Response().Json(500, goravelhttp.Json{"error": "failed to initialize OAuth"})
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
		return c.Response().Json(503, goravelhttp.Json{"error": err.Error()})
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
		return c.Response().Json(400, goravelhttp.Json{"error": "invalid or expired OAuth state"})
	}
	db.DB.Delete(&stored)
	token, idToken, err := h.exchangeCode(p, code, stored.CodeVerifier)
	if err != nil {
		return c.Response().Json(401, goravelhttp.Json{"error": err.Error()})
	}
	identity, err := h.fetchIdentity(p, token, idToken)
	if err != nil {
		return c.Response().Json(401, goravelhttp.Json{"error": err.Error()})
	}
	user, err := upsertOAuthUser(p.name, identity)
	if err != nil {
		return c.Response().Json(500, goravelhttp.Json{"error": "failed to create OAuth account"})
	}
	access, err := appjwt.GenerateAccessToken(user)
	if err != nil {
		return c.Response().Json(500, goravelhttp.Json{"error": "failed to create session"})
	}
	refresh, _ := appjwt.GenerateRefreshToken(user)
	setAuthCookies(c, access, refresh)
	return c.Response().Json(200, goravelhttp.Json{"access_token": access, "refresh_token": refresh, "user": user})
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
	if json.Unmarshal(body, &payload) != nil || payload.AccessToken == "" {
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
		return identityFromJWT(idToken)
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
		Sub           string   `json:"sub"`
		ID            string   `json:"id"`
		Name          string   `json:"name"`
		Email         string   `json:"email"`
		EmailVerified flexBool `json:"email_verified"`
		Picture       string   `json:"picture"`
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
	subject, name, avatar := generic.Sub, generic.Name, generic.Picture
	if subject == "" {
		subject = generic.ID
	}
	if p.name == "tiktok" {
		subject, name, avatar = generic.Data.User.OpenID, generic.Data.User.DisplayName, generic.Data.User.AvatarURL
	}
	if subject == "" {
		return oauthIdentityPayload{}, errors.New("OAuth subject is missing")
	}
	// Google and LinkedIn's OIDC userinfo endpoints report email_verified
	// directly. Facebook's Graph API doesn't return the field at all, but
	// only ever returns addresses it has already verified, so treat any
	// Facebook email as verified. TikTok's userinfo scope here never
	// includes an email, so this is moot for that provider.
	emailVerified := bool(generic.EmailVerified)
	if p.name == "facebook" && generic.Email != "" {
		emailVerified = true
	}
	return oauthIdentityPayload{Subject: subject, Name: name, Email: generic.Email, Avatar: avatar, EmailVerified: emailVerified}, nil
}

func identityFromJWT(token string) (oauthIdentityPayload, error) {
	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		return oauthIdentityPayload{}, errors.New("Apple identity token is invalid")
	}
	payload, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return oauthIdentityPayload{}, err
	}
	var claims struct {
		Subject       string   `json:"sub"`
		Email         string   `json:"email"`
		EmailVerified flexBool `json:"email_verified"`
	}
	if json.Unmarshal(payload, &claims) != nil || claims.Subject == "" {
		return oauthIdentityPayload{}, errors.New("Apple identity token is invalid")
	}
	return oauthIdentityPayload{Subject: claims.Subject, Email: claims.Email, Name: "Apple User", EmailVerified: bool(claims.EmailVerified)}, nil
}

func upsertOAuthUser(provider string, identity oauthIdentityPayload) (*models.User, error) {
	var linked models.OAuthIdentity
	if db.DB.Where("provider = ? AND provider_user_id = ?", provider, identity.Subject).First(&linked).Error == nil {
		var user models.User
		return &user, db.DB.First(&user, linked.UserID).Error
	}
	var user models.User
	// Only auto-link to an existing account by email when the provider
	// vouches for it — an unverified email could belong to someone else,
	// which would otherwise let an attacker take over that account by
	// signing in through an OAuth provider with a spoofed/unverified address.
	if identity.Email != "" && identity.EmailVerified {
		_ = db.DB.Where("LOWER(email) = LOWER(?)", identity.Email).First(&user).Error
	}
	if user.ID == 0 {
		password, _ := randomURLToken(48)
		encoded, _ := hash.HashPassword(password)
		name := strings.TrimSpace(identity.Name)
		if name == "" {
			name = strings.Title(provider) + " User"
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
		user = models.User{Name: name, Username: &username, Email: email, Password: encoded, Role: models.RoleUser, AccountType: "personal", AccountStatus: "active", ProfileLayout: "grid"}
		if avatar != "" {
			user.AvatarURL = &avatar
		}
		if err := db.DB.Create(&user).Error; err != nil {
			return nil, err
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
