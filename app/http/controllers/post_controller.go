package controllers

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"goravel/app/dto"
	"goravel/app/models"
	"goravel/app/services"
	"goravel/pkg/db"
	"goravel/pkg/storage"
	"goravel/resources/views/backend"

	goravelhttp "github.com/goravel/framework/contracts/http"
	"gorm.io/gorm"
)

type PostController struct {
	postService    services.PostService
	userController *UserController
	storageService storage.StorageService
}

func NewPostController(postService services.PostService, userController *UserController, storageService storage.StorageService) *PostController {
	return &PostController{
		postService:    postService,
		userController: userController,
		storageService: storageService,
	}
}

// ==========================================
// REST API Controllers (JSON & Multipart)
// ==========================================

func (h *PostController) CreatePostAPI(c goravelhttp.Context) goravelhttp.Response {
	userID, err := authenticatedUserID(c)
	if err != nil {
		return c.Response().Json(http.StatusUnauthorized, goravelhttp.Json{"error": "Unauthorized"})
	}

	contentType := c.Request().Header("Content-Type", "")
	var req dto.CreatePostRequest

	if strings.HasPrefix(contentType, "multipart/form-data") {
		req.Title = c.Request().Input("title")
		req.Content = c.Request().Input("content")
		req.PostType = models.PostType(c.Request().Input("post_type"))
		req.LinkURL = c.Request().Input("link_url")
		req.Location = c.Request().Input("location")
		req.Visibility = c.Request().Input("visibility")
		req.Hashtags = splitListInput(c.Request().Input("hashtags"))
		req.Mentions = splitListInput(c.Request().Input("mentions"))
		files, filesErr := c.Request().Files("media")
		if filesErr != nil {
			if file, err := c.Request().File("media"); err == nil && file != nil {
				files = append(files, file)
			}
		}
		if len(files) > services.ImagesMax+1 {
			return c.Response().Json(http.StatusBadRequest, goravelhttp.Json{"error": "too many media files"})
		}
		for _, file := range files {
			stored, uploadErr := h.storageService.Upload(file)
			if uploadErr != nil {
				return c.Response().Json(http.StatusBadRequest, goravelhttp.Json{"error": uploadErr.Error()})
			}
			if err := h.postService.RecordUpload(userID, stored); err != nil {
				return c.Response().Json(http.StatusInternalServerError, goravelhttp.Json{"error": "failed to record upload"})
			}
			req.Media = append(req.Media, dto.MediaItem{URL: stored.URL, Type: models.MediaType(stored.Type), DurationSeconds: stored.DurationSeconds})
		}
		if req.PostType == models.PostTypeShop {
			req.Shop = &dto.ShopPostRequest{}
			req.Shop.PriceMinor, _ = strconv.ParseInt(c.Request().Input("price_minor"), 10, 64)
			req.Shop.Currency = c.Request().Input("currency")
			req.Shop.Category = c.Request().Input("category")
			req.Shop.Condition = c.Request().Input("condition")
			req.Shop.Brand = c.Request().Input("brand")
			req.Shop.Fulfillment = c.Request().Input("fulfillment")
			req.Shop.PaymentMethod = c.Request().Input("payment_method")
			req.Shop.SellerAccountID = c.Request().Input("seller_account_id")
			if stock := strings.TrimSpace(c.Request().Input("stock")); stock != "" {
				parsed, err := strconv.ParseInt(stock, 10, 64)
				if err != nil {
					return c.Response().Json(http.StatusBadRequest, goravelhttp.Json{"error": "stock must be a whole number"})
				}
				req.Shop.Stock = &parsed
			}
		}
	} else {
		if err := c.Request().Bind(&req); err != nil {
			return c.Response().Json(http.StatusBadRequest, goravelhttp.Json{"error": err.Error()})
		}
		// Media URLs must point at this user's own uploads; type and duration
		// come from the server-side upload record, never from the client.
		urls := append(append(append([]string{}, req.MediaURLs...), req.ImageURLs...), strings.TrimSpace(req.VideoURL))
		media, err := h.postService.ResolveMedia(userID, 0, compactStrings(urls))
		if err != nil {
			return c.Response().Json(http.StatusBadRequest, goravelhttp.Json{"error": err.Error()})
		}
		req.Media = media
	}

	post, err := h.postService.CreatePost(userID, &req)
	if err != nil {
		return c.Response().Json(http.StatusBadRequest, goravelhttp.Json{"error": err.Error()})
	}

	return c.Response().Json(http.StatusCreated, post)
}

