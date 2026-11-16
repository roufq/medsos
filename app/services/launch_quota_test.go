package services

import (
	"github.com/stretchr/testify/require"
	"goravel/app/dto"
	"goravel/app/models"
	"goravel/app/repositories"
	support "goravel/tests/support"
	"strings"
	"testing"
)

func TestLaunchUploadQuotaCanBeEnabledAndDisabled(t *testing.T) {
	connection := support.RevisionDB(t)
	support.User(t, connection, 1, false, "active")
	service := NewPostService(repositories.NewPostRepository(), repositories.NewUserRepository())
	draft := func() *dto.CreatePostRequest {
		return &dto.CreatePostRequest{Title: "Cerita untuk pengujian", Content: strings.Repeat("kata ", 180), PostType: models.PostTypeText, Hashtags: []string{"satu", "dua", "tiga"}, Visibility: "public"}
	}
	for i := 0; i < 3; i++ {
		_, err := service.CreatePost(1, draft())
		require.NoError(t, err, "launch mode must allow multiple daily posts")
	}
	require.NoError(t, connection.Save(&models.PlatformSetting{ID: 1, UploadLimitsEnabled: true}).Error)
	_, err := service.CreatePost(1, draft())
	require.ErrorContains(t, err, "kuota posting harian")
	require.NoError(t, connection.Save(&models.PlatformSetting{ID: 1, UploadLimitsEnabled: false}).Error)
	_, err = service.CreatePost(1, draft())
	require.NoError(t, err)
}
