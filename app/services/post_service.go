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
	"time"
	"unicode/utf8"

	"github.com/goravel/framework/contracts/queue"
	"gorm.io/gorm"

	"goravel/app/dto"
	"goravel/app/facades"
	"goravel/app/jobs"
	"goravel/app/models"
	"goravel/app/repositories"
	"goravel/pkg/db"
	"goravel/pkg/linkpreview"
	"goravel/pkg/storage"
)

// Post content rules from the product requirements.
const (
	TitleMinChars       = 5
	TitleMaxChars       = 100
	DescriptionMinWords = 160
	DescriptionMaxWords = 6000
	HashtagsMin         = 3
	HashtagsMax         = 9
	ShopHashtagsMax     = 30
	MentionsMin         = 1
	MentionsMax         = 10
	ImagesMax           = 6
	ShortMinSeconds     = 60
	ShortMaxSeconds     = 90
	ShopVideoMinSeconds = 30
	ShopVideoMaxSeconds = 90
)

// ErrForbidden is returned when a user edits or deletes someone else's post.
var ErrForbidden = errors.New("forbidden: you can only change your own posts")

// SubscriptionPlans defines the 9 user tiers: daily post quota, blue check, and location feature access.
var SubscriptionPlans = map[string]struct {
	MaxPostsPerDay int
	BlueVerified   bool
	AllowLocation  bool
}{
	"free":    {1, false, false},
	"tier_3":  {3, false, true},
	"tier_6":  {6, true, false},
	"tier_9":  {9, true, false},
	"tier_12": {12, true, true},
	"tier_15": {15, true, true},
	"tier_18": {18, true, true},
	"tier_21": {21, true, true},
	"tier_24": {24, true, true},
}