// UpdatePostAPI edits title, description, location, visibility, hashtags,
// mentions, link, media (images/video), and shop details of the caller's post.
func (h *PostController) UpdatePostAPI(c goravelhttp.Context) goravelhttp.Response {
	userID, err := authenticatedUserID(c)
	if err != nil {
		return c.Response().Json(http.StatusUnauthorized, goravelhttp.Json{"error": "Unauthorized"})
	}
	postID, err := routePostID(c)
	if err != nil {
		return c.Response().Json(http.StatusBadRequest, goravelhttp.Json{"error": "Invalid post ID"})
	}
	var req dto.UpdatePostRequest
	if err := c.Request().Bind(&req); err != nil {
		return c.Response().Json(http.StatusBadRequest, goravelhttp.Json{"error": "invalid request"})
	}
	if req.MediaURLs != nil {
		media, err := h.postService.ResolveMedia(userID, postID, compactStrings(req.MediaURLs))
		if err != nil {
			return c.Response().Json(http.StatusBadRequest, goravelhttp.Json{"error": err.Error()})
		}
		req.Media = media
	}
	post, err := h.postService.UpdatePost(userID, postID, &req)
	switch {
	case errors.Is(err, gorm.ErrRecordNotFound):
		return c.Response().Json(http.StatusNotFound, goravelhttp.Json{"error": "Post not found"})
	case errors.Is(err, services.ErrForbidden):
		return c.Response().Json(http.StatusForbidden, goravelhttp.Json{"error": err.Error()})
	case err != nil:
		return c.Response().Json(http.StatusBadRequest, goravelhttp.Json{"error": err.Error()})
	}
	return c.Response().Json(http.StatusOK, post)
}

func compactStrings(values []string) []string {
	result := make([]string, 0, len(values))
	for _, value := range values {
		if value = strings.TrimSpace(value); value != "" {
			result = append(result, value)
		}
	}
	return result
}

func (h *PostController) GetFeedAPI(c goravelhttp.Context) goravelhttp.Response {
	viewerID, authErr := authenticatedUserID(c)
	if authErr != nil {
		return c.Response().Json(http.StatusUnauthorized, goravelhttp.Json{"error": "Unauthorized"})
	}

	userIDStr := c.Request().Query("user_id", "")
	if userIDStr != "" {
		userID, err := strconv.ParseInt(userIDStr, 10, 64)
		if err == nil {
			posts, err := h.postService.GetUserPosts(viewerID, userID)
			if err != nil {
				return c.Response().Json(http.StatusInternalServerError, goravelhttp.Json{"error": err.Error()})
			}
			return c.Response().Json(http.StatusOK, posts)
		}
	}

	limitStr := c.Request().Query("limit", "10")
	offsetStr := c.Request().Query("offset", "0")
	beforeIDStr := c.Request().Query("before_id", "0")
	limit, limitErr := strconv.Atoi(limitStr)
	offset, offsetErr := strconv.Atoi(offsetStr)
	beforeID, beforeIDErr := strconv.ParseInt(beforeIDStr, 10, 64)
	if limitErr != nil || limit < 1 || limit > 50 || offsetErr != nil || offset < 0 || offset > 10000 || beforeIDErr != nil || beforeID < 0 {
		return c.Response().Json(http.StatusBadRequest, goravelhttp.Json{"error": "limit must be 1-50, offset 0-10000, and before_id must be a positive ID"})
	}

	shortsOnly := c.Request().Query("kind", "") == "shorts"
	posts, err := h.postService.GetFeed(viewerID, limit, offset, beforeID, shortsOnly, c.Request().Query("kind", ""))
	if err != nil {
		return c.Response().Json(http.StatusInternalServerError, goravelhttp.Json{"error": err.Error()})
	}

	return c.Response().Json(http.StatusOK, posts)
}

