package services

import (
	"errors"
	"fmt"
	"log"
	"net/url"
	"os"
	"regexp"
	"strconv"
	"strings"
	"unicode/utf8"

	"github.com/goravel/framework/contracts/queue"

	"goravel/app/dto"
	"goravel/app/facades"
	"goravel/app/jobs"
	"goravel/app/models"
	"goravel/app/repositories"
	"goravel/pkg/db"
	"goravel/pkg/linkpreview"
)

type PostService interface {
	CreatePost(userID int64, req *dto.CreatePostRequest) (*models.Post, error)
	GetFeed(viewerID int64, limit, offset int, beforeID int64) ([]models.Post, error)
	GetUserPosts(viewerID, userID int64) ([]models.Post, error)
	DeletePost(userID int64, postID int64) error
	DeletePostAsAdmin(postID int64) error
	GetLinkPreview(targetURL string) (*linkpreview.Preview, error)
	ToggleLikePost(postID, userID int64) (bool, error)
	AddCommentToPost(postID, userID int64, content string) (*models.PostComment, error)
}

type postService struct {
	postRepo repositories.PostRepository
	userRepo repositories.UserRepository
}

func NewPostService(postRepo repositories.PostRepository, userRepo repositories.UserRepository) PostService {
	return &postService{postRepo: postRepo, userRepo: userRepo}
}

