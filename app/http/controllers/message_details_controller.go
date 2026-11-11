package controllers

import (
	"errors"
	"strings"
	"time"
	"unicode/utf8"

	http "github.com/goravel/framework/contracts/http"
	"goravel/app/models"
	"goravel/pkg/db"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

func chatPeer(ctx http.Context) (int64, int64, http.Response) {
	userID, err := authenticatedUserID(ctx)
	if err != nil {
		return 0, 0, ctx.Response().Json(401, http.Json{"error": "Unauthorized"})
	}
	peerID, err := routeID(ctx, "id")
	if err != nil || peerID <= 0 || peerID == userID {
		return 0, 0, ctx.Response().Json(400, http.Json{"error": "Pengguna tidak valid"})
	}
	if err := db.DB.First(&models.User{}, peerID).Error; err != nil {
		status := 500
		if errors.Is(err, gorm.ErrRecordNotFound) {
			status = 404
		}
		return 0, 0, ctx.Response().Json(status, http.Json{"error": "Gagal memuat pengguna"})
	}
	return userID, peerID, nil
}

func (c *MessageController) ConversationSettings(ctx http.Context) http.Response {
	userID, peerID, response := chatPeer(ctx)
	if response != nil {
		return response
	}
	var setting models.ConversationSetting
	if err := db.DB.Where("user_id = ? AND peer_id = ?", userID, peerID).Find(&setting).Error; err != nil {
		return ctx.Response().Json(500, http.Json{"error": "Gagal memuat pengaturan"})
	}
	var blocked int64
	if err := db.DB.Model(&models.UserBlock{}).Where("blocker_id = ? AND blocked_id = ?", userID, peerID).Count(&blocked).Error; err != nil {
		return ctx.Response().Json(500, http.Json{"error": "Gagal memuat status blokir"})
	}
	return ctx.Response().Json(200, http.Json{"muted": setting.Muted, "nickname": setting.Nickname, "blocked": blocked > 0, "blocked_between": blockedBetween(userID, peerID)})
}

func (c *MessageController) UpdateConversationSettings(ctx http.Context) http.Response {
	userID, peerID, response := chatPeer(ctx)
	if response != nil {
		return response
	}
	var input struct {
		Muted    *bool   `json:"muted"`
		Nickname *string `json:"nickname"`
	}
	if ctx.Request().Bind(&input) != nil || (input.Muted == nil && input.Nickname == nil) {
		return ctx.Response().Json(400, http.Json{"error": "Pengaturan tidak valid"})
	}
	columns := []string{}
	setting := models.ConversationSetting{UserID: userID, PeerID: peerID}
	if input.Muted != nil {
		setting.Muted = *input.Muted
		columns = append(columns, "muted")
	}
	if input.Nickname != nil {
		setting.Nickname = strings.TrimSpace(*input.Nickname)
		if utf8.RuneCountInString(setting.Nickname) > 80 {
			return ctx.Response().Json(400, http.Json{"error": "Nickname maksimal 80 karakter"})
		}
		columns = append(columns, "nickname")
	}
	if err := db.DB.Clauses(clause.OnConflict{Columns: []clause.Column{{Name: "user_id"}, {Name: "peer_id"}}, DoUpdates: clause.AssignmentColumns(columns)}).Create(&setting).Error; err != nil {
		return ctx.Response().Json(500, http.Json{"error": "Gagal menyimpan pengaturan"})
	}
	return c.ConversationSettings(ctx)
}

func (c *MessageController) DeleteConversationHistory(ctx http.Context) http.Response {
	userID, peerID, response := chatPeer(ctx)
	if response != nil {
		return response
	}
	err := c.msgRepo.DeleteHistory(userID, peerID)
	if err != nil {
		return ctx.Response().Json(500, http.Json{"error": "Gagal menghapus chat"})
	}
	return ctx.Response().Json(200, http.Json{"message": "Chat dihapus hanya untuk Anda"})
}

func (c *MessageController) ReportConversation(ctx http.Context) http.Response {
	userID, peerID, response := chatPeer(ctx)
	if response != nil {
		return response
	}
	var input struct {
		Reason  string `json:"reason"`
		Details string `json:"details"`
	}
	if ctx.Request().Bind(&input) != nil {
		return ctx.Response().Json(400, http.Json{"error": "Laporan tidak valid"})
	}
	input.Reason, input.Details = strings.TrimSpace(input.Reason), strings.TrimSpace(input.Details)
	if input.Reason == "" || utf8.RuneCountInString(input.Reason) > 100 || utf8.RuneCountInString(input.Details) > 2000 {
		return ctx.Response().Json(400, http.Json{"error": "Alasan wajib, maksimal 100 karakter; detail maksimal 2000 karakter"})
	}
	report := models.ConversationReport{ReporterID: userID, ReportedUserID: peerID, Reason: input.Reason, Details: input.Details, Status: "pending"}
	result := db.DB.Clauses(clause.OnConflict{DoNothing: true}).Create(&report)
	if result.Error != nil {
		return ctx.Response().Json(500, http.Json{"error": "Gagal mengirim laporan"})
	}
	if result.RowsAffected == 0 {
		return ctx.Response().Json(409, http.Json{"error": "Pengguna ini sudah Anda laporkan"})
	}
	return ctx.Response().Json(201, report)
}

func (c *MessageController) AdminConversationReports(ctx http.Context) http.Response {
	var reports []struct {
		models.ConversationReport
		AuthorName   string `json:"author_name"`
		ReporterName string `json:"reporter_name"`
	}
	err := db.DB.Table("conversation_reports AS reports").Select("reports.*, authors.name AS author_name, reporters.name AS reporter_name").Joins("LEFT JOIN users AS authors ON authors.id = reports.reported_user_id").Joins("LEFT JOIN users AS reporters ON reporters.id = reports.reporter_id").Order("reports.id DESC").Limit(200).Scan(&reports).Error
	if err != nil {
		return ctx.Response().Json(500, http.Json{"error": "Gagal memuat laporan chat"})
	}
	return ctx.Response().Json(200, reports)
}

func (c *MessageController) ReviewConversationReport(ctx http.Context) http.Response {
	adminID, _ := authenticatedUserID(ctx)
	id, err := routeID(ctx, "id")
	var input struct {
		Status string `json:"status"`
	}
	if err != nil || ctx.Request().Bind(&input) != nil || (input.Status != "resolved" && input.Status != "dismissed") {
		return ctx.Response().Json(400, http.Json{"error": "Status laporan tidak valid"})
	}
	result := db.DB.Model(&models.ConversationReport{}).Where("id = ? AND status = ?", id, "pending").Updates(map[string]any{"status": input.Status, "reviewed_by": adminID, "reviewed_at": time.Now()})
	if result.Error != nil {
		return ctx.Response().Json(500, http.Json{"error": "Gagal meninjau laporan"})
	}
	if result.RowsAffected == 0 {
		return ctx.Response().Json(404, http.Json{"error": "Laporan tidak ditemukan atau sudah ditinjau"})
	}
	return ctx.Response().Json(200, http.Json{"message": "Laporan ditinjau"})
}
