package jobs

import (
	"strings"
	"testing"

	"github.com/stretchr/testify/require"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	"goravel/app/models"
	"goravel/pkg/db"
	"goravel/pkg/linkpreview"
)

func TestFetchLinkPreviewUpdatesQueuedLink(t *testing.T) {
	testDB, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil && strings.Contains(err.Error(), "requires cgo") {
		t.Skip("SQLite integration test requires CGO")
	}
	require.NoError(t, err)
	if err := testDB.AutoMigrate(&models.PostLink{}); err != nil && strings.Contains(err.Error(), "requires cgo") {
		t.Skip("SQLite integration test requires CGO")
	} else {
		require.NoError(t, err)
	}

	previousDB := db.DB
	previousFetch := fetchPreview
	db.DB = testDB
	fetchPreview = func(targetURL string) (*linkpreview.Preview, error) {
		return &linkpreview.Preview{
			URL: targetURL, Title: "Example", Description: "Queued preview", SiteName: "Example Site",
		}, nil
	}
	t.Cleanup(func() {
		db.DB = previousDB
		fetchPreview = previousFetch
	})

	link := models.PostLink{PostID: 42, URL: "https://example.com", PreviewStatus: models.LinkPreviewPending}
	require.NoError(t, testDB.Create(&link).Error)
	require.NoError(t, (&FetchLinkPreview{}).Handle(link.ID))

	var updated models.PostLink
	require.NoError(t, testDB.First(&updated, link.ID).Error)
	require.Equal(t, models.LinkPreviewReady, updated.PreviewStatus)
	require.NotNil(t, updated.Title)
	require.Equal(t, "Example", *updated.Title)
}

func TestFetchLinkPreviewRetriesAreBounded(t *testing.T) {
	job := &FetchLinkPreview{}

	retry, delay := job.ShouldRetry(assertionError{}, 1)
	require.True(t, retry)
	require.Positive(t, delay)
	retry, delay = job.ShouldRetry(assertionError{}, 3)
	require.False(t, retry)
	require.Zero(t, delay)
}

type assertionError struct{}

func (assertionError) Error() string { return "test error" }
