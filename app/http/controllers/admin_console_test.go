package controllers

import (
	"github.com/stretchr/testify/require"
	"goravel/app/models"
	"testing"
	"time"
)

func TestConsoleUserValidation(t *testing.T) {
	input := consoleUserInput{Name: "Valid Name", Email: "valid@example.test", Role: models.RoleModerator}
	require.NoError(t, validateConsoleUser(input))
	input.Role = "root"
	require.Error(t, validateConsoleUser(input))
	input.Role = models.RoleUser
	input.AvatarURL = "javascript:alert(1)"
	require.Error(t, validateConsoleUser(input))
	input.AvatarURL = "/uploads/avatar.png"
	require.NoError(t, validateConsoleUser(input))
	input.Email = "x@example.test OR 1=1"
	require.Error(t, validateConsoleUser(input))
}
func TestAdValidationAndSchedule(t *testing.T) {
	now := time.Now()
	ad := models.AdCampaign{Title: "Example", TargetURL: "https://example.test", ImageURL: "/uploads/ad.png", Placement: "sidebar", Status: "active", StartsAt: now, EndsAt: now.Add(time.Hour)}
	require.True(t, validateAd(ad))
	ad.EndsAt = now.Add(-time.Hour)
	require.False(t, validateAd(ad))
	ad.EndsAt = now.Add(time.Hour)
	ad.TargetURL = "javascript:alert(1)"
	require.False(t, validateAd(ad))
	require.False(t, safeConsoleURL("https://user:password@example.test", false))
}
