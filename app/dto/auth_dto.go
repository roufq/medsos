package dto

import (
	"goravel/app/models"
)

// RegisterRequest defines the input payload for user registration
type RegisterRequest struct {
	Name     string `form:"name" json:"name" binding:"required,min=2,max=100"`
	Email    string `form:"email" json:"email" binding:"required,email,max=100"`
	Password string `form:"password" json:"password" binding:"required,min=6,max=255"`
}

// LoginRequest defines the credentials payload for log in
type LoginRequest struct {
	Email    string `form:"email" json:"email" binding:"required,email"`
	Password string `form:"password" json:"password" binding:"required"`
}

// RefreshRequest defines the input payload for token rotation
type RefreshRequest struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

// AuthResponse defines the standard payload returned upon successful auth
type AuthResponse struct {
	AccessToken  string      `json:"access_token"`
	RefreshToken string      `json:"refresh_token"`
	User         models.User `json:"user"`
}
