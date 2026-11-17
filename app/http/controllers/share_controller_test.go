package controllers

import (
	"net/url"
	"reflect"
	"testing"

	http "github.com/goravel/framework/contracts/http"
	"github.com/goravel/framework/foundation"
	configmocks "github.com/goravel/framework/mocks/config"
	foundationmocks "github.com/goravel/framework/mocks/foundation"
	httpmocks "github.com/goravel/framework/mocks/http"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
	"goravel/app/models"
	support "goravel/tests/support"
)

func shareTestConfig(t *testing.T) {
	previous := foundation.App
	config := new(configmocks.Config)
	config.On("Env", "FRONTEND_URL", "").Return("https://postter.us")
	app := new(foundationmocks.Application)
	app.On("MakeConfig").Return(config)
	foundation.App = app
	t.Cleanup(func() { foundation.App = previous })
}

func shareRequest(actor int64, token, channel string, prepare bool) (*httpmocks.Context, *int, *http.Json) {
	c, request, response := new(httpmocks.Context), new(httpmocks.ContextRequest), new(httpmocks.ContextResponse)
	status, body := new(int), new(http.Json)
	c.On("Value", "userID").Return(actor)
	c.On("Request").Return(request)
	c.On("Response").Return(response)
	request.On("Route", "id").Return(token)
	request.On("Bind", mock.Anything).Run(func(args mock.Arguments) {
		input := reflect.ValueOf(args.Get(0)).Elem()
		input.FieldByName("Channel").SetString(channel)
		input.FieldByName("PrepareOnly").SetBool(prepare)
	}).Return(nil)
	response.On("Json", mock.Anything, mock.Anything).Run(func(args mock.Arguments) { *status = args.Int(0); *body = args.Get(1).(http.Json) }).Return(nil)
	return c, status, body
}

func TestSharePreparationHasNoCounterOrNotificationSideEffects(t *testing.T) {
	connection := support.RevisionDB(t)
	shareTestConfig(t)
	support.User(t, connection, 1, false, "active")
	support.User(t, connection, 2, false, "active")
	title := "Cerita & karya #desain"
	post := models.Post{UserID: 1, PostType: models.PostTypeImage, Visibility: "public", Title: &title}
	require.NoError(t, connection.Create(&post).Error)
	require.NoError(t, connection.Create(&models.PostMedia{PostID: post.ID, MediaType: models.MediaTypeImage, MediaURL: "/uploads/share image.png"}).Error)
	controller := NewSocialController()
	c, status, body := shareRequest(2, post.PublicToken(), "facebook", true)
	controller.Share(c)
	require.Equal(t, 200, *status)
	require.Equal(t, true, (*body)["prepared"])
	link := "https://postter.us/p/" + post.PublicToken()
	require.Equal(t, link, (*body)["share_url"])
	var count int64
	require.NoError(t, connection.Model(&models.PostShare{}).Count(&count).Error)
	require.Zero(t, count)
	require.NoError(t, connection.Model(&models.Notification{}).Count(&count).Error)
	require.Zero(t, count)

	links := shareLinks(post.ID, title)
	for _, channel := range []string{"facebook", "x", "threads", "linkedin", "telegram", "whatsapp", "pinterest"} {
		parsed, err := url.Parse(links[channel])
		require.NoError(t, err)
		require.Equal(t, "https", parsed.Scheme)
		query := parsed.Query()
		if channel == "threads" || channel == "whatsapp" {
			require.Contains(t, query.Get("text"), link)
		} else if channel == "facebook" {
			require.Equal(t, link, query.Get("u"))
		} else {
			require.Equal(t, link, query.Get("url"))
		}
	}
	pinterest, err := url.Parse(links["pinterest"])
	require.NoError(t, err)
	require.Equal(t, "https://postter.us/uploads/share%20image.png", pinterest.Query().Get("media"))
	require.Equal(t, title, pinterest.Query().Get("description"))

	c, status, body = shareRequest(2, post.PublicToken(), "facebook", false)
	controller.Share(c)
	require.Equal(t, 200, *status)
	require.Equal(t, int64(1), (*body)["shares_count"])
	require.NoError(t, connection.Model(&models.Notification{}).Count(&count).Error)
	require.Equal(t, int64(1), count)
}

func TestSharePreparationPreservesVisibilityAndChannelValidation(t *testing.T) {
	connection := support.RevisionDB(t)
	shareTestConfig(t)
	support.User(t, connection, 1, true, "active")
	support.User(t, connection, 2, false, "active")
	post := models.Post{UserID: 1, PostType: models.PostTypeText, Visibility: "followers"}
	require.NoError(t, connection.Create(&post).Error)
	for _, tc := range []struct {
		actor   int64
		channel string
		status  int
	}{{0, "facebook", 401}, {2, "facebook", 404}, {1, "unknown", 400}, {1, "message", 400}} {
		c, status, _ := shareRequest(tc.actor, post.PublicToken(), tc.channel, true)
		NewSocialController().Share(c)
		require.Equal(t, tc.status, *status)
	}
	links := shareLinks(post.ID, "Text post")
	pinterest, err := url.Parse(links["pinterest"])
	require.NoError(t, err)
	require.Equal(t, "https://postter.us/frontend/dist/images/postter-logo.png", pinterest.Query().Get("media"))
	var count int64
	require.NoError(t, connection.Model(&models.PostShare{}).Count(&count).Error)
	require.Zero(t, count)
}
