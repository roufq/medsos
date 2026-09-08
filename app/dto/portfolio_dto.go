package dto

type CreatePortfolioRequest struct {
	Title       string `json:"title" binding:"required"`
	Description string `json:"description"`
	ProjectType string `json:"project_type" binding:"required"`
	ImageURL    string `json:"image_url" binding:"required"`
	LinkURL     string `json:"link_url"`
}
