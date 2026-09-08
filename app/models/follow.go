package models

import (
	"time"
)

type Follow struct {
	ID         int64     `gorm:"primaryKey;autoIncrement" json:"id"`
	FollowerID int64     `gorm:"not null;uniqueIndex:idx_follower_followed;index:idx_follower_status,priority:1" json:"follower_id"`
	FollowedID int64     `gorm:"not null;uniqueIndex:idx_follower_followed;index:idx_followed_status,priority:1" json:"followed_id"`
	Status     string    `gorm:"type:varchar(20);default:'pending';index:idx_follower_status,priority:2;index:idx_followed_status,priority:2" json:"status"`
	CreatedAt  time.Time `gorm:"autoCreateTime" json:"created_at"`

	Follower *User `gorm:"foreignKey:FollowerID;constraint:OnDelete:CASCADE" json:"follower,omitempty"`
	Followed *User `gorm:"foreignKey:FollowedID;constraint:OnDelete:CASCADE" json:"followed,omitempty"`
}
