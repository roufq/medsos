package support

import (
	"database/sql"
	"fmt"
	driver "github.com/go-sql-driver/mysql"
	"github.com/stretchr/testify/require"
	"goravel/app/models"
	"goravel/pkg/db"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"os"
	"testing"
	"time"
)

// Always create a disposable database; never migrate the developer's database.
func RevisionDB(t *testing.T) *gorm.DB {
	t.Helper()
	dsn := os.Getenv("REVISION_TEST_MYSQL_DSN")
	if dsn == "" {
		t.Skip("Set REVISION_TEST_MYSQL_DSN to run isolated MySQL integration tests")
	}
	config, err := driver.ParseDSN(dsn)
	require.NoError(t, err)
	config.DBName = ""
	connection, err := sql.Open("mysql", config.FormatDSN())
	require.NoError(t, err)
	name := fmt.Sprintf("postter_revision_test_%d", time.Now().UnixNano())
	_, err = connection.Exec("CREATE DATABASE `" + name + "`")
	require.NoError(t, err)
	t.Cleanup(func() {
		_, err := connection.Exec("DROP DATABASE `" + name + "`")
		require.NoError(t, err)
		_ = connection.Close()
	})
	config.DBName = name
	config.ParseTime = true
	testDB, err := gorm.Open(mysql.Open(config.FormatDSN()), &gorm.Config{Logger: logger.Default.LogMode(logger.Silent)})
	require.NoError(t, err)
	sqlDB, err := testDB.DB()
	require.NoError(t, err)
	t.Cleanup(func() { _ = sqlDB.Close() })
	previous := db.DB
	db.DB = testDB
	t.Cleanup(func() { db.DB = previous })
	require.NoError(t, testDB.AutoMigrate(&models.User{}, &models.Post{}, &models.PostMedia{}, &models.PostLike{}, &models.PostComment{}, &models.PostHashtag{}, &models.PostMention{}, &models.PostLink{}, &models.ShopProduct{}, &models.MediaUpload{}, &models.Notification{}, &models.Follow{}, &models.UserBlock{}, &models.SavedPost{}, &models.PostView{}, &models.PostShare{}, &models.PlatformSetting{}, &models.UserActivity{}))
	return testDB
}

func User(t *testing.T, connection *gorm.DB, id int64, private bool, status string) models.User {
	t.Helper()
	username := fmt.Sprintf("demo%d", id)
	user := models.User{ID: id, Name: username, Username: &username, Email: username + "@example.test", Password: "unused-test-hash", AccountStatus: status, SubscriptionPlan: "free", Role: models.RoleUser, IsPrivate: private}
	require.NoError(t, connection.Create(&user).Error)
	return user
}
