package controllers

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"time"

	goravelhttp "github.com/goravel/framework/contracts/http"
	"goravel/app/facades"
	"goravel/app/models"
	"goravel/app/repositories"
	"goravel/pkg/db"
)

type MessageController struct {
	msgRepo repositories.MessageRepository
}

func NewMessageController(msgRepo repositories.MessageRepository) *MessageController {
	return &MessageController{
		msgRepo: msgRepo,
	}
}

var allowedMessageExtensions = map[string]struct {
	kind string
	mime string
}{
	// Images
	".jpg":  {"image", "image/jpeg"},
	".jpeg": {"image", "image/jpeg"},
	".jfif": {"image", "image/jpeg"},
	".png":  {"image", "image/png"},
	".gif":  {"image", "image/gif"},
	".webp": {"image", "image/webp"},
	".bmp":  {"image", "image/bmp"},
	".avif": {"image", "image/avif"},
	".heic": {"image", "image/heic"},
	".heif": {"image", "image/heif"},
	// Videos
	".mp4":  {"video", "video/mp4"},
	".mov":  {"video", "video/quicktime"},
	".webm": {"video", "video/webm"},
	".mkv":  {"video", "video/x-matroska"},
	".avi":  {"video", "video/x-msvideo"},
	".wmv":  {"video", "video/x-ms-wmv"},
	".flv":  {"video", "video/x-flv"},
	".mpeg": {"video", "video/mpeg"},
	".mpg":  {"video", "video/mpeg"},
	".m4v":  {"video", "video/x-m4v"},
	// Audio
	".mp3":  {"audio", "audio/mpeg"},
	".wav":  {"audio", "audio/wav"},
	".ogg":  {"audio", "audio/ogg"},
	".m4a":  {"audio", "audio/mp4"},
	".aac":  {"audio", "audio/aac"},
	".flac": {"audio", "audio/flac"},
	// Documents, spreadsheets, presentations, text & archives
	".pdf":  {"file", "application/pdf"},
	".doc":  {"file", "application/msword"},
	".docx": {"file", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"},
	".xls":  {"file", "application/vnd.ms-excel"},
	".xlsx": {"file", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"},
	".ppt":  {"file", "application/vnd.ms-powerpoint"},
	".pptx": {"file", "application/vnd.openxmlformats-officedocument.presentationml.presentation"},
	".txt":  {"file", "text/plain"},
	".csv":  {"file", "text/csv"},
	".json": {"file", "application/json"},
	".rtf":  {"file", "application/rtf"},
	".odt":  {"file", "application/vnd.oasis.opendocument.text"},
	".ods":  {"file", "application/vnd.oasis.opendocument.spreadsheet"},
	".odp":  {"file", "application/vnd.oasis.opendocument.presentation"},
	".zip":  {"file", "application/zip"},
	".rar":  {"file", "application/vnd.rar"},
	".7z":   {"file", "application/x-7z-compressed"},
	".tar":  {"file", "application/x-tar"},
	".gz":   {"file", "application/gzip"},
}

var validMessageTypes = map[string]bool{
	"text":     true,
	"image":    true,
	"video":    true,
	"audio":    true,
	"file":     true,
	"location": true,
	"shop":     true,
	"link":     true,
	"call":     true,
}

func (c *MessageController) GetConversations(ctx goravelhttp.Context) goravelhttp.Response {
	userID, authErr := authenticatedUserID(ctx)
	if authErr != nil {
		return ctx.Response().Json(401, goravelhttp.Json{"error": "Unauthorized"})
	}
	touchUserPresence(userID)

	convs, err := c.msgRepo.GetConversations(userID)
	if err != nil {
		return ctx.Response().Json(500, goravelhttp.Json{"error": "Failed to get conversations"})
	}
	peerIDs := make([]int64, len(convs))
	for i := range convs {
		peerIDs[i] = convs[i].User1ID
		if peerIDs[i] == userID {
			peerIDs[i] = convs[i].User2ID
		}
	}
	online, err := peerPresence(userID, peerIDs)
	if err != nil {
		return ctx.Response().Json(500, goravelhttp.Json{"error": "Failed to get user presence"})
	}
	for i := range convs {
		convs[i].PeerOnline = online[peerIDs[i]]
	}

	return ctx.Response().Json(200, convs)
}

func (c *MessageController) GetMessages(ctx goravelhttp.Context) goravelhttp.Response {
	userID, authErr := authenticatedUserID(ctx)
	if authErr != nil {
		return ctx.Response().Json(401, goravelhttp.Json{"error": "Unauthorized"})
	}
	touchUserPresence(userID)

	convIDStr := strings.TrimSpace(ctx.Request().Query("conversation_id", ""))
	convID, _ := strconv.ParseInt(convIDStr, 10, 64)
	if convID == 0 && convIDStr != "" {
		var conv models.Conversation
		if db.DB.Select("id").Where("public_hash = ?", convIDStr).First(&conv).Error == nil {
			convID = conv.ID
		}
	}
	beforeID, beforeErr := strconv.ParseInt(ctx.Request().Query("before_id", "0"), 10, 64)

	if convID == 0 || beforeErr != nil || beforeID < 0 {
		return ctx.Response().Json(400, goravelhttp.Json{"error": "conversation_id and before_id must be valid"})
	}

	msgs, err := c.msgRepo.GetMessages(convID, userID, beforeID)
	if err != nil {
		if errors.Is(err, repositories.ErrConversationNotFound) {
			return ctx.Response().Json(404, goravelhttp.Json{"error": "Conversation not found"})
		}
		return ctx.Response().Json(500, goravelhttp.Json{"error": "Failed to get messages"})
	}

	// Mark as read
	_ = c.msgRepo.MarkAsRead(convID, userID)

	return ctx.Response().Json(200, msgs)
}

// UploadAttachment handles uploading images, videos, audio, documents, and archives for direct messages.
func (c *MessageController) UploadAttachment(ctx goravelhttp.Context) goravelhttp.Response {
	if _, authErr := authenticatedUserID(ctx); authErr != nil {
		return ctx.Response().Json(401, goravelhttp.Json{"error": "Unauthorized"})
	}

	file, err := ctx.Request().File("file")
	if err != nil || file == nil {
		return ctx.Response().Json(400, goravelhttp.Json{"error": "File wajib dipilih"})
	}

	origName := filepath.Base(strings.TrimSpace(file.GetClientOriginalName()))
	if origName == "" || origName == "." {
		origName = "attachment"
	}
	if len(origName) > 200 {
		origName = origName[len(origName)-200:]
	}

	ext := strings.ToLower(filepath.Ext(origName))
	blockedExts := map[string]bool{
		".exe": true, ".bat": true, ".cmd": true, ".com": true, ".scr": true,
		".pif": true, ".msi": true, ".vbs": true, ".ps1": true, ".sh": true,
		".php": true, ".html": true, ".htm": true, ".svg": true,
	}
	if blockedExts[ext] {
		return ctx.Response().Json(400, goravelhttp.Json{
			"error": "Format file eksekusi/HTML tidak diizinkan demi keamanan.",
		})
	}
	spec, allowed := allowedMessageExtensions[ext]
	if !allowed {
		if ext == "" {
			ext = ".bin"
		}
		spec = struct {
			kind string
			mime string
		}{kind: "file", mime: "application/octet-stream"}
	}

	src, err := os.Open(file.File())
	if err != nil {
		return ctx.Response().Json(400, goravelhttp.Json{"error": "Gagal membaca file"})
	}
	defer src.Close()

	stat, err := src.Stat()
	if err != nil || !stat.Mode().IsRegular() || stat.Size() <= 0 {
		return ctx.Response().Json(400, goravelhttp.Json{"error": "File tidak valid atau kosong"})
	}
	const maxAttachmentBytes = 100 * 1024 * 1024 // 100 MB
	if stat.Size() > maxAttachmentBytes {
		return ctx.Response().Json(400, goravelhttp.Json{"error": "Ukuran file maksimal 100 MB"})
	}

	header := make([]byte, 512)
	n, _ := io.ReadFull(src, header)
	sniffed := http.DetectContentType(header[:n])
	if strings.Contains(sniffed, "text/html") || strings.Contains(sniffed, "application/x-msdownload") {
		return ctx.Response().Json(400, goravelhttp.Json{"error": "Tipe konten file tidak diizinkan"})
	}
	if _, err := src.Seek(0, io.SeekStart); err != nil {
		return ctx.Response().Json(500, goravelhttp.Json{"error": "Gagal memproses file"})
	}

	uploadDir := filepath.Join(".", "uploads")
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		return ctx.Response().Json(500, goravelhttp.Json{"error": "Gagal menyiapkan direktori upload"})
	}

	var rnd [16]byte
	if _, err := rand.Read(rnd[:]); err != nil {
		return ctx.Response().Json(500, goravelhttp.Json{"error": "Gagal membuat nama file"})
	}
	storedName := "msg_" + hex.EncodeToString(rnd[:]) + ext
	dstPath := filepath.Join(uploadDir, storedName)

	dst, err := os.OpenFile(dstPath, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, 0644)
	if err != nil {
		return ctx.Response().Json(500, goravelhttp.Json{"error": "Gagal menyimpan file"})
	}
	written, copyErr := io.Copy(dst, src)
	closeErr := dst.Close()
	if copyErr != nil || closeErr != nil {
		_ = os.Remove(dstPath)
		return ctx.Response().Json(500, goravelhttp.Json{"error": "Gagal menulis file"})
	}

	return ctx.Response().Json(200, goravelhttp.Json{
		"url":          "/uploads/" + storedName,
		"file_name":    origName,
		"file_size":    written,
		"mime_type":    spec.mime,
		"message_type": spec.kind,
	})
}

func (c *MessageController) SendMessage(ctx goravelhttp.Context) goravelhttp.Response {
	senderID, authErr := authenticatedUserID(ctx)
	if authErr != nil {
		return ctx.Response().Json(401, goravelhttp.Json{"error": "Unauthorized"})
	}

	var body struct {
		ReceiverID     any    `json:"receiver_id"`
		Content        string `json:"content"`
		MessageType    string `json:"message_type"`
		AttachmentURL  string `json:"attachment_url"`
		AttachmentName string `json:"attachment_name"`
		AttachmentSize int64  `json:"attachment_size"`
		AttachmentMime string `json:"attachment_mime"`
		MetadataJSON   string `json:"metadata_json"`
	}
	_ = ctx.Request().Bind(&body)
	var receiverID int64
	switch v := body.ReceiverID.(type) {
	case float64:
		receiverID = int64(v)
	case int64:
		receiverID = v
	case string:
		if parsed, err := strconv.ParseInt(strings.TrimSpace(v), 10, 64); err == nil {
			receiverID = parsed
		} else if trimmed := strings.TrimSpace(v); trimmed != "" {
			var u models.User
			if db.DB.Select("id").Where("public_hash = ? OR LOWER(username) = LOWER(?)", trimmed, strings.TrimPrefix(trimmed, "@")).First(&u).Error == nil {
				receiverID = u.ID
			}
		}
	}
	if receiverID == 0 {
		rawReceiver := strings.TrimSpace(ctx.Request().Input("receiver_id"))
		if parsed, err := strconv.ParseInt(rawReceiver, 10, 64); err == nil {
			receiverID = parsed
		} else if rawReceiver != "" {
			var u models.User
			if db.DB.Select("id").Where("public_hash = ? OR LOWER(username) = LOWER(?)", rawReceiver, strings.TrimPrefix(rawReceiver, "@")).First(&u).Error == nil {
				receiverID = u.ID
			}
		}
	}
	if body.Content == "" {
		body.Content = ctx.Request().Input("content")
	}
	if body.MessageType == "" {
		body.MessageType = ctx.Request().Input("message_type")
	}
	if body.AttachmentURL == "" {
		body.AttachmentURL = ctx.Request().Input("attachment_url")
	}
	if body.AttachmentName == "" {
		body.AttachmentName = ctx.Request().Input("attachment_name")
	}
	if body.AttachmentMime == "" {
		body.AttachmentMime = ctx.Request().Input("attachment_mime")
	}
	if body.MetadataJSON == "" {
		body.MetadataJSON = ctx.Request().Input("metadata_json")
	}

	content := strings.TrimSpace(body.Content)
	msgType := strings.ToLower(strings.TrimSpace(body.MessageType))
	if msgType == "" {
		msgType = "text"
	}
	if !validMessageTypes[msgType] {
		return ctx.Response().Json(400, goravelhttp.Json{"error": "Invalid message_type"})
	}

	attachmentURL := strings.TrimSpace(body.AttachmentURL)
	attachmentName := strings.TrimSpace(body.AttachmentName)
	attachmentMime := strings.TrimSpace(body.AttachmentMime)
	metadataJSON := strings.TrimSpace(body.MetadataJSON)

	if receiverID <= 0 || receiverID == senderID {
		return ctx.Response().Json(400, goravelhttp.Json{"error": "Invalid receiver_id"})
	}

	// Provide sensible fallback content for non-text messages so conversation previews stay informative
	if content == "" {
		switch msgType {
		case "location":
			content = "📍 Lokasi Saya"
		case "shop":
			content = "🛍️ Menanyakan produk"
		case "image":
			content = "📷 Mengirim gambar"
		case "video":
			content = "🎬 Mengirim video"
		case "audio":
			content = "🎵 Mengirim audio"
		case "file":
			if attachmentName != "" {
				content = "📎 " + attachmentName
			} else {
				content = "📎 Mengirim dokumen"
			}
		case "link":
			content = "🔗 Mengirim tautan"
		case "call":
			content = "📞 Panggilan Suara"
		}
	}

	if content == "" || len(content) > 5000 {
		return ctx.Response().Json(400, goravelhttp.Json{"error": "Message content must be between 1 and 5000 bytes"})
	}
	if len(metadataJSON) > 8000 || len(attachmentURL) > 500 || len(attachmentName) > 255 {
		return ctx.Response().Json(400, goravelhttp.Json{"error": "Attachment metadata is too long"})
	}
	if attachmentURL != "" && !strings.HasPrefix(attachmentURL, "/uploads/") && !strings.HasPrefix(attachmentURL, "http://") && !strings.HasPrefix(attachmentURL, "https://") {
		return ctx.Response().Json(400, goravelhttp.Json{"error": "Invalid attachment_url"})
	}

	var receiver models.User
	if db.DB.First(&receiver, receiverID).Error != nil || receiver.AccountStatus != "active" {
		return ctx.Response().Json(404, goravelhttp.Json{"error": "User not found"})
	}
	if blockedBetween(senderID, receiverID) {
		return ctx.Response().Json(403, goravelhttp.Json{"error": "Messaging is not allowed"})
	}

	msg, err := c.msgRepo.SendRichMessage(receiverID, models.Message{
		SenderID:       senderID,
		Content:        content,
		MessageType:    msgType,
		AttachmentURL:  attachmentURL,
		AttachmentName: attachmentName,
		AttachmentSize: body.AttachmentSize,
		AttachmentMime: attachmentMime,
		MetadataJSON:   metadataJSON,
	})
	if err != nil {
		return ctx.Response().Json(500, goravelhttp.Json{"error": "Failed to send message"})
	}

	return ctx.Response().Json(200, msg)
}

type messageIntentPayload struct {
	Nonce       string `json:"n"`
	SenderID    int64  `json:"s"`
	TargetID    int64  `json:"u,omitempty"`
	ShopPostID  int64  `json:"p,omitempty"`
	ExpiresUnix int64  `json:"e"`
}

var (
	intentNonceMu sync.Mutex
	intentNonces  = make(map[string]int64)
)

func messageIntentKey() [32]byte {
	secret := fmt.Sprint(facades.Config().Env("JWT_SECRET", "medsos-default-intent-secret"))
	return sha256.Sum256([]byte("medsos-message-intent-v1:" + secret))
}

func resolveUserToken(raw string) int64 {
	trimmed := strings.TrimSpace(raw)
	if trimmed == "" {
		return 0
	}
	var u models.User
	if db.DB.Select("id").Where("public_hash = ? OR LOWER(username) = LOWER(?)", trimmed, strings.TrimPrefix(trimmed, "@")).First(&u).Error == nil {
		return u.ID
	}
	if parsed, err := strconv.ParseInt(trimmed, 10, 64); err == nil && parsed > 0 {
		if db.DB.Select("id").First(&u, parsed).Error == nil {
			return u.ID
		}
	}
	return 0
}

func resolvePostToken(raw string) int64 {
	trimmed := strings.TrimSpace(raw)
	if trimmed == "" {
		return 0
	}
	var p models.Post
	if db.DB.Select("id").Where("public_hash = ?", trimmed).First(&p).Error == nil {
		return p.ID
	}
	if parsed, err := strconv.ParseInt(trimmed, 10, 64); err == nil && parsed > 0 {
		if db.DB.Select("id").First(&p, parsed).Error == nil {
			return p.ID
		}
	}
	return 0
}

// CreateIntent issues a short-lived, single-use AES-GCM encrypted token bound to the authenticated sender.
func (c *MessageController) CreateIntent(ctx goravelhttp.Context) goravelhttp.Response {
	senderID, authErr := authenticatedUserID(ctx)
	if authErr != nil {
		return ctx.Response().Json(401, goravelhttp.Json{"error": "Unauthorized"})
	}

	var body struct {
		UserID     any    `json:"user_id"`
		ShopPostID string `json:"shop_post_id"`
	}
	_ = ctx.Request().Bind(&body)
	rawUser := strings.TrimSpace(fmt.Sprint(body.UserID))
	if body.UserID == nil || rawUser == "<nil>" {
		rawUser = strings.TrimSpace(ctx.Request().Input("user_id"))
	}
	rawPost := strings.TrimSpace(body.ShopPostID)
	if rawPost == "" {
		rawPost = strings.TrimSpace(ctx.Request().Input("shop_post_id"))
	}

	targetID := resolveUserToken(rawUser)
	postID := resolvePostToken(rawPost)

	if postID > 0 {
		var post models.Post
		if db.DB.First(&post, postID).Error != nil || !canViewPost(senderID, &post) {
			postID = 0
		} else if targetID == 0 && post.UserID != senderID {
			targetID = post.UserID
		}
	}

	if targetID == senderID {
		targetID = 0
	}
	if targetID > 0 {
		var target models.User
		if db.DB.First(&target, targetID).Error != nil || target.AccountStatus != "active" {
			return ctx.Response().Json(404, goravelhttp.Json{"error": "Pengguna tujuan tidak ditemukan"})
		}
		if blockedBetween(senderID, targetID) {
			return ctx.Response().Json(403, goravelhttp.Json{"error": "Tidak dapat mengirim pesan ke pengguna ini"})
		}
	}
	if targetID == 0 && postID == 0 {
		return ctx.Response().Json(400, goravelhttp.Json{"error": "Target percakapan tidak valid"})
	}

	var nonceBytes [16]byte
	if _, err := rand.Read(nonceBytes[:]); err != nil {
		return ctx.Response().Json(500, goravelhttp.Json{"error": "Gagal membuat token keamanan"})
	}
	nonceHex := hex.EncodeToString(nonceBytes[:])
	now := time.Now().Unix()
	expiresUnix := now + 60 // 60 seconds single-use window

	intentNonceMu.Lock()
	for k, exp := range intentNonces {
		if exp < now {
			delete(intentNonces, k)
		}
	}
	intentNonces[nonceHex] = expiresUnix
	intentNonceMu.Unlock()

	payload := messageIntentPayload{
		Nonce:       nonceHex,
		SenderID:    senderID,
		TargetID:    targetID,
		ShopPostID:  postID,
		ExpiresUnix: expiresUnix,
	}
	plain, _ := json.Marshal(payload)

	key := messageIntentKey()
	block, err := aes.NewCipher(key[:])
	if err != nil {
		return ctx.Response().Json(500, goravelhttp.Json{"error": "Gagal mengenkripsi token"})
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return ctx.Response().Json(500, goravelhttp.Json{"error": "Gagal mengenkripsi token"})
	}
	gcmNonce := make([]byte, gcm.NonceSize())
	if _, err := rand.Read(gcmNonce); err != nil {
		return ctx.Response().Json(500, goravelhttp.Json{"error": "Gagal mengenkripsi token"})
	}
	sealed := gcm.Seal(gcmNonce, gcmNonce, plain, nil)
	token := base64.RawURLEncoding.EncodeToString(sealed)

	return ctx.Response().Json(200, goravelhttp.Json{"token": token})
}

// ResolveIntent verifies and consumes a single-use AES-GCM encrypted message intent token.
func (c *MessageController) ResolveIntent(ctx goravelhttp.Context) goravelhttp.Response {
	viewerID, authErr := authenticatedUserID(ctx)
	if authErr != nil {
		return ctx.Response().Json(401, goravelhttp.Json{"error": "Unauthorized"})
	}

	var body struct {
		Token string `json:"token"`
	}
	_ = ctx.Request().Bind(&body)
	rawToken := strings.TrimSpace(body.Token)
	if rawToken == "" {
		rawToken = strings.TrimSpace(ctx.Request().Input("token"))
	}
	if rawToken == "" {
		return ctx.Response().Json(400, goravelhttp.Json{"error": "Token wajib diisi"})
	}

	sealed, err := base64.RawURLEncoding.DecodeString(rawToken)
	if err != nil {
		return ctx.Response().Json(403, goravelhttp.Json{"error": "Token percakapan tidak valid"})
	}
	key := messageIntentKey()
	block, err := aes.NewCipher(key[:])
	if err != nil {
		return ctx.Response().Json(500, goravelhttp.Json{"error": "Gagal memverifikasi token"})
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil || len(sealed) < gcm.NonceSize() {
		return ctx.Response().Json(403, goravelhttp.Json{"error": "Token percakapan tidak valid"})
	}
	gcmNonce := sealed[:gcm.NonceSize()]
	ciphertext := sealed[gcm.NonceSize():]
	plain, err := gcm.Open(nil, gcmNonce, ciphertext, nil)
	if err != nil {
		return ctx.Response().Json(403, goravelhttp.Json{"error": "Token percakapan tidak valid atau telah dimodifikasi"})
	}

	var payload messageIntentPayload
	if err := json.Unmarshal(plain, &payload); err != nil {
		return ctx.Response().Json(403, goravelhttp.Json{"error": "Token percakapan tidak valid"})
	}
	if payload.SenderID != viewerID {
		return ctx.Response().Json(403, goravelhttp.Json{"error": "Token percakapan tidak diizinkan untuk akun ini"})
	}
	now := time.Now().Unix()
	if now > payload.ExpiresUnix {
		return ctx.Response().Json(403, goravelhttp.Json{"error": "Token percakapan sudah kedaluwarsa"})
	}

	intentNonceMu.Lock()
	exp, exists := intentNonces[payload.Nonce]
	if exists {
		delete(intentNonces, payload.Nonce)
	}
	intentNonceMu.Unlock()
	if !exists || now > exp {
		return ctx.Response().Json(403, goravelhttp.Json{"error": "Token percakapan sudah pernah digunakan atau kedaluwarsa"})
	}

	var targetUser *models.User
	if payload.TargetID > 0 && payload.TargetID != viewerID && !blockedBetween(viewerID, payload.TargetID) {
		var u models.User
		if db.DB.First(&u, payload.TargetID).Error == nil && u.AccountStatus == "active" {
			u.HidePrivateData()
			targetUser = &u
		}
	}

	var shopPost *models.Post
	if payload.ShopPostID > 0 {
		if p, err := postsWithCounters.GetForViewer(viewerID, payload.ShopPostID); err == nil && p != nil {
			shopPost = p
		}
	}

	return ctx.Response().Json(200, goravelhttp.Json{
		"target_user": targetUser,
		"shop_post":   shopPost,
	})
}

type callSignalEvent struct {
	Sequence   uint64       `json:"sequence"`
	CallID     string       `json:"call_id"`
	SignalType string       `json:"signal_type"` // offer, answer, candidate, reject, busy, hangup
	CallMode   string       `json:"call_mode"`   // voice, video
	FromUserID int64        `json:"from_user_id"`
	FromUser   *models.User `json:"from_user,omitempty"`
	SDP        string       `json:"sdp,omitempty"`
	Candidate  string       `json:"candidate,omitempty"`
	CreatedAt  int64        `json:"created_at"`
}

type callSession struct {
	CallID          string
	CallerID        int64
	CalleeID        int64
	CallerUser      models.User
	CallMode        string
	OfferSDP        string
	CandidateCache  []string
	Status          string // ringing, connected, ended
	RingingNotified bool
	CreatedAt       int64
	ConnectedAt     int64
	UpdatedAt       int64
	Logged          bool
}

var (
	callMu            sync.Mutex
	callSessions      = make(map[string]*callSession)
	callQueues        = make(map[int64][]callSignalEvent)
	userLastSeen      = make(map[int64]int64)
	callEventSequence uint64
)

func touchUserPresence(userID int64) {
	if userID <= 0 {
		return
	}
	now := time.Now().Unix()
	callMu.Lock()
	userLastSeen[userID] = now
	callMu.Unlock()
}

func cleanupStaleCallsLocked(now int64) {
	for id, sess := range callSessions {
		if (sess.Status == "ringing" && now-sess.CreatedAt > 45) || now-sess.UpdatedAt > 3600 {
			delete(callSessions, id)
		}
	}
}

func queueCallEventLocked(targetUserID int64, ev callSignalEvent) {
	callEventSequence++
	ev.Sequence = callEventSequence
	q := callQueues[targetUserID]
	if len(q) >= 100 {
		q = q[len(q)-99:]
	}
	callQueues[targetUserID] = append(q, ev)
}

func formatCallDurationText(seconds int64) string {
	if seconds < 0 {
		seconds = 0
	}
	mins := seconds / 60
	secs := seconds % 60
	return fmt.Sprintf("%02d:%02d", mins, secs)
}

// SendCallSignal handles authenticated WebRTC signaling (offer, ringing, answer, candidate, reject, busy, hangup) between two users.
func (c *MessageController) SendCallSignal(ctx goravelhttp.Context) goravelhttp.Response {
	userID, authErr := authenticatedUserID(ctx)
	if authErr != nil {
		return ctx.Response().Json(401, goravelhttp.Json{"error": "Unauthorized"})
	}

	var body struct {
		CallID          string `json:"call_id"`
		TargetID        any    `json:"target_id"`
		SignalType      string `json:"signal_type"`
		CallMode        string `json:"call_mode"`
		SDP             string `json:"sdp"`
		Candidate       string `json:"candidate"`
		DurationSeconds int64  `json:"duration_seconds"`
	}
	_ = ctx.Request().Bind(&body)
	if body.SignalType == "" {
		body.SignalType = ctx.Request().Input("signal_type")
	}
	if body.CallID == "" {
		body.CallID = ctx.Request().Input("call_id")
	}
	if body.CallMode == "" {
		body.CallMode = ctx.Request().Input("call_mode")
	}
	if body.SDP == "" {
		body.SDP = ctx.Request().Input("sdp")
	}
	if body.Candidate == "" {
		body.Candidate = ctx.Request().Input("candidate")
	}

	sigType := strings.ToLower(strings.TrimSpace(body.SignalType))
	callMode := strings.ToLower(strings.TrimSpace(body.CallMode))
	if callMode != "video" {
		callMode = "voice"
	}
	if len(body.SDP) > 65536 || len(body.Candidate) > 16384 {
		return ctx.Response().Json(400, goravelhttp.Json{"error": "Payload sinyal terlalu besar"})
	}

	now := time.Now().Unix()

	if sigType == "offer" {
		rawTarget := strings.TrimSpace(fmt.Sprint(body.TargetID))
		if body.TargetID == nil || rawTarget == "<nil>" || rawTarget == "" {
			rawTarget = strings.TrimSpace(ctx.Request().Input("target_id"))
		}
		calleeID := resolveUserToken(rawTarget)
		if calleeID <= 0 || calleeID == userID {
			return ctx.Response().Json(400, goravelhttp.Json{"error": "Penerima panggilan tidak valid"})
		}
		var callee models.User
		if db.DB.First(&callee, calleeID).Error != nil || callee.AccountStatus != "active" {
			return ctx.Response().Json(404, goravelhttp.Json{"error": "Pengguna tidak ditemukan"})
		}
		if blockedBetween(userID, calleeID) {
			return ctx.Response().Json(403, goravelhttp.Json{"error": "Panggilan tidak diizinkan"})
		}
		var caller models.User
		if db.DB.First(&caller, userID).Error != nil {
			return ctx.Response().Json(401, goravelhttp.Json{"error": "Unauthorized"})
		}
		caller.HidePrivateData()

		callID, err := models.NewPostHash()
		if err != nil {
			return ctx.Response().Json(500, goravelhttp.Json{"error": "Gagal membuat sesi panggilan"})
		}

		callMu.Lock()
		userLastSeen[userID] = now
		cleanupStaleCallsLocked(now)
		calleeOnline := userOnlineLocked(calleeID, now)
		sess := &callSession{
			CallID:     callID,
			CallerID:   userID,
			CalleeID:   calleeID,
			CallerUser: caller,
			CallMode:   callMode,
			OfferSDP:   body.SDP,
			Status:     "ringing",
			CreatedAt:  now,
			UpdatedAt:  now,
		}
		callSessions[callID] = sess
		callerCopy := caller
		queueCallEventLocked(calleeID, callSignalEvent{
			CallID:     callID,
			SignalType: "offer",
			CallMode:   callMode,
			FromUserID: userID,
			FromUser:   &callerCopy,
			SDP:        body.SDP,
			CreatedAt:  now,
		})
		callMu.Unlock()

		return ctx.Response().Json(200, goravelhttp.Json{
			"call_id":       callID,
			"call_mode":     callMode,
			"callee_online": calleeOnline,
		})
	}

	callID := strings.TrimSpace(body.CallID)
	if callID == "" {
		return ctx.Response().Json(400, goravelhttp.Json{"error": "call_id wajib diisi"})
	}

	callMu.Lock()
	userLastSeen[userID] = now
	cleanupStaleCallsLocked(now)
	sess, exists := callSessions[callID]
	if !exists {
		callMu.Unlock()
		return ctx.Response().Json(404, goravelhttp.Json{"error": "Sesi panggilan sudah berakhir"})
	}
	if userID != sess.CallerID && userID != sess.CalleeID {
		callMu.Unlock()
		return ctx.Response().Json(403, goravelhttp.Json{"error": "Akses sesi panggilan ditolak"})
	}

	peerID := sess.CalleeID
	if userID == sess.CalleeID {
		peerID = sess.CallerID
	}
	sess.UpdatedAt = now

	var logMsg *models.Message
	var logReceiverID int64

	switch sigType {
	case "ringing":
		if userID == sess.CalleeID && !sess.RingingNotified {
			sess.RingingNotified = true
			queueCallEventLocked(sess.CallerID, callSignalEvent{
				CallID:     callID,
				SignalType: "ringing",
				CallMode:   sess.CallMode,
				FromUserID: userID,
				CreatedAt:  now,
			})
		}

	case "answer":
		if userID != sess.CalleeID {
			callMu.Unlock()
			return ctx.Response().Json(403, goravelhttp.Json{"error": "Hanya penerima yang dapat menjawab panggilan"})
		}
		sess.Status = "connected"
		sess.ConnectedAt = now
		queueCallEventLocked(peerID, callSignalEvent{
			CallID:     callID,
			SignalType: "answer",
			CallMode:   sess.CallMode,
			FromUserID: userID,
			SDP:        body.SDP,
			CreatedAt:  now,
		})

	case "candidate":
		if userID == sess.CallerID && sess.Status == "ringing" && body.Candidate != "" && len(sess.CandidateCache) < 40 {
			sess.CandidateCache = append(sess.CandidateCache, body.Candidate)
		}
		queueCallEventLocked(peerID, callSignalEvent{
			CallID:     callID,
			SignalType: "candidate",
			CallMode:   sess.CallMode,
			FromUserID: userID,
			Candidate:  body.Candidate,
			CreatedAt:  now,
		})

	case "reject", "busy", "hangup":
		wasConnected := sess.Status == "connected"
		connectedAt := sess.ConnectedAt
		shouldLog := !sess.Logged
		sess.Logged = true
		sess.Status = "ended"
		delete(callSessions, callID)

		queueCallEventLocked(peerID, callSignalEvent{
			CallID:     callID,
			SignalType: sigType,
			CallMode:   sess.CallMode,
			FromUserID: userID,
			CreatedAt:  now,
		})

		if shouldLog {
			dur := body.DurationSeconds
			if dur <= 0 && wasConnected && connectedAt > 0 {
				dur = now - connectedAt
			}
			callStatus := "completed"
			if !wasConnected {
				if sigType == "reject" {
					callStatus = "rejected"
				} else if sigType == "busy" {
					callStatus = "busy"
				} else {
					callStatus = "missed"
				}
			}
			icon := "📞"
			label := "Panggilan Suara"
			if sess.CallMode == "video" {
				icon = "📹"
				label = "Video Call"
			}
			var content string
			switch callStatus {
			case "completed":
				content = fmt.Sprintf("%s %s • %s", icon, label, formatCallDurationText(dur))
			case "rejected":
				content = fmt.Sprintf("%s %s ditolak", icon, label)
			case "busy":
				content = fmt.Sprintf("%s %s (Sedang sibuk)", icon, label)
			default:
				content = fmt.Sprintf("%s %s tak terjawab", icon, label)
			}
			metaBytes, _ := json.Marshal(map[string]any{
				"call_id":          callID,
				"call_mode":        sess.CallMode,
				"status":           callStatus,
				"duration_seconds": dur,
			})
			logReceiverID = sess.CalleeID
			logMsg = &models.Message{
				SenderID:     sess.CallerID,
				Content:      content,
				MessageType:  "call",
				MetadataJSON: string(metaBytes),
			}
		}

	default:
		callMu.Unlock()
		return ctx.Response().Json(400, goravelhttp.Json{"error": "Tipe sinyal tidak dikenali"})
	}
	callMu.Unlock()

	var savedMsg *models.Message
	if logMsg != nil && logReceiverID > 0 {
		if m, err := c.msgRepo.SendRichMessage(logReceiverID, *logMsg); err == nil {
			savedMsg = &m
		}
	}

	return ctx.Response().Json(200, goravelhttp.Json{
		"ok":      true,
		"message": savedMsg,
	})
}

// PollCallSignals returns queued WebRTC signaling events and any active ringing incoming call for the authenticated user.
func (c *MessageController) PollCallSignals(ctx goravelhttp.Context) goravelhttp.Response {
	userID, authErr := authenticatedUserID(ctx)
	if authErr != nil {
		return ctx.Response().Json(401, goravelhttp.Json{"error": "Unauthorized"})
	}

	now := time.Now().Unix()
	callMu.Lock()
	userLastSeen[userID] = now
	cleanupStaleCallsLocked(now)
	ack, err := strconv.ParseUint(ctx.Request().Query("ack", "0"), 10, 64)
	if err != nil {
		callMu.Unlock()
		return ctx.Response().Json(400, goravelhttp.Json{"error": "Invalid signaling acknowledgement"})
	}
	if ack > callEventSequence {
		ack = 0
	}
	events := pendingCallEventsLocked(userID, ack)

	var activeIncoming *goravelhttp.Json
	var activeOutgoing *goravelhttp.Json
	for _, sess := range callSessions {
		if sess.CalleeID == userID && sess.Status == "ringing" && now-sess.CreatedAt <= 40 {
			if !sess.RingingNotified {
				sess.RingingNotified = true
				queueCallEventLocked(sess.CallerID, callSignalEvent{
					CallID:     sess.CallID,
					SignalType: "ringing",
					CallMode:   sess.CallMode,
					FromUserID: userID,
					CreatedAt:  now,
				})
			}
			callerCopy := sess.CallerUser
			activeIncoming = &goravelhttp.Json{
				"call_id":      sess.CallID,
				"call_mode":    sess.CallMode,
				"from_user_id": sess.CallerID,
				"from_user":    callerCopy,
				"sdp":          sess.OfferSDP,
				"candidates":   sess.CandidateCache,
				"created_at":   sess.CreatedAt,
			}
		}
		if sess.CallerID == userID && now-sess.CreatedAt <= 3600 {
			calleeOnline := userOnlineLocked(sess.CalleeID, now)
			activeOutgoing = &goravelhttp.Json{
				"call_id":          sess.CallID,
				"call_mode":        sess.CallMode,
				"status":           sess.Status,
				"ringing_notified": sess.RingingNotified,
				"callee_online":    calleeOnline,
			}
		}
	}
	sequence := callEventSequence
	callMu.Unlock()

	if events == nil {
		events = []callSignalEvent{}
	}

	return ctx.Response().Json(200, goravelhttp.Json{
		"events":          events,
		"sequence":        sequence,
		"active_incoming": activeIncoming,
		"active_outgoing": activeOutgoing,
	})
}
