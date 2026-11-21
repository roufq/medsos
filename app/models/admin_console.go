package models

import "time"

type AdCampaign struct {
	ID          int64     `gorm:"primaryKey" json:"id"`
	Title       string    `gorm:"size:160;not null" json:"title"`
	Description string    `gorm:"size:500" json:"description"`
	ImageURL    string    `gorm:"size:500" json:"image_url"`
	TargetURL   string    `gorm:"size:500" json:"target_url"`
	Placement   string    `gorm:"size:30;index" json:"placement"`
	Status      string    `gorm:"size:20;index" json:"status"`
	StartsAt    time.Time `json:"starts_at"`
	EndsAt      time.Time `json:"ends_at"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	Impressions int64     `gorm:"->" json:"impressions"`
	Clicks      int64     `gorm:"->" json:"clicks"`
}

// Statistics omit IP addresses, query strings, and browser identifiers.
type TrafficEvent struct {
	ID        uint64    `gorm:"primaryKey" json:"id"`
	Kind      string    `gorm:"size:24;index:idx_traffic_date,priority:1" json:"kind"`
	Source    string    `gorm:"size:20" json:"source"`
	Path      string    `gorm:"size:255" json:"path"`
	AdID      int64     `gorm:"index" json:"ad_id"`
	CreatedAt time.Time `gorm:"index:idx_traffic_date,priority:2" json:"created_at"`
}