func (s *postService) CreatePost(userID int64, req *dto.CreatePostRequest) (*models.Post, error) {
	req.Title = strings.TrimSpace(req.Title)
	req.Content = strings.TrimSpace(req.Content)
	titleLength := utf8.RuneCountInString(req.Title)
	wordCount := len(strings.Fields(req.Content))
	if titleLength < 5 || titleLength > 100 {
		return nil, errors.New("title must contain 5-100 characters")
	}
	if wordCount < 160 || wordCount > 6000 {
		return nil, errors.New("description must contain 160-6000 words")
	}
	if len(req.LinkURL) > 500 || len(req.Location) > 255 {
		return nil, errors.New("post exceeds the allowed size")
	}
	switch req.PostType {
	case models.PostTypeText, models.PostTypeImage, models.PostTypeVideo, models.PostTypeLink, models.PostTypeShop:
	default:
		return nil, errors.New("invalid post type")
	}
	if req.PostType == models.PostTypeLink {
		parsed, err := url.ParseRequestURI(req.LinkURL)
		if err != nil || (parsed.Scheme != "http" && parsed.Scheme != "https") || parsed.Hostname() == "" {
			return nil, errors.New("link URL must be a valid HTTP or HTTPS URL")
		}
	}
	tags := normalizeHashtags(req.Hashtags, req.Content)
	minimumTags, maximumTags := 3, 9
	if req.PostType == models.PostTypeShop {
		maximumTags = 30
	}
	if len(tags) < minimumTags || len(tags) > maximumTags {
		return nil, fmt.Errorf("post requires %d-%d unique hashtags", minimumTags, maximumTags)
	}
	mentions := normalizeMentions(req.Mentions, req.Content)
	if len(mentions) < 1 || len(mentions) > 10 {
		return nil, errors.New("post requires 1-10 unique mentions")
	}
	mentionedUsers := make([]models.User, 0, len(mentions))
	for _, username := range mentions {
		user, err := s.userRepo.GetByUsername(username)
		if err != nil {
			return nil, fmt.Errorf("mentioned user @%s was not found", username)
		}
		mentionedUsers = append(mentionedUsers, *user)
	}
	mediaCount := len(req.MediaURLs)
	if len(req.ImageURLs) > 0 {
		mediaCount = len(req.ImageURLs)
	}
	if req.PostType == models.PostTypeImage && (mediaCount < 1 || mediaCount > 6) {
		return nil, errors.New("image posts require 1-6 images")
	}
	if req.PostType == models.PostTypeVideo && mediaCount != 1 {
		return nil, errors.New("video posts require exactly one video")
	}
	if req.PostType == models.PostTypeShop {
		if len(req.ImageURLs) < 1 || len(req.ImageURLs) > 6 {
			return nil, errors.New("shop posts require 1-6 product images")
		}
		if req.Shop == nil || req.Shop.PriceMinor <= 0 || len(strings.TrimSpace(req.Shop.Currency)) != 3 || strings.TrimSpace(req.Shop.Category) == "" {
			return nil, errors.New("shop price, ISO currency, and category are required")
		}
		condition := strings.ToLower(strings.TrimSpace(req.Shop.Condition))
		if condition != "new" && condition != "used" {
			return nil, errors.New("shop condition must be new or used")
		}
		if req.Shop.Stock != nil && *req.Shop.Stock < 0 {
			return nil, errors.New("stock cannot be negative")
		}
	}
	post := &models.Post{
		UserID:     userID,
		PostType:   req.PostType,
		Visibility: "public",
	}
	post.Title = &req.Title
	post.Content = &req.Content
	if location := strings.TrimSpace(req.Location); location != "" {
		post.Location = &location
	}
	if req.Visibility != "" {
		visibility := strings.ToLower(strings.TrimSpace(req.Visibility))
		if visibility != "public" && visibility != "followers" {
			return nil, errors.New("visibility must be public or followers")
		}
		post.Visibility = visibility
	}
	for _, tag := range tags {
		post.Hashtags = append(post.Hashtags, models.PostHashtag{Tag: tag})
	}
	for _, user := range mentionedUsers {
		post.Mentions = append(post.Mentions, models.PostMention{MentionedUserID: user.ID})
	}

	// Map uploaded media assets to child PostMedia records
	if req.PostType == models.PostTypeImage || req.PostType == models.PostTypeVideo {
		var mType models.MediaType
		if req.PostType == models.PostTypeImage {
			mType = models.MediaTypeImage
		} else {
			mType = models.MediaTypeVideo
		}

		for index, u := range req.MediaURLs {
			duration := 0
			if index < len(req.MediaDurations) { duration = req.MediaDurations[index] }
			post.Media = append(post.Media, models.PostMedia{
				MediaType: mType,
				MediaURL:  u,
				DurationSeconds: duration,
				IsShort: mType == models.MediaTypeVideo && duration >= 60 && duration <= 90,
				ProcessingStatus: func() string { if mType == models.MediaTypeVideo { return "pending" }; return "ready" }(),
			})
		}
	}
	if req.PostType == models.PostTypeShop {
		for _, u := range req.ImageURLs {
			post.Media = append(post.Media, models.PostMedia{MediaType: models.MediaTypeImage, MediaURL: u, ProcessingStatus: "ready"})
		}
		if strings.TrimSpace(req.VideoURL) != "" {
			duration := req.Shop.VideoDurationSeconds
			if duration < 30 || duration > 90 { return nil, errors.New("shop video duration must be 30-90 seconds") }
			post.Media = append(post.Media, models.PostMedia{MediaType: models.MediaTypeVideo, MediaURL: req.VideoURL, DurationSeconds: duration, IsShort: duration >= 60, ProcessingStatus: "pending"})
		}
		brand, fulfillment, payment, seller := optional(req.Shop.Brand), optional(req.Shop.Fulfillment), optional(req.Shop.PaymentMethod), optional(req.Shop.SellerAccountID)
		post.Shop = &models.ShopProduct{PriceMinor: req.Shop.PriceMinor, Currency: strings.ToUpper(req.Shop.Currency), Category: strings.TrimSpace(req.Shop.Category), Condition: strings.ToLower(req.Shop.Condition), Stock: req.Shop.Stock, Brand: brand, Fulfillment: valueOrEmpty(fulfillment), PaymentMethod: valueOrEmpty(payment), SellerAccountID: seller}
	}

	// Persist the URL immediately; a bounded background job fills its metadata.
	if req.PostType == models.PostTypeLink && req.LinkURL != "" {
		post.Link = &models.PostLink{
			URL:           req.LinkURL,
			PreviewStatus: models.LinkPreviewPending,
		}
	}

	if err := s.postRepo.Create(post); err != nil {
		return nil, err
	}
	if post.Link != nil {
		if err := enqueueLinkPreview(post.Link.ID); err != nil {
			log.Printf("link preview queue rejected link %d: %v", post.Link.ID, err)
			_ = db.DB.Model(post.Link).Updates(map[string]any{
				"preview_status": models.LinkPreviewFailed,
				"preview_error":  "preview queue is temporarily unavailable",
			}).Error
		}
	}
	for _, media := range post.Media {
		if media.MediaType == models.MediaTypeVideo {
			if err := facades.Queue().Job(&jobs.TranscodePostMedia{}, []queue.Arg{{Value: media.ID, Type: "int64"}}).Dispatch(); err != nil { _ = db.DB.Model(&models.PostMedia{}).Where("id = ?", media.ID).Update("processing_status", "failed").Error }
		}
	}

	created, err := s.postRepo.GetByID(post.ID)
	if err == nil {
		createMentionNotifications(userID, post.ID, mentionedUsers)
	}
	return created, err
}

