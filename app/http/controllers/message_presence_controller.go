package controllers

import (
	"time"

	http "github.com/goravel/framework/contracts/http"
	"goravel/app/models"
	"goravel/pkg/db"
)

const presenceTimeoutSeconds int64 = 20

// The caller holds callMu, which also protects userLastSeen.
func userOnlineLocked(userID, now int64) bool {
	lastSeen, exists := userLastSeen[userID]
	return userID > 0 && exists && lastSeen > 0 && now >= lastSeen && now-lastSeen <= presenceTimeoutSeconds
}

func peerPresence(viewerID int64, peerIDs []int64) (map[int64]bool, error) {
	online := make(map[int64]bool)
	candidates := make([]int64, 0, len(peerIDs))
	now := time.Now().Unix()
	callMu.Lock()
	for _, id := range peerIDs {
		if userOnlineLocked(id, now) {
			candidates = append(candidates, id)
		}
	}
	callMu.Unlock()
	if len(candidates) == 0 {
		return online, nil
	}

	var visibleIDs []int64
	err := db.DB.Model(&models.User{}).
		Where("users.id IN ? AND users.account_status = ?", candidates, "active").
		Where(`NOT EXISTS (SELECT 1 FROM user_blocks WHERE
			(blocker_id = ? AND blocked_id = users.id) OR
			(blocked_id = ? AND blocker_id = users.id))`, viewerID, viewerID).
		Pluck("users.id", &visibleIDs).Error
	if err != nil {
		return nil, err
	}
	for _, id := range visibleIDs {
		online[id] = true
	}
	return online, nil
}

// GetPresence supports chats that have not yet received their first message.
func (c *MessageController) GetPresence(ctx http.Context) http.Response {
	viewerID, peerID, response := chatPeer(ctx)
	if response != nil {
		return response
	}
	online, err := peerPresence(viewerID, []int64{peerID})
	if err != nil {
		return ctx.Response().Json(500, http.Json{"error": "Gagal memuat status pengguna"})
	}
	return ctx.Response().Json(200, http.Json{"online": online[peerID]})
}
