package services

import (
	"errors"
	"strings"
	"sync"
	"testing"

	"github.com/stretchr/testify/require"
	"goravel/app/models"
	"goravel/app/repositories"
	support "goravel/tests/support"
	"gorm.io/gorm"
)

func TestModerationPreservesDataAndAccessUntilRestore(t *testing.T) {
	connection := support.RevisionDB(t)
	admin := support.User(t, connection, 1, false, "active")
	require.NoError(t, connection.Model(&admin).Update("role", models.RoleAdmin).Error)
	support.User(t, connection, 2, false, "active")
	support.User(t, connection, 3, true, "active")
	repo := repositories.NewPostRepository()
	for _, kind := range []models.PostType{models.PostTypeText, models.PostTypeImage, models.PostTypeVideo, models.PostTypeLink, models.PostTypeShop} {
		post := models.Post{UserID: 2, PostType: kind, Visibility: "public"}
		require.NoError(t, connection.Create(&post).Error)
		moderate := func(actor int64, reason string, restore bool) error {
			return connection.Transaction(func(tx *gorm.DB) error { return ModeratePost(tx, actor, post.ID, reason, restore) })
		}
		require.ErrorIs(t, moderate(2, "Pelanggaran kebijakan", false), ErrForbidden)
		require.Error(t, moderate(1, "", false))
		require.NoError(t, moderate(1, "Konten melanggar kebijakan", false))
		_, err := repo.GetForViewer(2, post.ID)
		require.ErrorIs(t, err, gorm.ErrRecordNotFound, "even the owner cannot read removed content")
		feed, err := repo.ListAll(0, 50, 0, 0, false)
		require.NoError(t, err)
		for _, item := range feed {
			require.NotEqual(t, post.ID, item.ID)
		}
		require.Error(t, moderate(1, "Duplikat moderasi", false))
		require.ErrorIs(t, moderate(2, "Kembalikan postingan", true), ErrForbidden)
		require.NoError(t, moderate(1, "Selesai ditinjau ulang", true))
		loaded, err := repo.GetForViewer(0, post.ID)
		require.NoError(t, err)
		require.False(t, loaded.DeletedAt.Valid)
		require.Empty(t, loaded.RemovalReason)
		var audit int64
		require.NoError(t, connection.Model(&models.UserActivity{}).Where("target LIKE ?", "%"+*post.PublicHash).Count(&audit).Error)
		require.Equal(t, int64(2), audit)
		var notices []models.Notification
		require.NoError(t, connection.Where("entity_id = ?", post.ID).Order("id").Find(&notices).Error)
		require.Len(t, notices, 2)
		require.Equal(t, int64(2), notices[0].UserID)
		require.Contains(t, notices[0].Message, "Konten melanggar kebijakan")
		require.Equal(t, "post_restored", notices[1].Type)
	}
	private := models.Post{UserID: 3, PostType: models.PostTypeImage, Visibility: "followers"}
	require.NoError(t, connection.Create(&private).Error)
	for _, restore := range []bool{false, true} {
		require.NoError(t, connection.Transaction(func(tx *gorm.DB) error { return ModeratePost(tx, 1, private.ID, "Peninjauan konten privat", restore) }))
	}
	posts, err := repo.ListByUserID(0, 3)
	require.NoError(t, err)
	require.Empty(t, posts, "restoring must preserve the author's privacy")
}

func TestModerationIsAtomicAndRejectsConcurrentDuplicates(t *testing.T) {
	connection := support.RevisionDB(t)
	admin := support.User(t, connection, 1, false, "active")
	require.NoError(t, connection.Model(&admin).Update("role", models.RoleAdmin).Error)
	support.User(t, connection, 2, false, "active")
	post := models.Post{UserID: 2, PostType: models.PostTypeText, Visibility: "public"}
	require.NoError(t, connection.Create(&post).Error)
	require.Error(t, connection.Transaction(func(tx *gorm.DB) error {
		if err := ModeratePost(tx, 1, post.ID, "Peninjauan konten", false); err != nil {
			return err
		}
		return errors.New("rollback fixture")
	}))
	var count int64
	require.NoError(t, connection.Model(&models.Post{}).Where("id = ?", post.ID).Count(&count).Error)
	require.Equal(t, int64(1), count)
	require.NoError(t, connection.Model(&models.Notification{}).Count(&count).Error)
	require.Zero(t, count)
	var wg sync.WaitGroup
	results := make(chan error, 2)
	for i := 0; i < 2; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			results <- connection.Transaction(func(tx *gorm.DB) error { return ModeratePost(tx, 1, post.ID, strings.Repeat("a", 20), false) })
		}()
	}
	wg.Wait()
	close(results)
	success := 0
	for err := range results {
		if err == nil {
			success++
		}
	}
	require.Equal(t, 1, success)
	require.NoError(t, connection.Model(&models.Notification{}).Count(&count).Error)
	require.Equal(t, int64(1), count)
}
