package controllers

import (
	"bytes"
	"fmt"
	"net/http"
	"strconv"

	"goravel/app/dto"
	"goravel/app/models"
	"goravel/app/services"
	"goravel/pkg/storage"
	"goravel/resources/views/backend"

	goravelhttp "github.com/goravel/framework/contracts/http"
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
	ctxID := c.Value("userID")
	if ctxID == nil {
		return c.Response().Json(http.StatusUnauthorized, goravelhttp.Json{"error": "Unauthorized context"})
	}
	userID := ctxID.(int64)

	contentType := c.Request().Header("Content-Type", "")
	var req dto.CreatePostRequest

	if len(contentType) >= 19 && contentType[:19] == "multipart/form-data" {
		req.Content = c.Request().Input("content")
		req.PostType = models.PostType(c.Request().Input("post_type"))
		req.LinkURL = c.Request().Input("link_url")

		file, err := c.Request().File("media")
		if err == nil && file != nil {
			// upload single file for now
			urlStr, uploadErr := h.storageService.UploadFile(file)
			if uploadErr == nil {
				req.MediaURLs = append(req.MediaURLs, urlStr)
			}
		}
	} else {
		if err := c.Request().Bind(&req); err != nil {
			return c.Response().Json(http.StatusBadRequest, goravelhttp.Json{"error": err.Error()})
		}
	}

	post, err := h.postService.CreatePost(userID, &req)
	if err != nil {
		return c.Response().Json(http.StatusBadRequest, goravelhttp.Json{"error": err.Error()})
	}

	return c.Response().Json(http.StatusCreated, post)
}

func (h *PostController) GetFeedAPI(c goravelhttp.Context) goravelhttp.Response {
	userIDStr := c.Request().Query("user_id", "")
	if userIDStr != "" {
		userID, err := strconv.ParseInt(userIDStr, 10, 64)
		if err == nil {
			posts, err := h.postService.GetUserPosts(userID)
			if err != nil {
				return c.Response().Json(http.StatusInternalServerError, goravelhttp.Json{"error": err.Error()})
			}
			return c.Response().Json(http.StatusOK, posts)
		}
	}

	limitStr := c.Request().Query("limit", "10")
	offsetStr := c.Request().Query("offset", "0")
	limit, limitErr := strconv.Atoi(limitStr)
	offset, offsetErr := strconv.Atoi(offsetStr)
	if limitErr != nil || limit < 1 || limit > 50 || offsetErr != nil || offset < 0 || offset > 10000 {
		return c.Response().Json(http.StatusBadRequest, goravelhttp.Json{"error": "limit must be 1-50 and offset must be 0-10000"})
	}

	posts, err := h.postService.GetFeed(limit, offset)
	if err != nil {
		return c.Response().Json(http.StatusInternalServerError, goravelhttp.Json{"error": err.Error()})
	}

	return c.Response().Json(http.StatusOK, posts)
}

func (h *PostController) DeletePostAPI(c goravelhttp.Context) goravelhttp.Response {
	ctxID := c.Value("userID")
	if ctxID == nil {
		return c.Response().Json(http.StatusUnauthorized, goravelhttp.Json{"error": "Unauthorized context"})
	}
	userID := ctxID.(int64)

	postID, err := strconv.ParseInt(c.Request().Route("id"), 10, 64)
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
	file, err := c.Request().File("file")
	if err != nil {
		return c.Response().Json(http.StatusBadRequest, goravelhttp.Json{"error": "File payload is required under key 'file'"})
	}

	urlStr, err := h.storageService.UploadFile(file)
	if err != nil {
		return c.Response().Json(http.StatusInternalServerError, goravelhttp.Json{"error": fmt.Sprintf("Failed to store file: %s", err.Error())})
	}

	return c.Response().Json(http.StatusOK, goravelhttp.Json{"url": urlStr})
}

func (h *PostController) LikePostAPI(c goravelhttp.Context) goravelhttp.Response {
	ctxID := c.Value("userID")
	if ctxID == nil {
		return c.Response().Json(http.StatusUnauthorized, goravelhttp.Json{"error": "Unauthorized context"})
	}
	userID := ctxID.(int64)

	postID, err := strconv.ParseInt(c.Request().Route("id"), 10, 64)
	if err != nil {
		return c.Response().Json(http.StatusBadRequest, goravelhttp.Json{"error": "Invalid post ID"})
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

	postID, err := strconv.ParseInt(c.Request().Route("id"), 10, 64)
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

	posts, _ := h.postService.GetFeed(30, 0)

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
		Content:  content,
		PostType: models.PostType(pType),
	}

	file, err := c.Request().File("media")
	if err == nil && file != nil {
		urlStr, uploadErr := h.storageService.UploadFile(file)
		if uploadErr == nil {
			req.MediaURLs = append(req.MediaURLs, urlStr)
			req.PostType = models.PostTypeImage
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
