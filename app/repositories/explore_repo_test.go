package repositories

import (
	"github.com/stretchr/testify/require"
	"goravel/app/models"
	support "goravel/tests/support"
	"testing"
)

func TestExplorePrivacyTopicsSortingAndPaging(t *testing.T) {
	connection := support.RevisionDB(t)
	support.User(t, connection, 1, false, "active")
	support.User(t, connection, 2, true, "active")
	support.User(t, connection, 3, false, "deleted")
	support.User(t, connection, 4, false, "active")
	support.User(t, connection, 5, false, "active")
	posts := []models.Post{
		{ID: 1, UserID: 1, PostType: models.PostTypeImage, Visibility: "public"},
		{ID: 2, UserID: 2, PostType: models.PostTypeImage, Visibility: "public"},
		{ID: 3, UserID: 1, PostType: models.PostTypeImage, Visibility: "followers"},
		{ID: 4, UserID: 3, PostType: models.PostTypeImage, Visibility: "public"},
		{ID: 5, UserID: 4, PostType: models.PostTypeImage, Visibility: "public"},
		{ID: 6, UserID: 1, PostType: models.PostTypeImage, Visibility: "public", IsSponsored: true},
	}
	for _, post := range posts {
		require.NoError(t, connection.Create(&post).Error)
	}
	original := int64(1)
	require.NoError(t, connection.Create(&models.Post{ID: 7, UserID: 1, PostType: models.PostTypeText, Visibility: "public", RepostOfID: &original}).Error)
	require.NoError(t, connection.Create(&models.PostHashtag{PostID: 1, Tag: "foto"}).Error)
	require.NoError(t, connection.Create(&models.PostHashtag{PostID: 6, Tag: "desain"}).Error)
	require.NoError(t, connection.Create(&models.UserBlock{BlockerID: 5, BlockedID: 4}).Error)
	require.NoError(t, connection.Create(&models.Follow{FollowerID: 5, FollowedID: 2, Status: "accepted"}).Error)
	require.NoError(t, connection.Create(&models.PostLike{PostID: 1, UserID: 5}).Error)
	require.NoError(t, connection.Create(&models.SavedPost{PostID: 1, UserID: 5}).Error)
	ids := func(posts []models.Post) []int64 {
		result := []int64{}
		for _, p := range posts {
			result = append(result, p.ID)
		}
		return result
	}
	guest, err := ExplorePosts(0, 24, 0, "all", "latest", "")
	require.NoError(t, err)
	require.Equal(t, []int64{6, 5, 1}, ids(guest))
	viewer, err := ExplorePosts(5, 24, 0, "all", "latest", "")
	require.NoError(t, err)
	require.Equal(t, []int64{6, 1}, ids(viewer))
	require.True(t, viewer[1].IsSavedByMe)
	require.True(t, viewer[1].IsLikedByMe)
	require.Empty(t, viewer[1].User.Email)
	photos, err := ExplorePosts(5, 24, 0, "photography", "latest", "")
	require.NoError(t, err)
	require.Equal(t, []int64{1}, ids(photos))
	design, err := ExplorePosts(0, 24, 0, "design", "latest", "")
	require.NoError(t, err)
	require.Equal(t, []int64{6}, ids(design))
	require.True(t, design[0].IsSponsored)
	search, err := ExplorePosts(0, 24, 0, "all", "latest", "#foto")
	require.NoError(t, err)
	require.Equal(t, []int64{1}, ids(search))
	popular, err := ExplorePosts(0, 24, 0, "all", "popular", "")
	require.NoError(t, err)
	require.Equal(t, []int64{1, 6, 5}, ids(popular))
	page, err := ExplorePosts(0, 1, 1, "all", "latest", "")
	require.NoError(t, err)
	require.Equal(t, []int64{5}, ids(page))
}