func (h *PostController) GetPostAPI(c goravelhttp.Context) goravelhttp.Response {
	viewerID, err := authenticatedUserID(c)
	if err != nil {
		return c.Response().Json(http.StatusUnauthorized, goravelhttp.Json{"error": "Unauthorized"})
	}
	postID, err := routePostID(c)
	if err != nil {
		return c.Response().Json(http.StatusBadRequest, goravelhttp.Json{"error": "Invalid post ID"})
	}
	post, err := h.postService.GetPost(viewerID, postID)
	if err != nil || !canViewPost(viewerID, post) {
		return c.Response().Json(http.StatusNotFound, goravelhttp.Json{"error": "Post not found"})
	}
	return c.Response().Json(http.StatusOK, post)
}

func (h *PostController) DeletePostAPI(c goravelhttp.Context) goravelhttp.Response {
	ctxID := c.Value("userID")
	if ctxID == nil {
		return c.Response().Json(http.StatusUnauthorized, goravelhttp.Json{"error": "Unauthorized context"})
	}
	userID := ctxID.(int64)

	postID, err := routePostID(c)
	if err != nil {
		return c.Response().Json(http.StatusBadRequest, goravelhttp.Json{"error": "Invalid post ID"})
	}

	if err := h.postService.DeletePost(userID, postID); err != nil {
		return c.Response().Json(http.StatusBadRequest, goravelhttp.Json{"error": err.Error()})
	}

	return c.Response().Json(http.StatusOK, goravelhttp.Json{"message": "Post successfully deleted"})
}

func (h *PostController) GetLinkPreviewAPI(c goravelhttp.Context) goravelhttp.Response {
	targetURL := c.Request().Query("url", "")
	if targetURL == "" {
		return c.Response().Json(http.StatusBadRequest, goravelhttp.Json{"error": "Query parameter 'url' is required"})
	}

	preview, err := h.postService.GetLinkPreview(targetURL)
	if err != nil {
		return c.Response().Json(http.StatusBadRequest, goravelhttp.Json{"error": err.Error()})
	}

	return c.Response().Json(http.StatusOK, preview)
}

func (h *PostController) UploadMediaAPI(c goravelhttp.Context) goravelhttp.Response {
	userID, err := authenticatedUserID(c)
	if err != nil {
		return c.Response().Json(http.StatusUnauthorized, goravelhttp.Json{"error": "Unauthorized"})
	}
	file, err := c.Request().File("file")
	if err != nil {
		return c.Response().Json(http.StatusBadRequest, goravelhttp.Json{"error": "File payload is required under key 'file'"})
	}

	stored, err := h.storageService.Upload(file)
	if err != nil {
		return c.Response().Json(http.StatusBadRequest, goravelhttp.Json{"error": err.Error()})
	}
	if err := h.postService.RecordUpload(userID, stored); err != nil {
		return c.Response().Json(http.StatusInternalServerError, goravelhttp.Json{"error": fmt.Sprintf("Failed to record file: %s", err.Error())})
	}

	return c.Response().Json(http.StatusOK, goravelhttp.Json{
		"url": stored.URL, "media_type": stored.Type, "duration_seconds": stored.DurationSeconds, "size_bytes": stored.SizeBytes,
		"is_short": stored.Type == "video" && stored.DurationSeconds >= services.ShortMinSeconds && stored.DurationSeconds <= services.ShortMaxSeconds,
	})
}

func splitListInput(value string) []string {
	value = strings.TrimSpace(value)
	if value == "" {
		return nil
	}
	var decoded []string
	if strings.HasPrefix(value, "[") && json.Unmarshal([]byte(value), &decoded) == nil {
		return decoded
	}
	return strings.FieldsFunc(value, func(r rune) bool { return r == ',' || r == ' ' || r == '\n' })
}

