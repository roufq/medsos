package dto

import "goravel/app/models"

// MediaItem is an uploaded file resolved on the server (never trusted from
// the client): its type and duration were measured at upload time.
type MediaItem struct {
	URL             string
	Type            models.MediaType
	DurationSeconds int
}

// CreatePostRequest defines the fields required to create a new post.
// MediaURLs/ImageURLs/VideoURL must reference the author's own uploads.
type CreatePostRequest struct {
	Title      string           `json:"title"`
	Content    string           `json:"content"`
	PostType   models.PostType  `json:"post_type" binding:"required"`
	MediaURLs  []string         `json:"media_urls"`
	ImageURLs  []string         `json:"image_urls"`
	VideoURL   string           `json:"video_url"`
	LinkURL    string           `json:"link_url"`
	Hashtags   []string         `json:"hashtags"`
	Mentions   []string         `json:"mentions"`
	Location   string           `json:"location"`
	Visibility string           `json:"visibility"`
	Shop       *ShopPostRequest `json:"shop,omitempty"`

	// Media is filled by the controller from server-side upload records.
	Media []MediaItem `json:"-"`
}

// UpdatePostRequest carries a partial edit; nil fields are left unchanged.
// A non-nil empty slice clears the field (e.g. "media_urls": []).
type UpdatePostRequest struct {
	Title      *string          `json:"title"`
	Content    *string          `json:"content"`
	Location   *string          `json:"location"`
	Visibility *string          `json:"visibility"`
	LinkURL    *string          `json:"link_url"`
	Hashtags   []string         `json:"hashtags"`
	Mentions   []string         `json:"mentions"`
	MediaURLs  []string         `json:"media_urls"`
	Shop       *ShopPostRequest `json:"shop,omitempty"`

	Media []MediaItem `json:"-"`
}

type ShopPostRequest struct {
	PriceMinor      int64  `json:"price_minor"`
	Currency        string `json:"currency"`
	Category        string `json:"category"`
	Condition       string `json:"condition"`
	Stock           *int64 `json:"stock"`
	Brand           string `json:"brand"`
	Fulfillment     string `json:"fulfillment"`
	PaymentMethod   string `json:"payment_method"`
	SellerAccountID string `json:"seller_account_id"`
}

// LinkPreviewRequest defines the query payload for parsing webpage info
type LinkPreviewRequest struct {
	URL string `form:"url" binding:"required,url"`
}
