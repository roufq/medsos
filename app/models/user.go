package models

import (
	"fmt"
	"strings"
	"time"
	"unicode"

	"gorm.io/gorm"
)

type UserRole string

const (
	RoleAdmin UserRole = "admin"
	RoleUser  UserRole = "user"
)

type User struct {
	PublicHash          *string    `gorm:"type:varchar(32);uniqueIndex" json:"public_hash"`
	ID                  int64      `gorm:"primaryKey;autoIncrement" json:"id"`
	Name                string     `gorm:"type:varchar(100);not null" json:"name"`
	Username            *string    `gorm:"type:varchar(50);uniqueIndex" json:"username,omitempty"`
	Email               string     `gorm:"type:varchar(100);not null;unique" json:"email"`
	Phone               *string    `gorm:"type:varchar(32);uniqueIndex" json:"phone,omitempty"`
	Password            string     `gorm:"type:varchar(255);not null" json:"-"`
	Role                UserRole   `gorm:"type:enum('admin','user');default:'user';not null" json:"role"`
	AccountType         string     `gorm:"type:varchar(20);not null;default:'personal'" json:"account_type"`
	AccountStatus       string     `gorm:"type:varchar(24);not null;default:'active';index" json:"account_status"`
	AvatarURL           *string    `gorm:"type:varchar(500)" json:"avatar_url"`
	CoverURL            *string    `gorm:"type:varchar(500)" json:"cover_url"`
	Bio                 *string    `gorm:"type:text" json:"bio"`
	Title               *string    `gorm:"type:varchar(100)" json:"title"`
	Company             *string    `gorm:"type:varchar(100)" json:"company"`
	Location            *string    `gorm:"type:varchar(100)" json:"location"`
	City                *string    `gorm:"type:varchar(100)" json:"city"`
	Country             *string    `gorm:"type:varchar(100)" json:"country"`
	Website             *string    `gorm:"type:varchar(500)" json:"website"`
	BirthDate           *time.Time `gorm:"type:date" json:"birth_date,omitempty"`
	BirthPlace          *string    `gorm:"type:varchar(100)" json:"birth_place,omitempty"`
	PhoneCountry        *string    `gorm:"type:char(2)" json:"phone_country,omitempty"`
	Gender              *string    `gorm:"type:varchar(20)" json:"gender,omitempty"`
	Interests           []string   `gorm:"serializer:json;type:text" json:"interests,omitempty"`
	ShopCategory        *string    `gorm:"type:varchar(100)" json:"shop_category,omitempty"`
	IsPrivate             bool       `gorm:"not null;default:false;index" json:"is_private"`
	SubscriptionPlan      string     `gorm:"type:varchar(20);not null;default:'free'" json:"subscription_plan"`
	IsBlueVerified        bool       `gorm:"not null;default:false" json:"is_blue_verified"`
	SubscriptionExpiresAt *time.Time `json:"subscription_expires_at,omitempty"`
	ReferralBonusUntil    *time.Time `json:"referral_bonus_until,omitempty"`
	ProfileLayout       string     `gorm:"type:varchar(10);not null;default:'grid'" json:"profile_layout"`
	EmailVerifiedAt     *time.Time `json:"email_verified_at,omitempty"`
	PhoneVerifiedAt     *time.Time `json:"phone_verified_at,omitempty"`
	PasswordChangedAt   *time.Time `json:"password_changed_at,omitempty"`
	// NeedsPassword marks accounts created through OAuth that never chose a
	// local password; they may set one without supplying a current password.
	NeedsPassword bool `gorm:"not null;default:false" json:"needs_password"`
	// TokenVersion is embedded in every issued JWT. Bumping it revokes all of
	// the user's outstanding access and refresh tokens at once.
	TokenVersion int64 `gorm:"not null;default:0" json:"-"`
	DeletionRequestedAt *time.Time `gorm:"index" json:"deletion_requested_at,omitempty"`
	CreatedAt           time.Time  `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt           time.Time  `gorm:"autoUpdateTime" json:"updated_at"`
	FollowersCount      int64      `gorm:"column:followers_count;->" json:"followers_count"`
	FollowingCount      int64      `gorm:"column:following_count;->" json:"following_count"`
	IsFollowedByMe      bool       `gorm:"column:is_followed_by_me;->" json:"is_followed_by_me"`
	// FollowStatus is the viewer's follow state: "", "pending", or "accepted".
	FollowStatus string `gorm:"-" json:"follow_status,omitempty"`
	// ProfileLocked is set when a private profile is shown to a non-follower:
	// only the public header is returned.
	ProfileLocked bool `gorm:"-" json:"profile_locked,omitempty"`
	IsBlockedByMe bool `gorm:"-" json:"is_blocked_by_me,omitempty"`

	Likes     []PostLike    `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"likes,omitempty"`
	Comments  []PostComment `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"comments,omitempty"`
	Followers []Follow      `gorm:"foreignKey:FollowedID;constraint:OnDelete:CASCADE" json:"followers,omitempty"`
	Following []Follow      `gorm:"foreignKey:FollowerID;constraint:OnDelete:CASCADE" json:"following,omitempty"`
}

// HidePrivateData keeps public user payloads limited to profile information.
// Authentication and account endpoints can still return the complete owner record.
func (u *User) HidePrivateData() {
	u.Email = ""
	u.Phone = nil
	u.BirthDate = nil
	u.BirthPlace = nil
	u.PhoneCountry = nil
	u.NeedsPassword = false
	u.Gender = nil
	u.EmailVerifiedAt = nil
	u.PhoneVerifiedAt = nil
	u.PasswordChangedAt = nil
	u.DeletionRequestedAt = nil
	u.SubscriptionExpiresAt = nil
	u.ReferralBonusUntil = nil
}

// AfterFind reverts expired paid subscriptions to free and removes Blue Verified.
func (u *User) AfterFind(tx *gorm.DB) error {
	if u.ID > 0 && (u.PublicHash == nil || *u.PublicHash == "") {
		if token, err := NewPostHash(); err == nil {
			u.PublicHash = &token
			if tx != nil {
				_ = tx.Session(&gorm.Session{SkipHooks: true, NewDB: true}).Model(&User{}).Where("id = ? AND (public_hash IS NULL OR public_hash = '')", u.ID).UpdateColumn("public_hash", token).Error
			}
		}
	}
	if u.SubscriptionPlan != "" && u.SubscriptionPlan != "free" && u.SubscriptionExpiresAt != nil && u.SubscriptionExpiresAt.Before(time.Now()) {
		u.SubscriptionPlan = "free"
		u.IsBlueVerified = false
		u.SubscriptionExpiresAt = nil
		if tx != nil && u.ID > 0 {
			_ = tx.Session(&gorm.Session{SkipHooks: true, NewDB: true}).Model(&User{}).Where("id = ?", u.ID).Updates(map[string]any{
				"subscription_plan":       "free",
				"is_blue_verified":        false,
				"subscription_expires_at": nil,
			}).Error
		}
	}
	return nil
}

// GenerateUsername builds a unique lowercase username from name or email.
func GenerateUsername(tx *gorm.DB, name, email string, excludeID int64) string {
	raw := strings.TrimSpace(name)
	if raw == "" {
		if at := strings.IndexByte(email, '@'); at > 0 {
			raw = email[:at]
		}
	}
	var b strings.Builder
	lastUnderscore := false
	for _, r := range strings.ToLower(raw) {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') {
			b.WriteRune(r)
			lastUnderscore = false
		} else if !lastUnderscore && b.Len() > 0 && (unicode.IsSpace(r) || r == '_' || r == '.' || r == '-') {
			b.WriteByte('_')
			lastUnderscore = true
		}
		if b.Len() >= 28 {
			break
		}
	}
	base := strings.Trim(b.String(), "_")
	for len(base) < 3 {
		base += "user"
	}
	if len(base) > 28 {
		base = base[:28]
	}
	candidate := base
	for suffix := 1; tx != nil && suffix < 10000; suffix++ {
		var count int64
		tx.Model(&User{}).Where("LOWER(username) = ? AND id != ?", candidate, excludeID).Count(&count)
		if count == 0 {
			return candidate
		}
		candidate = fmt.Sprintf("%s_%d", base, suffix)
	}
	return candidate
}

func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.PublicHash == nil || strings.TrimSpace(*u.PublicHash) == "" {
		if token, err := NewPostHash(); err == nil {
			u.PublicHash = &token
		}
	}
	if u.Username == nil || strings.TrimSpace(*u.Username) == "" {
		uname := GenerateUsername(tx, u.Name, u.Email, u.ID)
		u.Username = &uname
	}
	return nil
}
