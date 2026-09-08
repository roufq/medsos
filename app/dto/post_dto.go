package dto

import "goravel/app/models"

// CreatePostRequest defines the fields required to create a new post
type CreatePostRequest struct {
	Title     string          `json:"title"`
	Content   string          `json:"content"`
	PostType  models.PostType `json:"post_type" binding:"required"`
	MediaURLs []string        `json:"media_urls"` // Array of URLs if type is image/video
	LinkURL   string          `json:"link_url"`   // URL string if type is link
}

// LinkPreviewRequest defines the query payload for parsing webpage info
type LinkPreviewRequest struct {
	URL string `form:"url" binding:"required,url"`
}
