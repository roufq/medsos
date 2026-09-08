package dto

import "goravel/app/models"

// CreatePostRequest defines the fields required to create a new post
type CreatePostRequest struct {
	Title      string           `json:"title"`
	Content    string           `json:"content"`
	PostType   models.PostType  `json:"post_type" binding:"required"`
	MediaURLs  []string         `json:"media_urls"`
	ImageURLs  []string         `json:"image_urls"`
	VideoURL   string           `json:"video_url"`
	MediaDurations []int        `json:"-"`
	LinkURL    string           `json:"link_url"`
	Hashtags   []string         `json:"hashtags"`
	Mentions   []string         `json:"mentions"`
	Location   string           `json:"location"`
	Visibility string           `json:"visibility"`
	Shop       *ShopPostRequest `json:"shop,omitempty"`
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
	VideoDurationSeconds int `json:"-"`
}

// LinkPreviewRequest defines the query payload for parsing webpage info
type LinkPreviewRequest struct {
	URL string `form:"url" binding:"required,url"`
}
