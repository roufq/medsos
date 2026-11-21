package services

import (
	"github.com/stretchr/testify/require"
	"goravel/app/dto"
	"goravel/app/models"
	"goravel/app/repositories"
	"goravel/pkg/hash"
	support "goravel/tests/support"
	"testing"
)

func TestRequiredAdministratorTwoFactorCannotBeBypassedWhenUnenrolled(t *testing.T) {
	connection := support.RevisionDB(t)
	user := support.User(t, connection, 1, false, "active")
	password, err := hash.HashPassword("test-password-123")
	require.NoError(t, err)
	require.NoError(t, connection.Model(&user).Updates(map[string]any{"password": password, "role": models.RoleAdmin}).Error)
	require.NoError(t, connection.Create(&models.PlatformSetting{ID: 1, RequireAdminTwoFactor: true}).Error)
	service := NewAuthService(repositories.NewUserRepository())
	result, err := service.Login(&dto.LoginRequest{Identifier: user.Email, Password: "test-password-123"})
	require.ErrorContains(t, err, "2FA enrollment required")
	require.Nil(t, result)
	var sessions int64
	require.NoError(t, connection.Model(&models.LoginSession{}).Count(&sessions).Error)
	require.Zero(t, sessions)
}