func (h *PostController) LikePostAPI(c goravelhttp.Context) goravelhttp.Response {
	ctxID := c.Value("userID")
	if ctxID == nil {
		return c.Response().Json(http.StatusUnauthorized, goravelhttp.Json{"error": "Unauthorized context"})
	}
	userID := ctxID.(int64)

	postID, err := routePostID(c)
	if err != nil {
		return c.Response().Json(http.StatusBadRequest, goravelhttp.Json{"error": "Invalid post ID"})
	}
	var post models.Post
	if db.DB.First(&post, postID).Error != nil || !canViewPost(userID, &post) {
		return c.Response().Json(http.StatusNotFound, goravelhttp.Json{"error": "Post not found"})
	}

	liked, err := h.postService.ToggleLikePost(postID, userID)
	if err != nil {
		return c.Response().Json(http.StatusInternalServerError, goravelhttp.Json{"error": err.Error()})
	}

	return c.Response().Json(http.StatusOK, goravelhttp.Json{
		"liked": liked,
	})
}

func (h *PostController) CommentPostAPI(c goravelhttp.Context) goravelhttp.Response {
	ctxID := c.Value("userID")
	if ctxID == nil {
		return c.Response().Json(http.StatusUnauthorized, goravelhttp.Json{"error": "Unauthorized context"})
	}
	userID := ctxID.(int64)

	postID, err := routePostID(c)
	if err != nil {
		return c.Response().Json(http.StatusBadRequest, goravelhttp.Json{"error": "Invalid post ID"})
	}

	var req struct {
		Content string `json:"content"`
	}
	if err := c.Request().Bind(&req); err != nil || req.Content == "" {
		return c.Response().Json(http.StatusBadRequest, goravelhttp.Json{"error": "Content cannot be empty"})
	}
	content := req.Content
	var post models.Post
	if db.DB.First(&post, postID).Error != nil || !canViewPost(userID, &post) {
		return c.Response().Json(http.StatusNotFound, goravelhttp.Json{"error": "Post not found"})
	}

	comment, err := h.postService.AddCommentToPost(postID, userID, content)
	if err != nil {
		return c.Response().Json(http.StatusInternalServerError, goravelhttp.Json{"error": err.Error()})
	}

	return c.Response().Json(http.StatusCreated, comment)
}

// ==========================================
// SSR Web Controllers (HTML)
// ==========================================

func (h *PostController) ShowBerandaWeb(c goravelhttp.Context) goravelhttp.Response {
	user, resp := h.userController.getWebUser(c)
	if resp != nil {
		return resp
	}

	posts, _ := h.postService.GetFeed(user.ID, 30, 0, 0, false)

	var buf bytes.Buffer
	data := backend.BerandaData{
		CurrentUser: *user,
		Posts:       posts,
	}
	_ = backend.RenderBeranda(&buf, data)
	return c.Response().Data(http.StatusOK, "text/html; charset=utf-8", buf.Bytes())
}

func (h *PostController) HandleCreatePostWeb(c goravelhttp.Context) goravelhttp.Response {
	user, resp := h.userController.getWebUser(c)
	if resp != nil {
		return resp
	}

	content := c.Request().Input("content")
	pType := c.Request().Input("post_type")
	if pType == "" {
		pType = string(models.PostTypeText)
	}

	req := dto.CreatePostRequest{
		Title:    c.Request().Input("title"),
		Content:  content,
		PostType: models.PostType(pType),
		Hashtags: splitListInput(c.Request().Input("hashtags")),
		Mentions: splitListInput(c.Request().Input("mentions")),
	}

	file, err := c.Request().File("media")
	if err == nil && file != nil {
		stored, uploadErr := h.storageService.Upload(file)
		if uploadErr == nil && h.postService.RecordUpload(user.ID, stored) == nil {
			req.Media = append(req.Media, dto.MediaItem{URL: stored.URL, Type: models.MediaType(stored.Type), DurationSeconds: stored.DurationSeconds})
			req.PostType = models.PostTypeImage
			if stored.Type == "video" {
				req.PostType = models.PostTypeVideo
			}
		}
	}

	linkURL := c.Request().Input("link_url")
	if linkURL != "" {
		req.LinkURL = linkURL
		req.PostType = models.PostTypeLink
	}

	_, _ = h.postService.CreatePost(user.ID, &req)

	return c.Response().Redirect(http.StatusSeeOther, "/web/beranda")
}