var hashtagPattern = regexp.MustCompile(`(?i)(?:^|\s)#([\p{L}\p{N}_]{2,63})`)
var mentionPattern = regexp.MustCompile(`(?i)(?:^|\s)@([a-z0-9_]{3,40})`)

func normalizeHashtags(explicit []string, content string) []string {
	values := append([]string{}, explicit...)
	for _, match := range hashtagPattern.FindAllStringSubmatch(content, -1) {
		values = append(values, match[1])
	}
	return normalizedUnique(values, "#")
}

func normalizeMentions(explicit []string, content string) []string {
	values := append([]string{}, explicit...)
	for _, match := range mentionPattern.FindAllStringSubmatch(content, -1) {
		values = append(values, match[1])
	}
	return normalizedUnique(values, "@")
}

func normalizedUnique(values []string, trimPrefix string) []string {
	seen := map[string]bool{}
	result := make([]string, 0, len(values))
	for _, value := range values {
		value = strings.ToLower(strings.Trim(strings.TrimSpace(value), trimPrefix))
		if value != "" && !seen[value] {
			seen[value] = true
			result = append(result, value)
		}
	}
	return result
}

func optional(value string) *string {
	value = strings.TrimSpace(value)
	if value == "" {
		return nil
	}
	return &value
}
func valueOrEmpty(value *string) string {
	if value == nil {
		return ""
	}
	return *value
}

func createMentionNotifications(actorID, postID int64, users []models.User) {
	for _, user := range users {
		if user.ID != actorID {
			entityID := postID
			actor := actorID
			_ = db.DB.Create(&models.Notification{UserID: user.ID, ActorID: &actor, Type: "mention", EntityType: "post", EntityID: &entityID, Message: "You were mentioned in a post"}).Error
		}
	}
}

func enqueueLinkPreview(linkID int64) error {
	maximum := 10000
	if configured, err := strconv.Atoi(os.Getenv("QUEUE_MAX_PENDING")); err == nil && configured > 0 {
		maximum = configured
	}

	var pending int64
	if err := db.DB.Table("jobs").Where("queue = ?", "default").Count(&pending).Error; err != nil {
		return err
	}
	if pending >= int64(maximum) {
		return errors.New("background queue is full")
	}

	return facades.Queue().Job(&jobs.FetchLinkPreview{}, []queue.Arg{
		{Value: linkID, Type: "int64"},
	}).Dispatch()
}

func (s *postService) GetFeed(viewerID int64, limit, offset int, beforeID int64) ([]models.Post, error) {
	return s.postRepo.ListAll(viewerID, limit, offset, beforeID)
}

func (s *postService) GetUserPosts(viewerID, userID int64) ([]models.Post, error) {
	return s.postRepo.ListByUserID(viewerID, userID)
}

func (s *postService) DeletePost(userID int64, postID int64) error {
	post, err := s.postRepo.GetByID(postID)
	if err != nil {
		return err
	}
	if post.UserID != userID {
		return errors.New("forbidden: cannot delete another user's post")
	}
	return s.postRepo.Delete(postID)
}

func (s *postService) DeletePostAsAdmin(postID int64) error {
	return s.postRepo.Delete(postID)
}

func (s *postService) GetLinkPreview(targetURL string) (*linkpreview.Preview, error) {
	return linkpreview.FetchPreview(targetURL)
}

func (s *postService) ToggleLikePost(postID, userID int64) (bool, error) {
	liked, err := s.postRepo.ToggleLike(postID, userID)
	if err == nil && liked {
		if post, getErr := s.postRepo.GetByID(postID); getErr == nil && post.UserID != userID {
			entityID, actor := postID, userID
			_ = db.DB.Create(&models.Notification{UserID: post.UserID, ActorID: &actor, Type: "like", EntityType: "post", EntityID: &entityID, Message: "Someone liked your post"}).Error
		}
	}
	return liked, err
}

func (s *postService) AddCommentToPost(postID, userID int64, content string) (*models.PostComment, error) {
	content = strings.TrimSpace(content)
	if content == "" || len(content) > 5000 {
		return nil, errors.New("comment must be between 1 and 5000 bytes")
	}
	comment, err := s.postRepo.AddComment(postID, userID, content)
	if err == nil {
		if post, getErr := s.postRepo.GetByID(postID); getErr == nil && post.UserID != userID {
			entityID, actor := postID, userID
			_ = db.DB.Create(&models.Notification{UserID: post.UserID, ActorID: &actor, Type: "comment", EntityType: "post", EntityID: &entityID, Message: "Someone commented on your post"}).Error
		}
	}
	return comment, err
}
