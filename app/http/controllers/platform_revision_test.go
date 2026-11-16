package controllers

import (
	httpmocks "github.com/goravel/framework/mocks/http"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
	"goravel/app/models"
	"goravel/app/repositories"
	"goravel/app/services"
	"goravel/pkg/platform"
	support "goravel/tests/support"
	"reflect"
	"strings"
	"testing"
	"time"
)

func revisionRequest(token, field string, value bool) (*httpmocks.Context, *int, *any) {
	request := new(httpmocks.ContextRequest)
	response := new(httpmocks.ContextResponse)
	context := new(httpmocks.Context)
	status := new(int)
	body := new(any)
	context.On("Request").Return(request)
	context.On("Response").Return(response)
	context.On("Value", "userID").Return(int64(99))
	request.On("Route", "id").Return(token)
	request.On("Bind", mock.Anything).Run(func(args mock.Arguments) {
		reflect.ValueOf(args.Get(0)).Elem().FieldByName(field).Set(reflect.ValueOf(&value))
	}).Return(nil)
	response.On("Json", mock.Anything, mock.Anything).Run(func(args mock.Arguments) { *status = args.Int(0); *body = args.Get(1) }).Return(nil)
	return context, status, body
}

func TestPublicControllersAndAdminControls(t *testing.T) {
	connection := support.RevisionDB(t)
	user := support.User(t, connection, 1, false, "active")
	private := support.User(t, connection, 2, true, "active")
	publicPost := models.Post{UserID: 1, PostType: models.PostTypeText, Visibility: "public"}
	hiddenPost := models.Post{UserID: 2, PostType: models.PostTypeText, Visibility: "public"}
	require.NoError(t, connection.Create(&publicPost).Error)
	require.NoError(t, connection.Create(&hiddenPost).Error)
	controller := &PostController{postService: services.NewPostService(repositories.NewPostRepository(), repositories.NewUserRepository())}
	for _, tc := range []struct {
		post   models.Post
		status int
	}{{publicPost, 200}, {hiddenPost, 404}} {
		context, status, _ := revisionRequest(*tc.post.PublicHash, "", false)
		controller.PublicPost(context)
		require.Equal(t, tc.status, *status)
	}
	context, status, body := revisionRequest(*private.Username, "", false)
	PublicProfile(context)
	require.Equal(t, 200, *status)
	require.True(t, (*body).(models.User).ProfileLocked)
	require.Empty(t, (*body).(models.User).Email)
	context, status, _ = revisionRequest("1", "Verified", true)
	AdminVerifyUser(context)
	require.Equal(t, 200, *status)
	require.NoError(t, connection.First(&user, 1).Error)
	require.True(t, user.AdminVerified)
	require.True(t, user.IsBlueVerified)
	context, status, _ = revisionRequest(*hiddenPost.PublicHash, "Sponsored", true)
	AdminSponsorPost(context)
	require.Equal(t, 400, *status, "a private author's content cannot become an ad")
	context, status, _ = revisionRequest(*publicPost.PublicHash, "Sponsored", true)
	AdminSponsorPost(context)
	require.Equal(t, 200, *status)
	require.NoError(t, connection.First(&publicPost, publicPost.ID).Error)
	require.True(t, publicPost.IsSponsored)
	require.NoError(t, connection.Model(&models.Post{}).Where("id = ?", publicPost.ID).Update("visibility", "followers").Error)
	context, status, _ = revisionRequest(*publicPost.PublicHash, "Sponsored", false)
	AdminSponsorPost(context)
	require.Equal(t, 200, *status, "withdrawal must work after a post becomes private")
	context, status, _ = revisionRequest("", "Enabled", true)
	UpdatePlatformSettings(context)
	require.Equal(t, 200, *status)
	setting, err := platform.Settings()
	require.NoError(t, err)
	require.True(t, setting.UploadLimitsEnabled)
	context, status, _ = revisionRequest("2", "", false)
	controller.AdminDeleteUser(context)
	require.Equal(t, 200, *status)
	require.NoError(t, connection.First(&private, 2).Error)
	require.Equal(t, "deleted", private.AccountStatus)
	require.Equal(t, int64(1), private.TokenVersion)
}

