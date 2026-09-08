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
	ID        int64     `gorm:"primaryKey;autoIncrement" json:"id"`
	Name      string    `gorm:"type:varchar(100);not null" json:"name"`
	Email     string    `gorm:"type:varchar(100);not null;unique" json:"email"`
	Password  string    `gorm:"type:varchar(255);not null" json:"-"` // never return password in JSON
	Role      UserRole  `gorm:"type:enum('admin','user');default:'user';not null" json:"role"`
	AvatarURL *string   `gorm:"type:varchar(255)" json:"avatar_url"`
	CoverURL  *string   `gorm:"type:varchar(255)" json:"cover_url"`
	Bio       *string   `gorm:"type:text" json:"bio"`
	Title     *string   `gorm:"type:varchar(100)" json:"title"`
	Company   *string   `gorm:"type:varchar(100)" json:"company"`
	Location  *string   `gorm:"type:varchar(100)" json:"location"`
	Website   *string   `gorm:"type:varchar(255)" json:"website"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updated_at"`

	Likes     []PostLike    `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"likes,omitempty"`
	Comments  []PostComment `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"comments,omitempty"`
	Followers []Follow      `gorm:"foreignKey:FollowedID;constraint:OnDelete:CASCADE" json:"followers,omitempty"`
	Following []Follow      `gorm:"foreignKey:FollowerID;constraint:OnDelete:CASCADE" json:"following,omitempty"`
}
