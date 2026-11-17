package controllers

import (
	"encoding/json"
	http "github.com/goravel/framework/contracts/http"
	httpmocks "github.com/goravel/framework/mocks/http"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
	"goravel/app/models"
	support "goravel/tests/support"
	"testing"
	"time"
)

func activityRequest(params map[string]string) (*httpmocks.Context, *int, *any) {
	c := new(httpmocks.Context)
	request := new(httpmocks.ContextRequest)
	response := new(httpmocks.ContextResponse)
	status := new(int)
	body := new(any)
	c.On("Request").Return(request)
	c.On("Response").Return(response)
	request.On("Query", mock.Anything, mock.Anything).Return(func(key string, defaults ...string) string {
		if value, ok := params[key]; ok {
			return value
		}
		if len(defaults) > 0 {
			return defaults[0]
		}
		return ""
	})
	response.On("Json", mock.Anything, mock.Anything).Run(func(args mock.Arguments) { *status = args.Int(0); *body = args.Get(1) }).Return(nil)
	return c, status, body
}

func TestAdminSessionsPaginationAndFilters(t *testing.T) {
	connection := support.RevisionDB(t)
	require.NoError(t, connection.AutoMigrate(&models.LoginSession{}))
	support.User(t, connection, 1, false, "active")
	support.User(t, connection, 2, false, "active")
	for i, id := range []string{"a", "b", "c"} {
		require.NoError(t, connection.Create(&models.LoginSession{ID: id, UserID: 1, LastActivity: time.Date(2026, 11, 17, 12, i, 0, 0, time.UTC), ExpiresAt: time.Date(2026, 11, 18, 0, 0, 0, 0, time.UTC)}).Error)
	}
	params := map[string]string{"limit": "2", "user_id": "1", "from": "2026-11-17", "to": "2026-11-17"}
	read := func() map[string]any {
		c, status, body := activityRequest(params)
		AdminSessions(c)
		require.Equal(t, 200, *status)
		raw, err := json.Marshal(*body)
		require.NoError(t, err)
		var decoded map[string]any
		require.NoError(t, json.Unmarshal(raw, &decoded))
		return decoded
	}
	page := read()
	require.Len(t, page["items"], 2)
	require.Equal(t, true, page["has_more"])
	params["offset"] = "2"
	page = read()
	require.Len(t, page["items"], 1)
	require.Equal(t, false, page["has_more"])
	params["user_id"] = "2"
	page = read()
	require.Empty(t, page["items"])
	require.Equal(t, []any{}, page["items"], "empty sessions must be JSON [] rather than null")
	c, status, _ := activityRequest(map[string]string{"offset": "-1"})
	AdminSessions(c)
	require.Equal(t, 400, *status)
}

func TestAdminActivityFilteringAndCursor(t *testing.T) {
	connection := support.RevisionDB(t)
	support.User(t, connection, 1, false, "active")
	support.User(t, connection, 2, false, "active")
	for i := 0; i < 5; i++ {
		require.NoError(t, connection.Create(&models.UserActivity{UserID: 1, Action: "POST", Target: "/api/v1/posts", CreatedAt: time.Date(2026, 11, 17, 12, i, 0, 0, time.UTC)}).Error)
	}
	require.NoError(t, connection.Create(&models.UserActivity{UserID: 2, Action: "DELETE", Target: "/api/v1/posts/a", CreatedAt: time.Date(2026, 11, 18, 0, 0, 0, 0, time.UTC)}).Error)
	params := map[string]string{"limit": "2", "from": "2026-11-17", "to": "2026-11-17", "user_id": "1", "action": "POST"}
	c, status, body := activityRequest(params)
	AdminActivity(c)
	require.Equal(t, 200, *status)
	page := (*body).(http.Json)
	items := page["items"].([]models.UserActivity)
	require.Len(t, items, 2)
	require.True(t, page["has_more"].(bool))
	require.Equal(t, uint64(5), items[0].ID)
	require.Equal(t, "Membuat postingan", items[0].Description)
	require.Empty(t, items[0].User.Email)
	params["before_id"] = "4"
	c, status, body = activityRequest(params)
	AdminActivity(c)
	require.Equal(t, 200, *status)
	items = (*body).(http.Json)["items"].([]models.UserActivity)
	require.Equal(t, uint64(3), items[0].ID)
	for key, value := range map[string]string{"from": "yesterday", "limit": "500", "user_id": "-1", "before_id": "-2", "action": "HACK"} {
		c, status, _ = activityRequest(map[string]string{key: value})
		AdminActivity(c)
		require.Equal(t, 400, *status)
	}
	c, status, _ = activityRequest(map[string]string{"from": "2026-11-18", "to": "2026-11-17"})
	AdminActivity(c)
	require.Equal(t, 400, *status)
	c, status, body = activityRequest(map[string]string{"user_id": "999"})
	AdminActivity(c)
	require.Equal(t, 200, *status)
	raw, err := json.Marshal(*body)
	require.NoError(t, err)
	require.Contains(t, string(raw), `"items":[]`)
}
