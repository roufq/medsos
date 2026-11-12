package controllers

import (
	"database/sql"
	"fmt"
	"os"
	"testing"
	"time"

	driver "github.com/go-sql-driver/mysql"
	"github.com/stretchr/testify/require"
	"goravel/app/models"
	"goravel/pkg/db"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func replacePresence(t *testing.T, values map[int64]int64) {
	t.Helper()
	callMu.Lock()
	previous := userLastSeen
	userLastSeen = values
	callMu.Unlock()
	t.Cleanup(func() { callMu.Lock(); userLastSeen = previous; callMu.Unlock() })
}

func TestUserOnlineWindow(t *testing.T) {
	replacePresence(t, map[int64]int64{1: 1000, 2: 980, 3: 979, 4: 1001, 5: 0, 0: 1000})
	for _, tc := range []struct {
		id     int64
		online bool
	}{{1, true}, {2, true}, {3, false}, {4, false}, {5, false}, {6, false}, {0, false}} {
		callMu.Lock()
		online := userOnlineLocked(tc.id, 1000)
		callMu.Unlock()
		require.Equal(t, tc.online, online, "user %d", tc.id)
	}
	callMu.Lock()
	expired := !userOnlineLocked(1, 1021)
	callMu.Unlock()
	require.True(t, expired, "closing the client expires presence after 20 seconds")
}

func TestOfflinePresenceDoesNotRequireDatabase(t *testing.T) {
	replacePresence(t, map[int64]int64{})
	online, err := peerPresence(1, []int64{2, 3})
	require.NoError(t, err)
	require.Empty(t, online)
	touchUserPresence(0)
	callMu.Lock()
	_, exists := userLastSeen[0]
	callMu.Unlock()
	require.False(t, exists)
}

func TestPeerPresenceHidesBlockedAndInactiveUsers(t *testing.T) {
	dsn := os.Getenv("CHAT_TEST_MYSQL_DSN")
	if dsn == "" {
		t.Skip("Set CHAT_TEST_MYSQL_DSN for isolated MySQL presence integration test")
	}
	connection, err := driver.ParseDSN(dsn)
	require.NoError(t, err)
	connection.DBName = ""
	admin, err := sql.Open("mysql", connection.FormatDSN())
	require.NoError(t, err)
	name := fmt.Sprintf("postter_presence_test_%d", time.Now().UnixNano())
	_, err = admin.Exec("CREATE DATABASE `" + name + "`")
	require.NoError(t, err)
	t.Cleanup(func() {
		_, err := admin.Exec("DROP DATABASE `" + name + "`")
		require.NoError(t, err)
		_ = admin.Close()
	})
	connection.DBName = name
	testDB, err := gorm.Open(mysql.Open(connection.FormatDSN()), &gorm.Config{Logger: logger.Default.LogMode(logger.Silent)})
	require.NoError(t, err)
	sqlDB, err := testDB.DB()
	require.NoError(t, err)
	t.Cleanup(func() { _ = sqlDB.Close() })
	require.NoError(t, testDB.Exec("CREATE TABLE users (id BIGINT PRIMARY KEY, account_status VARCHAR(24))").Error)
	require.NoError(t, testDB.Exec("INSERT INTO users VALUES (1, 'active'), (2, 'active'), (3, 'active'), (4, 'active'), (5, 'blocked')").Error)
	require.NoError(t, testDB.AutoMigrate(&models.UserBlock{}))
	require.NoError(t, testDB.Create(&models.UserBlock{BlockerID: 1, BlockedID: 3}).Error)
	require.NoError(t, testDB.Create(&models.UserBlock{BlockerID: 4, BlockedID: 1}).Error)
	previous := db.DB
	db.DB = testDB
	t.Cleanup(func() { db.DB = previous })
	now := time.Now().Unix()
	replacePresence(t, map[int64]int64{2: now, 3: now, 4: now, 5: now, 6: now - 21})
	online, err := peerPresence(1, []int64{2, 3, 4, 5, 6})
	require.NoError(t, err)
	require.Equal(t, map[int64]bool{2: true}, online)
	online, err = peerPresence(2, []int64{3, 4})
	require.NoError(t, err)
	require.Equal(t, map[int64]bool{3: true, 4: true}, online, "blocks are scoped to the viewer")
	require.NoError(t, testDB.Migrator().DropTable(&models.UserBlock{}))
	_, err = peerPresence(1, []int64{2})
	require.Error(t, err, "database errors must not expose unfiltered presence")
}
