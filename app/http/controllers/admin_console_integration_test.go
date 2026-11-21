package controllers

import (
	"encoding/json"
	"errors"
	httpmocks "github.com/goravel/framework/mocks/http"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
	"goravel/app/models"
	support "goravel/tests/support"
	"gorm.io/gorm"
	"testing"
)

func consoleRequest(actor int64, id string, input any) (*httpmocks.Context, *int) {
	c := new(httpmocks.Context)
	request := new(httpmocks.ContextRequest)
	response := new(httpmocks.ContextResponse)
	status := new(int)
	c.On("Request").Return(request)
	c.On("Response").Return(response)
	c.On("Value", "userID").Return(actor)
	c.On("Value", "userRole").Return(models.RoleAdmin)
	request.On("Route", "id").Return(id)
	request.On("Ip").Return("127.0.0.1")
	request.On("Bind", mock.Anything).Run(func(args mock.Arguments) {
		data, _ := json.Marshal(input)
		if err := json.Unmarshal(data, args.Get(0)); err != nil {
			panic(err)
		}
	}).Return(nil)
	response.On("Json", mock.Anything, mock.Anything).Run(func(args mock.Arguments) { *status = args.Int(0) }).Return(nil)
	return c, status
}
func TestConsoleRoleAndPermanentDeletion(t *testing.T) {
	connection := support.RevisionDB(t)
	admin := support.User(t, connection, 1, false, "active")
	target := support.User(t, connection, 2, false, "active")
	require.NoError(t, connection.Model(&admin).Update("role", models.RoleAdmin).Error)
	input := consoleUserInput{Name: admin.Name, Email: admin.Email, Role: models.RoleUser}
	c, status := consoleRequest(1, "1", input)
	AdminSaveUser(c)
	require.Equal(t, 400, *status)
	input = consoleUserInput{Name: target.Name, Email: target.Email, Role: models.RoleModerator}
	c, status = consoleRequest(1, "2", input)
	AdminSaveUser(c)
	require.Equal(t, 200, *status)
	require.NoError(t, connection.First(&target, 2).Error)
	require.Equal(t, models.RoleModerator, target.Role)
	require.Greater(t, target.TokenVersion, int64(0))
	post := models.Post{UserID: 2, PostType: models.PostTypeText, Visibility: "public"}
	require.NoError(t, connection.Create(&post).Error)
	payload := map[string]any{"reason": "Content violates platform policy", "confirm": "DELETE"}
	c, status = consoleRequest(1, *post.PublicHash, payload)
	AdminPurgePost(c)
	require.Equal(t, 409, *status)
	require.NoError(t, connection.Delete(&post).Error)
	c, status = consoleRequest(1, *post.PublicHash, map[string]any{"reason": "Remove policy violation permanently", "confirm": "wrong"})
	AdminPurgePost(c)
	require.Equal(t, 400, *status)
	c, status = consoleRequest(1, *post.PublicHash, payload)
	AdminPurgePost(c)
	require.Equal(t, 200, *status)
	var count int64
	connection.Unscoped().Model(&models.Post{}).Where("id = ?", post.ID).Count(&count)
	require.Zero(t, count)
	connection.Model(&models.UserActivity{}).Where("target LIKE ?", "%/purge").Count(&count)
	require.Equal(t, int64(1), count)
}

func TestNotificationOutboxFollowsTransaction(t *testing.T) {
	connection := support.RevisionDB(t)
	user := support.User(t, connection, 1, false, "active")
	rollback := errors.New("rollback")
	err := connection.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&models.Notification{UserID: user.ID, Type: "test", Message: "transaction test"}).Error; err != nil {
			return err
		}
		return rollback
	})
	require.ErrorIs(t, err, rollback)
	var count int64
	require.NoError(t, connection.Model(&models.NotificationDelivery{}).Count(&count).Error)
	require.Zero(t, count)
	require.NoError(t, connection.Create(&models.Notification{UserID: user.ID, Type: "test", Message: "committed test"}).Error)
	require.NoError(t, connection.Model(&models.NotificationDelivery{}).Count(&count).Error)
	require.Equal(t, int64(1), count)
}