type PostService interface {
	CreatePost(userID int64, req *dto.CreatePostRequest) (*models.Post, error)
	UpdatePost(userID, postID int64, req *dto.UpdatePostRequest) (*models.Post, error)
	ResolveMedia(userID, postID int64, urls []string) ([]dto.MediaItem, error)
	RecordUpload(userID int64, stored *storage.StoredMedia) error
	GetFeed(viewerID int64, limit, offset int, beforeID int64, shortsOnly bool, kind ...string) ([]models.Post, error)
	GetUserPosts(viewerID, userID int64) ([]models.Post, error)
	GetPost(viewerID, postID int64) (*models.Post, error)
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

// postDraft is the complete state of a post being created or edited; both
// paths validate the same draft so an edit can never bypass a creation rule.
type postDraft struct {
	authorID   int64
	postType   models.PostType
	title      string
	content    string
	linkURL    string
	location   string
	visibility string
	tags       []string
	mentions   []string
	media      []dto.MediaItem
	shop       *dto.ShopPostRequest
}

// CountWords is exported so the HTTP layer and tests share one definition.
func CountWords(text string) int { return len(strings.Fields(text)) }

func (d *postDraft) normalize() {
	d.title = strings.TrimSpace(d.title)
	d.content = strings.TrimSpace(d.content)
	d.linkURL = strings.TrimSpace(d.linkURL)
	d.location = strings.TrimSpace(d.location)
	d.visibility = strings.ToLower(strings.TrimSpace(d.visibility))
	if d.visibility == "" {
		d.visibility = "public"
	}
}

func (d *postDraft) validate() error {
	isShop := d.postType == models.PostTypeShop
	switch d.postType {
	case models.PostTypeText, models.PostTypeImage, models.PostTypeVideo, models.PostTypeLink, models.PostTypeShop:
	default:
		return errors.New("invalid post type")
	}

	if n := utf8.RuneCountInString(d.title); n < TitleMinChars || n > TitleMaxChars {
		return fmt.Errorf("title is required and must contain %d-%d characters", TitleMinChars, TitleMaxChars)
	}
	words := CountWords(d.content)
	if words > DescriptionMaxWords || len(d.content) > 64000 {
		return fmt.Errorf("description must contain at most %d words (currently %d)", DescriptionMaxWords, words)
	}
	if isShop {
		if words == 0 {
			return errors.New("product description is required")
		}
	} else if words < DescriptionMinWords {
		// Also covers link posts: a URL preview never replaces the description.
		return fmt.Errorf("description must contain at least %d words (currently %d)", DescriptionMinWords, words)
	}

	if d.visibility != "public" && d.visibility != "followers" {
		return errors.New("visibility must be public or followers")
	}
	if len(d.location) > 255 {
		return errors.New("location is too long")
	}

	maxTags := HashtagsMax
	if isShop {
		maxTags = ShopHashtagsMax
	}
	if len(d.tags) < HashtagsMin || len(d.tags) > maxTags {
		return fmt.Errorf("hashtags are required: use %d-%d unique hashtags (currently %d)", HashtagsMin, maxTags, len(d.tags))
	}
	for _, tag := range d.tags {
		if utf8.RuneCountInString(tag) > 63 {
			return fmt.Errorf("hashtag #%s is too long", tag)
		}
	}
	minMentions := MentionsMin
	if isShop {
		minMentions = 0
	}
	if len(d.mentions) < minMentions || len(d.mentions) > MentionsMax {
		return fmt.Errorf("mention %d-%d users with @username (currently %d)", minMentions, MentionsMax, len(d.mentions))
	}

	if d.postType == models.PostTypeLink {
		if len(d.linkURL) > 500 {
			return errors.New("link URL is too long")
		}
		parsed, err := url.ParseRequestURI(d.linkURL)
		if err != nil || (parsed.Scheme != "http" && parsed.Scheme != "https") || parsed.Hostname() == "" {
			return errors.New("link URL must be a valid HTTP or HTTPS URL")
		}
	}

	images, videos := 0, 0
	var video dto.MediaItem
	for _, item := range d.media {
		if item.Type == models.MediaTypeVideo {
			videos++
			video = item
		} else {
			images++
		}
	}
	switch d.postType {
	case models.PostTypeText, models.PostTypeLink:
		if images+videos > 0 {
			return fmt.Errorf("%s posts cannot contain media", d.postType)
		}
	case models.PostTypeImage:
		if videos > 0 || images < 1 || images > ImagesMax {
			return fmt.Errorf("image posts require 1-%d images", ImagesMax)
		}
	case models.PostTypeVideo:
		if videos != 1 || images > 0 {
			return errors.New("video posts require exactly one video")
		}
		if video.DurationSeconds <= 0 || video.DurationSeconds > storage.MaxVideoDurationSeconds {
			return errors.New("video must be at most 30 minutes long")
		}
	case models.PostTypeShop:
		if images < 1 || images > ImagesMax {
			return fmt.Errorf("shop posts require 1-%d product images", ImagesMax)
		}
		if videos > 1 {
			return errors.New("shop posts allow at most one video")
		}
		if videos == 1 && (video.DurationSeconds < ShopVideoMinSeconds || video.DurationSeconds > ShopVideoMaxSeconds) {
			return fmt.Errorf("product video must be %d-%d seconds long", ShopVideoMinSeconds, ShopVideoMaxSeconds)
		}
		return validateShop(d.shop)
	}
	return nil
}

var validCurrency = regexp.MustCompile(`^[A-Z]{3}$`)

var shopFulfillment = map[string]bool{"pickup": true, "cod": true, "shipping": true}

// normalizeFulfillment accepts a comma-separated subset of pickup, cod, and
// shipping (ambil langsung, COD, jasa ekspedisi).
func normalizeFulfillment(value string) (string, error) {
	seen := map[string]bool{}
	options := []string{}
	for _, option := range strings.Split(strings.ToLower(value), ",") {
		option = strings.TrimSpace(option)
		if option == "" || seen[option] {
			continue
		}
		if !shopFulfillment[option] {
			return "", errors.New("fulfillment must be pickup, cod, and/or shipping")
		}
		seen[option] = true
		options = append(options, option)
	}
	return strings.Join(options, ","), nil
}

func validateShop(shop *dto.ShopPostRequest) error {
	if shop == nil {
		return errors.New("shop details are required")
	}
	shop.Currency = strings.ToUpper(strings.TrimSpace(shop.Currency))
	shop.Category = strings.TrimSpace(shop.Category)
	shop.Condition = strings.ToLower(strings.TrimSpace(shop.Condition))
	if shop.PriceMinor <= 0 {
		return errors.New("price is required")
	}
	if !validCurrency.MatchString(shop.Currency) {
		return errors.New("currency must be an ISO 4217 code such as IDR or USD")
	}
	if shop.Category == "" || len(shop.Category) > 100 {
		return errors.New("product category is required")
	}
	if shop.Condition != "new" && shop.Condition != "used" {
		return errors.New("product condition must be new or used")
	}
	if shop.Stock != nil && *shop.Stock < 0 {
		return errors.New("stock cannot be negative")
	}
	if len(strings.TrimSpace(shop.Brand)) > 100 || len(shop.PaymentMethod) > 100 || len(shop.SellerAccountID) > 100 {
		return errors.New("shop field is too long")
	}
	fulfillment, err := normalizeFulfillment(shop.Fulfillment)
	if err != nil {
		return err
	}
	shop.Fulfillment = fulfillment
	return nil
}

// resolveMentions loads the mentioned users, rejecting unknown, inactive, or
// blocked accounts (a blocked user must not be reachable through mentions).
func checkSubscriptionQuota(userID int64, location string, existingPostID ...int64) error {
	if db.DB == nil {
		return nil
	}
	var author models.User
	if err := db.DB.First(&author, userID).Error; err != nil || author.Role == models.RoleAdmin {
		return nil
	}
	plan, ok := SubscriptionPlans[author.SubscriptionPlan]
	if !ok {
		plan = SubscriptionPlans["free"]
	}
	if location != "" && !plan.AllowLocation {
		return errors.New("fitur Location hanya tersedia pada paket berlangganan yang mencakup Location")
	}
	if len(existingPostID) > 0 {
		return nil
	}
	now := time.Now()
	startOfDay := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	var todayCount int64
	db.DB.Model(&models.Post{}).Where("user_id = ? AND created_at >= ?", userID, startOfDay).Count(&todayCount)
	if int(todayCount) >= plan.MaxPostsPerDay {
		return fmt.Errorf("kuota posting harian paket Anda (%dx postingan) telah habis; silakan upgrade paket di Pengaturan", plan.MaxPostsPerDay)
	}
	return nil
}

func resolveMentions(authorID int64, usernames []string) ([]models.User, error) {
	users := make([]models.User, 0, len(usernames))
	for _, username := range usernames {
		var user models.User
		if err := db.DB.Where("LOWER(username) = ? AND account_status = 'active'", username).First(&user).Error; err != nil || blockedEitherWay(authorID, user.ID) {
			return nil, fmt.Errorf("mentioned user @%s was not found", username)
		}
		users = append(users, user)
	}
	return users, nil
}

func blockedEitherWay(first, second int64) bool {
	var count int64
	db.DB.Model(&models.UserBlock{}).Where("(blocker_id = ? AND blocked_id = ?) OR (blocker_id = ? AND blocked_id = ?)", first, second, second, first).Count(&count)
	return count > 0
}

func buildMedia(items []dto.MediaItem) []models.PostMedia {
	media := make([]models.PostMedia, 0, len(items))
	for _, item := range items {
		status := "ready"
		if item.Type == models.MediaTypeVideo {
			status = "pending"
		}
		media = append(media, models.PostMedia{
			MediaType:        item.Type,
			MediaURL:         item.URL,
			DurationSeconds:  item.DurationSeconds,
			IsShort:          item.Type == models.MediaTypeVideo && item.DurationSeconds >= ShortMinSeconds && item.DurationSeconds <= ShortMaxSeconds,
			ProcessingStatus: status,
		})
	}
	return media
}

func buildShop(shop *dto.ShopPostRequest) *models.ShopProduct {
	return &models.ShopProduct{
		PriceMinor:      shop.PriceMinor,
		Currency:        shop.Currency,
		Category:        shop.Category,
		Condition:       shop.Condition,
		Stock:           shop.Stock,
		Brand:           optional(shop.Brand),
		Fulfillment:     shop.Fulfillment,
		PaymentMethod:   strings.TrimSpace(shop.PaymentMethod),
		SellerAccountID: optional(shop.SellerAccountID),
	}
}

func (s *postService) RecordUpload(userID int64, stored *storage.StoredMedia) error {
	return db.DB.Create(&models.MediaUpload{UserID: userID, URL: stored.URL, MediaType: models.MediaType(stored.Type), DurationSeconds: stored.DurationSeconds, SizeBytes: stored.SizeBytes}).Error
}

// ResolveMedia maps client-supplied URLs to the user's own upload records (or,
// when editing postID, to media already attached to that post — e.g. a
// transcoded video), preserving order and rejecting anything else.
func (s *postService) ResolveMedia(userID, postID int64, urls []string) ([]dto.MediaItem, error) {
	items := make([]dto.MediaItem, 0, len(urls))
	if len(urls) == 0 {
		return items, nil
	}
	if len(urls) > ImagesMax+1 {
		return nil, errors.New("too many media files")
	}
	var uploads []models.MediaUpload
	if err := db.DB.Where("user_id = ? AND url IN ?", userID, urls).Find(&uploads).Error; err != nil {
		return nil, err
	}
	byURL := make(map[string]models.MediaUpload, len(uploads))
	for _, upload := range uploads {
		byURL[upload.URL] = upload
	}
	if postID > 0 {
		var attached []models.PostMedia
		db.DB.Joins("JOIN posts ON posts.id = post_media.post_id").Where("post_media.post_id = ? AND posts.user_id = ? AND post_media.media_url IN ?", postID, userID, urls).Find(&attached)
		for _, media := range attached {
			byURL[media.MediaURL] = models.MediaUpload{URL: media.MediaURL, MediaType: media.MediaType, DurationSeconds: media.DurationSeconds}
		}
	}
	seen := map[string]bool{}
	for _, raw := range urls {
		upload, ok := byURL[raw]
		if !ok {
			return nil, errors.New("media must be uploaded through /media/upload first")
		}
		if seen[raw] {
			continue
		}
		seen[raw] = true
		items = append(items, dto.MediaItem{URL: upload.URL, Type: upload.MediaType, DurationSeconds: upload.DurationSeconds})
	}
	return items, nil
}

func (s *postService) CreatePost(userID int64, req *dto.CreatePostRequest) (*models.Post, error) {
	draft := postDraft{
		authorID:   userID,
		postType:   req.PostType,
		title:      req.Title,
		content:    req.Content,
		linkURL:    req.LinkURL,
		location:   req.Location,
		visibility: req.Visibility,
		media:      req.Media,
		shop:       req.Shop,
	}
	draft.normalize()
	draft.tags = normalizeHashtags(req.Hashtags, draft.content)
	draft.mentions = normalizeMentions(req.Mentions, draft.content)
	if err := draft.validate(); err != nil {
		return nil, err
	}
	mentionedUsers, err := resolveMentions(userID, draft.mentions)
	if err != nil {
		return nil, err
	}

	if err := checkSubscriptionQuota(userID, draft.location); err != nil {
		return nil, err
	}
	post := &models.Post{
		UserID:     userID,
		PostType:   draft.postType,
		Title:      &draft.title,
		Content:    &draft.content,
		Visibility: draft.visibility,
		Media:      buildMedia(draft.media),
	}
	if draft.location != "" {
		post.Location = &draft.location
	}
	for _, tag := range draft.tags {
		post.Hashtags = append(post.Hashtags, models.PostHashtag{Tag: tag})
	}
	for _, user := range mentionedUsers {
		post.Mentions = append(post.Mentions, models.PostMention{MentionedUserID: user.ID})
	}
	if draft.postType == models.PostTypeShop {
		post.Shop = buildShop(draft.shop)
	}
	// Persist the URL immediately; a bounded background job fills its metadata.
	if draft.postType == models.PostTypeLink {
		post.Link = &models.PostLink{URL: draft.linkURL, PreviewStatus: models.LinkPreviewPending}
	}

	if err := s.postRepo.Create(post); err != nil {
		return nil, err
	}
	if post.Link != nil {
		dispatchLinkPreview(post.Link)
	}
	dispatchTranscodes(post.Media)

	created, err := s.postRepo.GetByID(post.ID)
	if err == nil {
		createMentionNotifications(userID, post.ID, mentionedUsers, "You were mentioned in a post")
	}
	return created, err
}

// UpdatePost applies a partial edit, re-validating the resulting post with
// exactly the same rules as creation.
func (s *postService) UpdatePost(userID, postID int64, req *dto.UpdatePostRequest) (*models.Post, error) {
	var post models.Post
	if err := db.DB.Preload("Media").Preload("Link").Preload("Hashtags").Preload("Mentions.User").Preload("Shop").First(&post, postID).Error; err != nil {
		return nil, gorm.ErrRecordNotFound
	}
	if post.UserID != userID {
		return nil, ErrForbidden
	}
	if post.RepostOfID != nil {
		return nil, errors.New("reposts cannot be edited")
	}

	draft := postDraft{authorID: userID, postType: post.PostType, visibility: post.Visibility}
	if post.Title != nil {
		draft.title = *post.Title
	}
	if post.Content != nil {
		draft.content = *post.Content
	}
	if post.Location != nil {
		draft.location = *post.Location
	}
	if post.Link != nil {
		draft.linkURL = post.Link.URL
	}
	for _, media := range post.Media {
		draft.media = append(draft.media, dto.MediaItem{URL: media.MediaURL, Type: media.MediaType, DurationSeconds: media.DurationSeconds})
	}
	if post.Shop != nil {
		draft.shop = &dto.ShopPostRequest{PriceMinor: post.Shop.PriceMinor, Currency: post.Shop.Currency, Category: post.Shop.Category, Condition: post.Shop.Condition, Stock: post.Shop.Stock, Brand: valueOrEmpty(post.Shop.Brand), Fulfillment: post.Shop.Fulfillment, PaymentMethod: post.Shop.PaymentMethod, SellerAccountID: valueOrEmpty(post.Shop.SellerAccountID)}
	}
	existingTags := make([]string, 0, len(post.Hashtags))
	for _, tag := range post.Hashtags {
		existingTags = append(existingTags, tag.Tag)
	}
	existingMentions := make([]string, 0, len(post.Mentions))
	previouslyMentioned := map[int64]bool{}
	for _, mention := range post.Mentions {
		previouslyMentioned[mention.MentionedUserID] = true
		if mention.User.Username != nil {
			existingMentions = append(existingMentions, *mention.User.Username)
		}
	}

	if req.Title != nil {
		draft.title = *req.Title
	}
	if req.Content != nil {
		draft.content = *req.Content
	}
	if req.Location != nil {
		draft.location = *req.Location
	}
	if req.Visibility != nil {
		draft.visibility = *req.Visibility
	}
	linkChanged := false
	if req.LinkURL != nil && strings.TrimSpace(*req.LinkURL) != draft.linkURL {
		draft.linkURL = *req.LinkURL
		linkChanged = true
	}
	mediaChanged := req.MediaURLs != nil
	if mediaChanged {
		draft.media = req.Media
	}
	if req.Shop != nil {
		if post.PostType != models.PostTypeShop {
			return nil, errors.New("only shop posts have shop details")
		}
		draft.shop = req.Shop
	}
	draft.normalize()
	explicitTags := existingTags
	if req.Hashtags != nil {
		explicitTags = req.Hashtags
	}
	explicitMentions := existingMentions
	if req.Mentions != nil {
		explicitMentions = req.Mentions
	}
	draft.tags = normalizeHashtags(explicitTags, draft.content)
	draft.mentions = normalizeMentions(explicitMentions, draft.content)
	if err := draft.validate(); err != nil {
		return nil, err
	}
	mentionedUsers, err := resolveMentions(userID, draft.mentions)
	if err != nil {
		return nil, err
	}

	if err := checkSubscriptionQuota(userID, draft.location, postID); err != nil {
		return nil, err
	}
	var newLink *models.PostLink
	var newMedia []models.PostMedia
	err = db.DB.Transaction(func(tx *gorm.DB) error {
		updates := map[string]any{"title": draft.title, "content": draft.content, "visibility": draft.visibility, "location": nil}
		if draft.location != "" {
			updates["location"] = draft.location
		}
		if err := tx.Model(&models.Post{}).Where("id = ?", postID).Updates(updates).Error; err != nil {
			return err
		}
		if err := tx.Where("post_id = ?", postID).Delete(&models.PostHashtag{}).Error; err != nil {
			return err
		}
		for _, tag := range draft.tags {
			if err := tx.Create(&models.PostHashtag{PostID: postID, Tag: tag}).Error; err != nil {
				return err
			}
		}
		if err := tx.Where("post_id = ?", postID).Delete(&models.PostMention{}).Error; err != nil {
			return err
		}
		for _, user := range mentionedUsers {
			if err := tx.Create(&models.PostMention{PostID: postID, MentionedUserID: user.ID}).Error; err != nil {
				return err
			}
		}
		if mediaChanged {
			// Keep rows (and transcode results) for media that stays attached.
			kept := map[string]bool{}
			for _, item := range draft.media {
				kept[item.URL] = true
			}
			current := map[string]bool{}
			for _, media := range post.Media {
				current[media.MediaURL] = true
				if !kept[media.MediaURL] {
					if err := tx.Delete(&models.PostMedia{}, media.ID).Error; err != nil {
						return err
					}
				}
			}
			for _, media := range buildMedia(draft.media) {
				if current[media.MediaURL] {
					continue
				}
				media.PostID = postID
				if err := tx.Create(&media).Error; err != nil {
					return err
				}
				newMedia = append(newMedia, media)
			}
		}
		if linkChanged && post.PostType == models.PostTypeLink {
			if err := tx.Where("post_id = ?", postID).Delete(&models.PostLink{}).Error; err != nil {
				return err
			}
			newLink = &models.PostLink{PostID: postID, URL: draft.linkURL, PreviewStatus: models.LinkPreviewPending}
			if err := tx.Create(newLink).Error; err != nil {
				return err
			}
		}
		if req.Shop != nil {
			shop := buildShop(draft.shop)
			return tx.Model(&models.ShopProduct{}).Where("post_id = ?", postID).Updates(map[string]any{
				"price_minor": shop.PriceMinor, "currency": shop.Currency, "category": shop.Category,
				"condition": shop.Condition, "stock": shop.Stock, "brand": shop.Brand,
				"fulfillment": shop.Fulfillment, "payment_method": shop.PaymentMethod, "seller_account_id": shop.SellerAccountID,
			}).Error
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	if newLink != nil {
		dispatchLinkPreview(newLink)
	}
	dispatchTranscodes(newMedia)
	newlyMentioned := make([]models.User, 0, len(mentionedUsers))
	for _, user := range mentionedUsers {
		if !previouslyMentioned[user.ID] {
			newlyMentioned = append(newlyMentioned, user)
		}
	}
	createMentionNotifications(userID, postID, newlyMentioned, "You were mentioned in a post")
	return s.postRepo.GetByID(postID)
}

func dispatchLinkPreview(link *models.PostLink) {
	if err := enqueueLinkPreview(link.ID); err != nil {
		log.Printf("link preview queue rejected link %d: %v", link.ID, err)
		_ = db.DB.Model(link).Updates(map[string]any{
			"preview_status": models.LinkPreviewFailed,
			"preview_error":  "preview queue is temporarily unavailable",
		}).Error
	}
}

func dispatchTranscodes(media []models.PostMedia) {
	for _, item := range media {
		if item.MediaType != models.MediaTypeVideo {
			continue
		}
		if err := facades.Queue().Job(&jobs.TranscodePostMedia{}, []queue.Arg{{Value: item.ID, Type: "int64"}}).Dispatch(); err != nil {
			_ = db.DB.Model(&models.PostMedia{}).Where("id = ?", item.ID).Update("processing_status", "failed").Error
		}
	}
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

// MentionedUsernames extracts unique @usernames from free text (comments).
func MentionedUsernames(content string) []string {
	return normalizeMentions(nil, content)
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

func createMentionNotifications(actorID, postID int64, users []models.User, message string) {
	for _, user := range users {
		if user.ID != actorID {
			entityID := postID
			actor := actorID
			_ = db.DB.Create(&models.Notification{UserID: user.ID, ActorID: &actor, Type: "mention", EntityType: "post", EntityID: &entityID, Message: message}).Error
		}
	}
}

// NotifyCommentMentions notifies users @mentioned in a comment or reply.
// Unknown or blocked usernames are ignored rather than failing the comment.
func NotifyCommentMentions(actorID, postID int64, content string) {
	usernames := MentionedUsernames(content)
	if len(usernames) > MentionsMax {
		usernames = usernames[:MentionsMax]
	}
	users := make([]models.User, 0, len(usernames))
	for _, username := range usernames {
		if resolved, err := resolveMentions(actorID, []string{username}); err == nil {
			users = append(users, resolved...)
		}
	}
	createMentionNotifications(actorID, postID, users, "You were mentioned in a comment")
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

func (s *postService) GetFeed(viewerID int64, limit, offset int, beforeID int64, shortsOnly bool, kind ...string) ([]models.Post, error) {
	return s.postRepo.ListAll(viewerID, limit, offset, beforeID, shortsOnly, kind...)
}

func (s *postService) GetPost(viewerID, postID int64) (*models.Post, error) {
	return s.postRepo.GetForViewer(viewerID, postID)
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
		return ErrForbidden
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
		NotifyCommentMentions(userID, postID, content)
	}
	return comment, err
}
