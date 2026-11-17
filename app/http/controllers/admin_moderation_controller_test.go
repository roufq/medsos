package controllers

import (
	httpmocks "github.com/goravel/framework/mocks/http"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
	"goravel/app/models"
	support "goravel/tests/support"
	"reflect"
	"testing"
)

func moderationRequest(actor int64, token, reason string) (*httpmocks.Context, *int) {
	c := new(httpmocks.Context)
	request := new(httpmocks.ContextRequest)
	response := new(httpmocks.ContextResponse)
	status := new(int)
	c.On("Request").Return(request)
	c.On("Response").Return(response)
	c.On("Value", "userID").Return(actor)
	request.On("Route", "id").Return(token)
	request.On("Bind", mock.Anything).Run(func(args mock.Arguments) { reflect.ValueOf(args.Get(0)).Elem().FieldByName("Reason").SetString(reason) }).Return(nil)
	response.On("Json", mock.Anything, mock.Anything).Run(func(args mock.Arguments) { *status = args.Int(0) }).Return(nil)
	return c, status
}

func TestModerationControllersEnforceRoleAndRestore(t *testing.T) {
	connection := support.RevisionDB(t)
	admin := support.User(t, connection, 1, false, "active")
	support.User(t, connection, 2, false, "active")
	require.NoError(t, connection.Model(&admin).Update("role", models.RoleAdmin).Error)
	post := models.Post{UserID: 2, Visibility: "public", PostType: models.PostTypeText}
	require.NoError(t, connection.Create(&post).Error)
	controller := &PostController{}
	c, status := moderationRequest(2, *post.PublicHash, "Pelanggaran kebijakan")
	controller.AdminDeletePost(c)
	require.Equal(t, 403, *status)
	c, status = moderationRequest(1, *post.PublicHash, "")
	controller.AdminDeletePost(c)
	require.Equal(t, 400, *status)
	c, status = moderationRequest(1, *post.PublicHash, "Pelanggaran kebijakan")
	controller.AdminDeletePost(c)
	require.Equal(t, 200, *status)
	var removed models.Post
	require.NoError(t, connection.Unscoped().First(&removed, post.ID).Error)
	require.False(t, canViewPost(2, &removed))
	c, status = moderationRequest(2, *post.PublicHash, "Tinjau kembali")
	AdminRestorePost(c)
	require.Equal(t, 403, *status)
	c, status = moderationRequest(1, *post.PublicHash, "Tinjau kembali")
	AdminRestorePost(c)
	require.Equal(t, 200, *status)
}
