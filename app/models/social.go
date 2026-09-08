package models

import "time"

type UserBlock struct {
	ID        int64     `gorm:"primaryKey;autoIncrement" json:"id"`
	BlockerID int64     `gorm:"not null;uniqueIndex:idx_user_block" json:"blocker_id"`
	BlockedID int64     `gorm:"not null;uniqueIndex:idx_user_block;index" json:"blocked_id"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
}

type SavedPost struct {
	ID        int64     `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID    int64     `gorm:"not null;uniqueIndex:idx_saved_post" json:"user_id"`
	PostID    int64     `gorm:"not null;uniqueIndex:idx_saved_post;index" json:"post_id"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
}

type PostHashtag struct {
	ID     int64  `gorm:"primaryKey;autoIncrement" json:"id"`
	PostID int64  `gorm:"not null;uniqueIndex:idx_post_hashtag" json:"post_id"`
	Tag    string `gorm:"type:varchar(64);not null;uniqueIndex:idx_post_hashtag;index" json:"tag"`
}

type PostMention struct {
	ID              int64 `gorm:"primaryKey;autoIncrement" json:"id"`
	PostID          int64 `gorm:"not null;uniqueIndex:idx_post_mention" json:"post_id"`
	MentionedUserID int64 `gorm:"not null;uniqueIndex:idx_post_mention;index" json:"mentioned_user_id"`
	User            User  `gorm:"foreignKey:MentionedUserID" json:"user"`
}

type PostView struct {
	ID        int64     `gorm:"primaryKey;autoIncrement" json:"id"`
	PostID    int64     `gorm:"not null;uniqueIndex:idx_post_viewer;index" json:"post_id"`
	UserID    int64     `gorm:"not null;uniqueIndex:idx_post_viewer;index" json:"user_id"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
}

type PostShare struct {
	ID        int64     `gorm:"primaryKey;autoIncrement" json:"id"`
	PostID    int64     `gorm:"not null;index" json:"post_id"`
	UserID    int64     `gorm:"not null;index" json:"user_id"`
	Channel   string    `gorm:"type:varchar(32);not null" json:"channel"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
}

type PostReport struct {
	ID         int64      `gorm:"primaryKey;autoIncrement" json:"id"`
	PostID     int64      `gorm:"not null;uniqueIndex:idx_post_reporter;index" json:"post_id"`
	ReporterID int64      `gorm:"not null;uniqueIndex:idx_post_reporter;index" json:"reporter_id"`
	Reason     string     `gorm:"type:varchar(100);not null;index" json:"reason"`
	Details    string     `gorm:"type:text" json:"details,omitempty"`
	Status     string     `gorm:"type:varchar(20);not null;default:'pending';index" json:"status"`
	ReviewedBy *int64     `json:"reviewed_by,omitempty"`
	ReviewedAt *time.Time `json:"reviewed_at,omitempty"`
	CreatedAt  time.Time  `gorm:"autoCreateTime" json:"created_at"`
}

type Notification struct {
	ID         int64      `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID     int64      `gorm:"not null;index:idx_notification_user_created,priority:1" json:"user_id"`
	ActorID    *int64     `gorm:"index" json:"actor_id,omitempty"`
	Type       string     `gorm:"type:varchar(32);not null;index" json:"type"`
	EntityType string     `gorm:"type:varchar(32)" json:"entity_type,omitempty"`
	EntityID   *int64     `json:"entity_id,omitempty"`
	Message    string     `gorm:"type:varchar(500);not null" json:"message"`
	ReadAt     *time.Time `json:"read_at,omitempty"`
	CreatedAt  time.Time  `gorm:"autoCreateTime;index:idx_notification_user_created,priority:2" json:"created_at"`
	Actor      *User      `gorm:"foreignKey:ActorID" json:"actor,omitempty"`
}

type ShopProduct struct {
	ID              int64   `gorm:"primaryKey;autoIncrement" json:"id"`
	PostID          int64   `gorm:"not null;uniqueIndex" json:"post_id"`
	PriceMinor      int64   `gorm:"not null;index" json:"price_minor"`
	Currency        string  `gorm:"type:char(3);not null;index" json:"currency"`
	Category        string  `gorm:"type:varchar(100);not null;index" json:"category"`
	Condition       string  `gorm:"type:varchar(12);not null;index" json:"condition"`
	Stock           *int64  `json:"stock,omitempty"`
	Brand           *string `gorm:"type:varchar(100)" json:"brand,omitempty"`
	Fulfillment     string  `gorm:"type:varchar(100)" json:"fulfillment,omitempty"`
	PaymentMethod   string  `gorm:"type:varchar(100)" json:"payment_method,omitempty"`
	SellerAccountID *string `gorm:"type:varchar(100)" json:"seller_account_id,omitempty"`
}

type VerificationCode struct {
	ID        int64      `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID    int64      `gorm:"not null;index" json:"user_id"`
	Target    string     `gorm:"type:varchar(191);not null;index" json:"-"`
	Channel   string     `gorm:"type:varchar(20);not null" json:"channel"`
	Purpose   string     `gorm:"type:varchar(32);not null;index" json:"purpose"`
	CodeHash  string     `gorm:"type:varchar(255);not null" json:"-"`
	Attempts  int        `gorm:"not null;default:0" json:"-"`
	ExpiresAt time.Time  `gorm:"not null;index" json:"expires_at"`
	UsedAt    *time.Time `json:"used_at,omitempty"`
	CreatedAt time.Time  `gorm:"autoCreateTime" json:"created_at"`
}

type OAuthIdentity struct {
	ID             int64     `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID         int64     `gorm:"not null;index" json:"user_id"`
	Provider       string    `gorm:"type:varchar(20);not null;uniqueIndex:idx_oauth_provider_subject" json:"provider"`
	ProviderUserID string    `gorm:"type:varchar(191);not null;uniqueIndex:idx_oauth_provider_subject" json:"provider_user_id"`
	Email          *string   `gorm:"type:varchar(191)" json:"email,omitempty"`
	CreatedAt      time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt      time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

type OAuthLoginState struct {
	ID           int64     `gorm:"primaryKey;autoIncrement" json:"-"`
	StateHash    string    `gorm:"type:char(64);not null;uniqueIndex" json:"-"`
	Provider     string    `gorm:"type:varchar(20);not null" json:"provider"`
	CodeVerifier string    `gorm:"type:varchar(128);not null" json:"-"`
	ExpiresAt    time.Time `gorm:"not null;index" json:"-"`
	CreatedAt    time.Time `gorm:"autoCreateTime" json:"-"`
}
