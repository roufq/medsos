package repositories

import (
	"database/sql"
	"fmt"
	"os"
	"testing"
	"time"

	driver "github.com/go-sql-driver/mysql"
	"github.com/joho/godotenv"
	"github.com/stretchr/testify/require"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"goravel/app/models"
	"goravel/pkg/db"
)

func messageTestDB(t *testing.T) *gorm.DB {
	t.Helper()
	if os.Getenv("CHAT_TEST_MYSQL") != "1" {
		t.Skip("Set CHAT_TEST_MYSQL=1 to run MySQL integration tests (optional CHAT_TEST_MYSQL_DSN)")
	}
	config := &gorm.Config{Logger: logger.Default.LogMode(logger.Silent), DisableForeignKeyConstraintWhenMigrating: true}
	var testDB *gorm.DB
	var err error
	if os.Getenv("CHAT_TEST_MYSQL") == "1" {
		env, readErr := godotenv.Read("../../.env")
		require.NoError(t, readErr)
		connection := driver.NewConfig()
		connection.User, connection.Passwd = env["DB_USERNAME"], env["DB_PASSWORD"]
		connection.Net, connection.Addr, connection.ParseTime = "tcp", env["DB_HOST"]+":"+env["DB_PORT"], true
		if dsn := os.Getenv("CHAT_TEST_MYSQL_DSN"); dsn != "" {
			connection, err = driver.ParseDSN(dsn)
			require.NoError(t, err)
		}
		admin, openErr := sql.Open("mysql", connection.FormatDSN())
		require.NoError(t, openErr)
		name := fmt.Sprintf("medsos_chat_test_%d", time.Now().UnixNano())
		_, createErr := admin.Exec("CREATE DATABASE `" + name + "` CHARACTER SET utf8mb4")
		require.NoError(t, createErr)
		t.Cleanup(func() {
			_, dropErr := admin.Exec("DROP DATABASE `" + name + "`")
			require.NoError(t, dropErr)
			_ = admin.Close()
		})
		connection.DBName = name
		testDB, err = gorm.Open(mysql.Open(connection.FormatDSN()), config)
	}
	require.NoError(t, err)
	sqlDB, err := testDB.DB()
	require.NoError(t, err)
	sqlDB.SetMaxOpenConns(1)
	t.Cleanup(func() { _ = sqlDB.Close() })
	require.NoError(t, testDB.AutoMigrate(&models.User{}))
	require.NoError(t, testDB.Set("gorm:ignore_relationships", true).AutoMigrate(&models.ConversationSetting{}, &models.ConversationReport{}, &models.Conversation{}, &models.Message{}, &models.Notification{}))
	previous := db.DB
	db.DB = testDB
	t.Cleanup(func() { db.DB = previous })
	for _, id := range []int64{1, 2, 3} {
		require.NoError(t, testDB.Exec("INSERT INTO users (id, public_hash, name, email, password, account_status) VALUES (?, ?, ?, ?, ?, ?)", id, fmt.Sprintf("user%d", id), fmt.Sprintf("User %d", id), fmt.Sprintf("user%d@test.invalid", id), "unused", "active").Error)
	}
	return testDB
}

func TestDeleteChatHistoryIsPrivateAndNewMessagesDoNotRestoreOldHistory(t *testing.T) {
	testDB := messageTestDB(t)
	repo := NewMessageRepository()
	first, err := repo.SendMessage(1, 2, "old message")
	require.NoError(t, err)
	require.NoError(t, testDB.Create(&models.ConversationSetting{UserID: 2, PeerID: 1, Nickname: "Private nickname", Muted: true}).Error)
	require.NoError(t, repo.DeleteHistory(2, 1))
	convs, err := repo.GetConversations(2)
	require.NoError(t, err)
	require.Empty(t, convs)
	messages, err := repo.GetMessages(first.ConversationID, 2, 0)
	require.NoError(t, err)
	require.Empty(t, messages)
	messages, err = repo.GetMessages(first.ConversationID, 1, 0)
	require.NoError(t, err)
	require.Len(t, messages, 1)
	_, err = repo.GetMessages(first.ConversationID, 3, 0)
	require.ErrorIs(t, err, ErrConversationNotFound)
	require.ErrorIs(t, repo.MarkAsRead(first.ConversationID, 3), ErrConversationNotFound)
	second, err := repo.SendMessage(1, 2, "new message")
	require.NoError(t, err)
	convs, err = repo.GetConversations(2)
	require.NoError(t, err)
	require.Len(t, convs, 1)
	require.Equal(t, "Private nickname", convs[0].Nickname)
	require.True(t, convs[0].Muted)
	require.Equal(t, int64(1), convs[0].UnreadCount)
	require.Equal(t, second.ID, convs[0].Messages[0].ID)
	messages, err = repo.GetMessages(first.ConversationID, 2, second.ID)
	require.NoError(t, err)
	require.Empty(t, messages, "pagination must not reveal deleted history")
	convs, err = repo.GetConversations(1)
	require.NoError(t, err)
	require.Empty(t, convs[0].Nickname)
	require.False(t, convs[0].Muted)
	messages, err = repo.GetMessages(first.ConversationID, 1, 0)
	require.NoError(t, err)
	require.Len(t, messages, 2)
	require.NoError(t, repo.DeleteHistory(2, 1))
	require.NoError(t, repo.DeleteHistory(2, 1))
	convs, err = repo.GetConversations(2)
	require.NoError(t, err)
	require.Empty(t, convs)
}

func TestMutedChatSuppressesNotificationsAndReadingClearsUnread(t *testing.T) {
	testDB := messageTestDB(t)
	repo := NewMessageRepository()
	first, err := repo.SendMessage(1, 2, "first")
	require.NoError(t, err)
	var count int64
	require.NoError(t, testDB.Model(&models.Notification{}).Where("user_id = ? AND read_at IS NULL", 2).Count(&count).Error)
	require.Equal(t, int64(1), count)
	require.NoError(t, repo.MarkAsRead(first.ConversationID, 2))
	require.NoError(t, testDB.Model(&models.Notification{}).Where("user_id = ? AND read_at IS NULL", 2).Count(&count).Error)
	require.Zero(t, count)
	require.NoError(t, testDB.Create(&models.ConversationSetting{UserID: 2, PeerID: 1, Muted: true}).Error)
	_, err = repo.SendMessage(1, 2, "muted message")
	require.NoError(t, err)
	require.NoError(t, testDB.Model(&models.Notification{}).Count(&count).Error)
	require.Equal(t, int64(1), count)
	require.NoError(t, testDB.Model(&models.ConversationSetting{}).Where("user_id = ? AND peer_id = ?", 2, 1).Update("muted", false).Error)
	_, err = repo.SendMessage(1, 2, "unmuted message")
	require.NoError(t, err)
	require.NoError(t, testDB.Model(&models.Notification{}).Count(&count).Error)
	require.Equal(t, int64(2), count)
}
