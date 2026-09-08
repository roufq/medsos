package jobs

import (
	"errors"
	"fmt"
	"time"

	"goravel/app/models"
	"goravel/pkg/db"
	"goravel/pkg/linkpreview"
)

// FetchLinkPreview resolves external metadata outside the user's request.
type FetchLinkPreview struct{}

var fetchPreview = linkpreview.FetchPreview

func (receiver *FetchLinkPreview) Signature() string {
	return "fetch_link_preview"
}

func (receiver *FetchLinkPreview) Handle(args ...any) error {
	if len(args) != 1 {
		return errors.New("fetch_link_preview requires a post link ID")
	}

	linkID, ok := args[0].(int64)
	if !ok || linkID <= 0 {
		return fmt.Errorf("invalid post link ID: %v", args[0])
	}

	var link models.PostLink
	if err := db.DB.First(&link, linkID).Error; err != nil {
		return err
	}

	if err := db.DB.Model(&link).Update("preview_status", models.LinkPreviewProcessing).Error; err != nil {
		return err
	}

	preview, err := fetchPreview(link.URL)
	if err != nil {
		_ = db.DB.Model(&link).Updates(map[string]any{
			"preview_status": models.LinkPreviewFailed,
			"preview_error":  "preview temporarily unavailable",
		}).Error
		return err
	}

	return db.DB.Model(&link).Updates(map[string]any{
		"title":          preview.Title,
		"description":    preview.Description,
		"image_url":      preview.ImageURL,
		"site_name":      preview.SiteName,
		"preview_status": models.LinkPreviewReady,
		"preview_error":  "",
	}).Error
}

func (receiver *FetchLinkPreview) ShouldRetry(_ error, attempt int) (bool, time.Duration) {
	if attempt >= 3 {
		return false, 0
	}
	return true, time.Duration(attempt*attempt) * time.Second
}
