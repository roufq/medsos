package models

import "time"

type PlatformSetting struct {
	GuestPosting             bool      `gorm:"not null;default:false" json:"guest_posting"`
	ID                       uint      `gorm:"primaryKey" json:"-"`
	UploadLimitsEnabled      bool      `gorm:"not null;default:false" json:"upload_limits_enabled"`
	SiteName                 string    `gorm:"size:100" json:"site_name"`
	Description              string    `gorm:"size:500" json:"description"`
	LogoURL                  string    `gorm:"size:500" json:"logo_url"`
	Language                 string    `gorm:"size:5" json:"language"`
	Timezone                 string    `gorm:"size:60" json:"timezone"`
	DefaultFeed              string    `gorm:"size:20" json:"default_feed"`
	ItemsPerPage             int       `json:"items_per_page"`
	RegistrationClosed       bool      `gorm:"not null;default:false" json:"registration_closed"`
	RequireEmailVerification bool      `gorm:"not null;default:false" json:"require_email_verification"`
	RequireAdminTwoFactor    bool      `gorm:"not null;default:false" json:"require_admin_two_factor"`
	Maintenance              bool      `gorm:"not null;default:false" json:"maintenance"`
	MaintenanceMessage       string    `gorm:"size:500" json:"maintenance_message"`
	AnalyticsEnabled         bool      `gorm:"not null;default:true" json:"analytics_enabled"`
	AdsEnabled               bool      `gorm:"not null;default:true" json:"ads_enabled"`
	EmailNotifications       bool      `gorm:"not null;default:false" json:"email_notifications"`
	PushNotifications        bool      `gorm:"not null;default:false" json:"push_notifications"`
	AdminNotifications       bool      `gorm:"not null;default:true" json:"admin_notifications"`
	UpdatedAt                time.Time `json:"updated_at"`
}

type UserActivity struct {
	ID          uint64    `gorm:"primaryKey" json:"id"`
	UserID      int64     `gorm:"index;not null" json:"user_id"`
	User        User      `gorm:"foreignKey:UserID" json:"user"`
	Action      string    `gorm:"size:32;not null" json:"action"`
	Target      string    `gorm:"size:255" json:"target"`
	Description string    `gorm:"size:255" json:"description"`
	Reason      string    `gorm:"size:300" json:"reason,omitempty"`
	IPAddress   string    `gorm:"size:64" json:"ip_address,omitempty"`
	CreatedAt   time.Time `gorm:"index" json:"created_at"`
}