func TestPublicReadingPreservesPrivateProfilesAndPosts(t *testing.T) {
	connection := support.RevisionDB(t)
	support.User(t, connection, 1, false, "active")
	support.User(t, connection, 2, true, "active")
	support.User(t, connection, 3, false, "deleted")
	for _, post := range []models.Post{
		{ID: 1, UserID: 1, PostType: models.PostTypeText, Visibility: "public"},
		{ID: 2, UserID: 1, PostType: models.PostTypeText, Visibility: "followers"},
		{ID: 3, UserID: 2, PostType: models.PostTypeText, Visibility: "public"},
		{ID: 4, UserID: 3, PostType: models.PostTypeText, Visibility: "public"},
	} {
		require.NoError(t, connection.Create(&post).Error)
	}
	repo := repositories.NewPostRepository()
	posts, err := repo.ListAll(0, 50, 0, 0, false)
	require.NoError(t, err)
	require.Len(t, posts, 1)
	require.Equal(t, int64(1), posts[0].ID)
	require.Empty(t, posts[0].User.Email)
	for _, id := range []int64{2, 3, 4} {
		var post models.Post
		require.NoError(t, connection.First(&post, id).Error)
		require.False(t, canViewPost(0, &post), "anonymous viewer must not see post %d", id)
		loaded, err := repo.GetForViewer(0, id)
		require.NoError(t, err)
		require.False(t, canViewPost(0, loaded), "the public controller must reject loaded private post %d", id)
	}
	privatePosts, err := repo.ListByUserID(0, 2)
	require.NoError(t, err)
	require.Empty(t, privatePosts)
	for _, post := range []models.Post{
		{ID: 5, UserID: 1, PostType: models.PostTypeShop, Visibility: "public"},
		{ID: 6, UserID: 1, PostType: models.PostTypeShop, Visibility: "followers"},
		{ID: 7, UserID: 2, PostType: models.PostTypeShop, Visibility: "public"},
	} {
		require.NoError(t, connection.Create(&post).Error)
	}
	products, err := repo.ListAll(0, 20, 0, 0, false, "shop")
	require.NoError(t, err)
	require.Len(t, products, 1, "guest shop must only include public products from public accounts")
	require.Equal(t, int64(5), products[0].ID)
	require.NotNil(t, products[0].User.Username, "guest can navigate to the product author's profile")
	require.Empty(t, products[0].User.Email)
}

func TestDefaultFreeUploadAndPermanentAdminVerification(t *testing.T) {
	connection := support.RevisionDB(t)
	setting, err := platform.Settings()
	require.NoError(t, err)
	require.False(t, setting.UploadLimitsEnabled)
	require.NoError(t, connection.Save(&models.PlatformSetting{ID: 1, UploadLimitsEnabled: true}).Error)
	setting, err = platform.Settings()
	require.NoError(t, err)
	require.True(t, setting.UploadLimitsEnabled)
	user := support.User(t, connection, 1, false, "active")
	expired := time.Now().Add(-time.Hour)
	require.NoError(t, connection.Model(&user).Updates(map[string]any{"subscription_plan": "tier_3", "subscription_expires_at": expired, "admin_verified": true, "is_blue_verified": true}).Error)
	var loaded models.User
	require.NoError(t, connection.First(&loaded, 1).Error)
	require.True(t, loaded.IsBlueVerified)
	require.True(t, loaded.AdminVerified)
	require.Equal(t, "free", loaded.SubscriptionPlan)
}

func TestPublicMetadataEscapesUntrustedContent(t *testing.T) {
	source := `<html><head><title>Original</title></head><body><div id="root"></div></body></html>`
	result := publicDocumentHTML(source, `<script>alert(1)</script>$1`, `" onload="evil`, `https://postter.us/demo?x="`, `javascript:alert(1)`, true)
	require.NotContains(t, result, "<script>")
	require.NotContains(t, result, `content="" onload=`)
	require.NotContains(t, result, "javascript:")
	require.Contains(t, result, "$1")
	require.Contains(t, result, "&lt;script&gt;")
	require.Contains(t, result, "index,follow")
	private := publicDocumentHTML(source, "Private", "Do not index", "https://postter.us/private", "", false)
	require.Contains(t, private, "noindex,nofollow")
	require.False(t, strings.Contains(private, "<noscript>"))
}
