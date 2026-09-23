package models

import (
	"time"
)

type UserRole string

const (
	RoleAdmin UserRole = "admin"
	RoleUser  UserRole = "user"
)

type User struct {
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
	Gender              *string    `gorm:"type:varchar(20)" json:"gender,omitempty"`
	Interests           []string   `gorm:"serializer:json;type:text" json:"interests,omitempty"`
	ShopCategory        *string    `gorm:"type:varchar(100)" json:"shop_category,omitempty"`
	IsPrivate           bool       `gorm:"not null;default:false;index" json:"is_private"`
	ProfileLayout       string     `gorm:"type:varchar(10);not null;default:'grid'" json:"profile_layout"`
	EmailVerifiedAt     *time.Time `json:"email_verified_at,omitempty"`
	PhoneVerifiedAt     *time.Time `json:"phone_verified_at,omitempty"`
	PasswordChangedAt   *time.Time `json:"password_changed_at,omitempty"`
	DeletionRequestedAt *time.Time `gorm:"index" json:"deletion_requested_at,omitempty"`
	CreatedAt           time.Time  `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt           time.Time  `gorm:"autoUpdateTime" json:"updated_at"`
	FollowersCount      int64      `gorm:"column:followers_count;->" json:"followers_count"`
	FollowingCount      int64      `gorm:"column:following_count;->" json:"following_count"`
	IsFollowedByMe      bool       `gorm:"column:is_followed_by_me;->" json:"is_followed_by_me"`

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
	u.Gender = nil
	u.EmailVerifiedAt = nil
	u.PhoneVerifiedAt = nil
	u.PasswordChangedAt = nil
	u.DeletionRequestedAt = nil
}
