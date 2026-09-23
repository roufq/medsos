package controllers

import (
	"errors"
	"fmt"
	"html"
	"sort"
	"strconv"
	"strings"
	"time"
	"unicode/utf8"

	"goravel/app/models"
	"goravel/pkg/db"

	goravelhttp "github.com/goravel/framework/contracts/http"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type SocialController struct{}

func NewSocialController() *SocialController { return &SocialController{} }

func blockedBetween(first, second int64) bool {
	var count int64
	db.DB.Model(&models.UserBlock{}).Where("(blocker_id = ? AND blocked_id = ?) OR (blocker_id = ? AND blocked_id = ?)", first, second, second, first).Count(&count)
	return count > 0
}

func acceptedFollower(followerID, followedID int64) bool {
	var count int64
	db.DB.Model(&models.Follow{}).Where("follower_id = ? AND followed_id = ? AND status = 'accepted'", followerID, followedID).Count(&count)
	return count > 0
}

// blockedBetweenBatch resolves, in one query, which of otherIDs have a block
// relationship (either direction) with userID.
func blockedBetweenBatch(userID int64, otherIDs []int64) map[int64]bool {
	blocked := make(map[int64]bool, len(otherIDs))
	if userID == 0 || len(otherIDs) == 0 {
		return blocked
	}
	var blocks []models.UserBlock
	db.DB.Where("(blocker_id = ? AND blocked_id IN ?) OR (blocked_id = ? AND blocker_id IN ?)", userID, otherIDs, userID, otherIDs).Find(&blocks)
	for _, b := range blocks {
		if b.BlockerID == userID {
			blocked[b.BlockedID] = true
		} else {
			blocked[b.BlockerID] = true
		}
	}
	return blocked
}

// acceptedFollowingBatch resolves, in one query, which of followedIDs followerID
// accepted-follows.
func acceptedFollowingBatch(followerID int64, followedIDs []int64) map[int64]bool {
	following := make(map[int64]bool, len(followedIDs))
	if followerID == 0 || len(followedIDs) == 0 {
		return following
	}
	var follows []models.Follow
	db.DB.Where("follower_id = ? AND followed_id IN ? AND status = 'accepted'", followerID, followedIDs).Find(&follows)
	for _, f := range follows {
		following[f.FollowedID] = true
	}
	return following
}

// canViewPreloadedPost mirrors canViewPost but reuses an already-preloaded
// post.User and batched block/follow maps instead of issuing new queries per post.
func canViewPreloadedPost(viewerID int64, post *models.Post, blocked, following map[int64]bool) bool {
	if post.User.ID == 0 || post.User.AccountStatus != "active" {
		return false
	}
	if viewerID > 0 && blocked[post.UserID] {
		return false
	}
	if viewerID == post.UserID {
		return true
	}
	if post.User.IsPrivate || post.Visibility == "followers" {
		return viewerID > 0 && following[post.UserID]
	}
	return post.Visibility == "public" || post.Visibility == ""
}

func canViewPost(viewerID int64, post *models.Post) bool {
	var author models.User
	if db.DB.First(&author, post.UserID).Error != nil || author.AccountStatus != "active" {
		return false
	}
	if viewerID > 0 && blockedBetween(viewerID, post.UserID) {
		return false
	}
	if viewerID == post.UserID {
		return true
	}
	if author.IsPrivate || post.Visibility == "followers" {
		return viewerID > 0 && acceptedFollower(viewerID, post.UserID)
	}
	return post.Visibility == "public" || post.Visibility == ""
}

func notifyUser(userID, actorID int64, kind, entityType string, entityID int64, message string) {
	if userID == actorID {
		return
	}
	actor, entity := actorID, entityID
	_ = db.DB.Create(&models.Notification{UserID: userID, ActorID: &actor, Type: kind, EntityType: entityType, EntityID: &entity, Message: message}).Error
}

var (
	errFollowBlocked  = errors.New("follow is not allowed")
	errFollowNotFound = errors.New("user not found")
)

// followUser centralizes the follow-request logic shared by the legacy
// /users/{id}/follow endpoint (SocialController.Follow) and the
// /network/request endpoint (NetworkController.SendRequest): the blocked
// check, target lookup, private/pending-vs-accepted decision, and the
// same-status dedup used to decide whether to send a notification. Keeping
// this in one place means a future change to follow semantics only needs to
// happen once.
func followUser(followerID, followedID int64) (status string, isNew bool, err error) {
	if blockedBetween(followerID, followedID) {
		return "", false, errFollowBlocked
	}
	var target models.User
	if db.DB.First(&target, followedID).Error != nil || target.AccountStatus != "active" {
		return "", false, errFollowNotFound
	}
	status = "accepted"
	if target.IsPrivate {
		status = "pending"
	}
	var existing models.Follow
	hadSameStatus := db.DB.Where("follower_id = ? AND followed_id = ? AND status = ?", followerID, followedID, status).First(&existing).Error == nil
	follow := models.Follow{FollowerID: followerID, FollowedID: followedID, Status: status}
	if err := db.DB.Clauses(clause.OnConflict{Columns: []clause.Column{{Name: "follower_id"}, {Name: "followed_id"}}, DoUpdates: clause.AssignmentColumns([]string{"status"})}).Create(&follow).Error; err != nil {
		return "", false, err
	}
	return status, !hadSameStatus, nil
}

func notifyFollow(followedID, followerID int64, status string) {
	message := "Someone followed you"
	if status == "pending" {
		message = "Someone requested to follow you"
	}
	notifyUser(followedID, followerID, "follow", "user", followerID, message)
}

func (h *SocialController) Follow(c goravelhttp.Context) goravelhttp.Response {
	followerID, err := authenticatedUserID(c)
	if err != nil {
		return c.Response().Json(401, goravelhttp.Json{"error": "Unauthorized"})
	}
	followedID, err := routeID(c, "id")
	if err != nil || followedID == followerID {
		return c.Response().Json(400, goravelhttp.Json{"error": "invalid user"})
	}
	status, isNew, err := followUser(followerID, followedID)
	switch {
	case errors.Is(err, errFollowBlocked):
		return c.Response().Json(403, goravelhttp.Json{"error": "follow is not allowed"})
	case errors.Is(err, errFollowNotFound):
		return c.Response().Json(404, goravelhttp.Json{"error": "user not found"})
	case err != nil:
		return c.Response().Json(500, goravelhttp.Json{"error": "failed to follow user"})
	}
	if isNew {
		notifyFollow(followedID, followerID, status)
	}
	return c.Response().Json(200, goravelhttp.Json{"status": status})
}

func (h *SocialController) Unfollow(c goravelhttp.Context) goravelhttp.Response {
	followerID, err := authenticatedUserID(c)
	if err != nil {
		return c.Response().Json(401, goravelhttp.Json{"error": "Unauthorized"})
	}
	followedID, err := routeID(c, "id")
	if err != nil {
		return c.Response().Json(400, goravelhttp.Json{"error": "invalid user"})
	}
	db.DB.Where("follower_id = ? AND followed_id = ?", followerID, followedID).Delete(&models.Follow{})
	return c.Response().Json(200, goravelhttp.Json{"message": "unfollowed"})
}

func (h *SocialController) Followers(c goravelhttp.Context) goravelhttp.Response {
	viewerID, err := authenticatedUserID(c)
	if err != nil {
		return c.Response().Json(401, goravelhttp.Json{"error": "Unauthorized"})
	}
	targetID, err := routeID(c, "id")
	if err != nil {
		return c.Response().Json(400, goravelhttp.Json{"error": "invalid user"})
	}
	return h.followList(c, viewerID, targetID, true)
}

func (h *SocialController) Following(c goravelhttp.Context) goravelhttp.Response {
	viewerID, err := authenticatedUserID(c)
	if err != nil {
		return c.Response().Json(401, goravelhttp.Json{"error": "Unauthorized"})
	}
	targetID, err := routeID(c, "id")
	if err != nil {
		return c.Response().Json(400, goravelhttp.Json{"error": "invalid user"})
	}
	return h.followList(c, viewerID, targetID, false)
}

func (h *SocialController) followList(c goravelhttp.Context, viewerID, targetID int64, followers bool) goravelhttp.Response {
	var target models.User
	if db.DB.First(&target, targetID).Error != nil {
		return c.Response().Json(404, goravelhttp.Json{"error": "user not found"})
	}
	if blockedBetween(viewerID, targetID) || (target.IsPrivate && viewerID != targetID && !acceptedFollower(viewerID, targetID)) {
		return c.Response().Json(403, goravelhttp.Json{"error": "profile is private"})
	}
	term := strings.TrimSpace(c.Request().Query("q", ""))
	var users []models.User
	query := db.DB.Table("users").Where("users.account_status = 'active'")
	if followers {
		query = query.Joins("JOIN follows ON follows.follower_id = users.id").Where("follows.followed_id = ? AND follows.status = 'accepted'", targetID)
	} else {
		query = query.Joins("JOIN follows ON follows.followed_id = users.id").Where("follows.follower_id = ? AND follows.status = 'accepted'", targetID)
	}
	if term != "" {
		like := "%" + term + "%"
		query = query.Where("users.name LIKE ? OR users.username LIKE ?", like, like)
	}
	if err := query.Order("users.name").Limit(100).Scan(&users).Error; err != nil {
		return c.Response().Json(500, goravelhttp.Json{"error": "failed to load users"})
	}
	return c.Response().Json(200, publicUsers(users))
}

func publicUsers(users []models.User) []models.User {
	for i := range users {
		users[i].HidePrivateData()
	}
	return users
}

func (h *SocialController) ToggleSave(c goravelhttp.Context) goravelhttp.Response {
	userID, err := authenticatedUserID(c)
	if err != nil {
		return c.Response().Json(401, goravelhttp.Json{"error": "Unauthorized"})
	}
	postID, err := routeID(c, "id")
	if err != nil {
		return c.Response().Json(400, goravelhttp.Json{"error": "invalid post"})
	}
	var post models.Post
	if db.DB.First(&post, postID).Error != nil || !canViewPost(userID, &post) {
		return c.Response().Json(404, goravelhttp.Json{"error": "post not found"})
	}
	var saved models.SavedPost
	if db.DB.Where("user_id = ? AND post_id = ?", userID, postID).First(&saved).Error == nil {
		db.DB.Delete(&saved)
		return c.Response().Json(200, goravelhttp.Json{"saved": false})
	}
	if err := db.DB.Create(&models.SavedPost{UserID: userID, PostID: postID}).Error; err != nil {
		return c.Response().Json(500, goravelhttp.Json{"error": "failed to save post"})
	}
	return c.Response().Json(200, goravelhttp.Json{"saved": true})
}

func (h *SocialController) SavedPosts(c goravelhttp.Context) goravelhttp.Response {
	userID, err := authenticatedUserID(c)
	if err != nil {
		return c.Response().Json(401, goravelhttp.Json{"error": "Unauthorized"})
	}
	var posts []models.Post
	err = db.DB.Model(&models.Post{}).Joins("JOIN saved_posts ON saved_posts.post_id = posts.id").Where("saved_posts.user_id = ?", userID).Preload("User").Preload("Media").Preload("Link").Preload("Hashtags").Preload("Shop").Order("saved_posts.id desc").Limit(100).Find(&posts).Error
	if err != nil {
		return c.Response().Json(500, goravelhttp.Json{"error": "failed to load saved posts"})
	}
	authorIDs := make([]int64, len(posts))
	for i := range posts {
		authorIDs[i] = posts[i].UserID
	}
	blocked := blockedBetweenBatch(userID, authorIDs)
	following := acceptedFollowingBatch(userID, authorIDs)
	visible := posts[:0]
	for i := range posts {
		if canViewPreloadedPost(userID, &posts[i], blocked, following) {
			posts[i].User.HidePrivateData()
			visible = append(visible, posts[i])
		}
	}
	return c.Response().Json(200, visible)
}

func (h *SocialController) Repost(c goravelhttp.Context) goravelhttp.Response {
	userID, err := authenticatedUserID(c)
	if err != nil {
		return c.Response().Json(401, goravelhttp.Json{"error": "Unauthorized"})
	}
	originalID, err := routeID(c, "id")
	if err != nil {
		return c.Response().Json(400, goravelhttp.Json{"error": "invalid post"})
	}
	var original models.Post
	if db.DB.First(&original, originalID).Error != nil || !canViewPost(userID, &original) {
		return c.Response().Json(404, goravelhttp.Json{"error": "post not found"})
	}
	var input struct {
		Commentary string `json:"commentary"`
	}
	_ = c.Request().Bind(&input)
	commentary := strings.TrimSpace(input.Commentary)
	if len(commentary) > 2000 {
		return c.Response().Json(400, goravelhttp.Json{"error": "commentary is too long"})
	}
	title := "Repost"
	if original.Title != nil {
		title = "Repost: " + *original.Title
		if utf8.RuneCountInString(title) > 100 {
			title = string([]rune(title)[:100])
		}
	}
	repost := models.Post{UserID: userID, Title: &title, Content: &commentary, PostType: original.PostType, Visibility: "public", RepostOfID: &originalID}
	if err := db.DB.Create(&repost).Error; err != nil {
		return c.Response().Json(500, goravelhttp.Json{"error": "failed to repost"})
	}
	notifyUser(original.UserID, userID, "repost", "post", originalID, "Someone reposted your post")
	db.DB.Preload("User").Preload("OriginalPost.User").Preload("OriginalPost.Media").First(&repost, repost.ID)
	repost.User.HidePrivateData()
	if repost.OriginalPost != nil {
		repost.OriginalPost.User.HidePrivateData()
	}
	return c.Response().Json(201, repost)
}

func (h *SocialController) EditPost(c goravelhttp.Context) goravelhttp.Response {
	userID, err := authenticatedUserID(c)
	if err != nil {
		return c.Response().Json(401, goravelhttp.Json{"error": "Unauthorized"})
	}
	postID, err := routeID(c, "id")
	if err != nil {
		return c.Response().Json(400, goravelhttp.Json{"error": "invalid post"})
	}
	var post models.Post
	if db.DB.First(&post, postID).Error != nil {
		return c.Response().Json(404, goravelhttp.Json{"error": "post not found"})
	}
	if post.UserID != userID {
		return c.Response().Json(403, goravelhttp.Json{"error": "forbidden"})
	}
	var input struct {
		Title      *string  `json:"title"`
		Content    *string  `json:"content"`
		Location   *string  `json:"location"`
		Visibility *string  `json:"visibility"`
		Hashtags   []string `json:"hashtags"`
		Mentions   []string `json:"mentions"`
	}
	if c.Request().Bind(&input) != nil {
		return c.Response().Json(400, goravelhttp.Json{"error": "invalid request"})
	}
	updates := map[string]any{}
	if input.Title != nil {
		title := strings.TrimSpace(*input.Title)
		if utf8.RuneCountInString(title) < 5 || utf8.RuneCountInString(title) > 100 {
			return c.Response().Json(400, goravelhttp.Json{"error": "title must contain 5-100 characters"})
		}
		updates["title"] = title
	}
	if input.Content != nil {
		content := strings.TrimSpace(*input.Content)
		words := len(strings.Fields(content))
		if words > 6000 {
			return c.Response().Json(400, goravelhttp.Json{"error": "description must contain at most 6000 words"})
		}
		updates["content"] = content
	}
	if input.Location != nil {
		location := strings.TrimSpace(*input.Location)
		if len(location) > 255 {
			return c.Response().Json(400, goravelhttp.Json{"error": "location is too long"})
		}
		updates["location"] = nullableString(location)
	}
	if input.Visibility != nil {
		visibility := strings.ToLower(*input.Visibility)
		if visibility != "public" && visibility != "followers" {
			return c.Response().Json(400, goravelhttp.Json{"error": "invalid visibility"})
		}
		updates["visibility"] = visibility
	}
	err = db.DB.Transaction(func(tx *gorm.DB) error {
		if len(updates) > 0 {
			if err := tx.Model(&post).Updates(updates).Error; err != nil {
				return err
			}
		}
		if input.Hashtags != nil {
			tags := uniqueTokens(input.Hashtags, "#", 64)
			max := 9
			if post.PostType == models.PostTypeShop {
				max = 30
			}
			if len(tags) > max {
				return fmt.Errorf("post allows at most %d hashtags", max)
			}
			if err := tx.Where("post_id = ?", postID).Delete(&models.PostHashtag{}).Error; err != nil {
				return err
			}
			for _, tag := range tags {
				if err := tx.Create(&models.PostHashtag{PostID: postID, Tag: tag}).Error; err != nil {
					return err
				}
			}
		}
		if input.Mentions != nil {
			usernames := uniqueTokens(input.Mentions, "@", 40)
			if len(usernames) > 10 {
				return fmt.Errorf("post allows at most 10 mentions")
			}
			if err := tx.Where("post_id = ?", postID).Delete(&models.PostMention{}).Error; err != nil {
				return err
			}
			for _, username := range usernames {
				var user models.User
				if err := tx.Where("LOWER(username) = ?", username).First(&user).Error; err != nil {
					return fmt.Errorf("mentioned user @%s was not found", username)
				}
				if err := tx.Create(&models.PostMention{PostID: postID, MentionedUserID: user.ID}).Error; err != nil {
					return err
				}
			}
		}
		return nil
	})
	if err != nil {
		return c.Response().Json(400, goravelhttp.Json{"error": err.Error()})
	}
	db.DB.Preload("User").Preload("Media").Preload("Link").Preload("Hashtags").Preload("Mentions.User").Preload("Shop").First(&post, postID)
	post.User.HidePrivateData()
	for i := range post.Mentions {
		post.Mentions[i].User.HidePrivateData()
	}
	return c.Response().Json(200, post)
}

func uniqueTokens(values []string, prefix string, maximum int) []string {
	seen := map[string]bool{}
	result := []string{}
	for _, value := range values {
		value = strings.ToLower(strings.Trim(strings.TrimSpace(value), prefix))
		if value != "" && len(value) <= maximum && !seen[value] {
			seen[value] = true
			result = append(result, value)
		}
	}
	sort.Strings(result)
	return result
}

func (h *SocialController) Comments(c goravelhttp.Context) goravelhttp.Response {
	userID, err := authenticatedUserID(c)
	if err != nil {
		return c.Response().Json(401, goravelhttp.Json{"error": "Unauthorized"})
	}
	postID, err := routeID(c, "id")
	if err != nil {
		return c.Response().Json(400, goravelhttp.Json{"error": "invalid post"})
	}
	var post models.Post
	if db.DB.First(&post, postID).Error != nil || !canViewPost(userID, &post) {
		return c.Response().Json(404, goravelhttp.Json{"error": "post not found"})
	}
	limit, limitErr := strconv.Atoi(c.Request().Query("limit", "50"))
	beforeID, beforeErr := strconv.ParseInt(c.Request().Query("before_id", "0"), 10, 64)
	if limitErr != nil || limit < 1 || limit > 100 || beforeErr != nil || beforeID < 0 {
		return c.Response().Json(400, goravelhttp.Json{"error": "limit must be 1-100 and before_id must be a positive ID"})
	}
	comments := make([]models.PostComment, 0)
	query := db.DB.Where("post_id = ? AND parent_id IS NULL", postID)
	if beforeID > 0 {
		query = query.Where("id < ?", beforeID)
	}
	if err := query.Preload("User").Preload("Replies", func(tx *gorm.DB) *gorm.DB { return tx.Order("id").Limit(50) }).Preload("Replies.User").Order("id desc").Limit(limit).Find(&comments).Error; err != nil {
		return c.Response().Json(500, goravelhttp.Json{"error": "failed to load comments"})
	}
	// Query is `id desc` so before_id cursoring walks backward in time, but
	// replies are preloaded oldest-first - reverse to chronological order here
	// so top-level comments and their replies read consistently.
	for left, right := 0, len(comments)-1; left < right; left, right = left+1, right-1 {
		comments[left], comments[right] = comments[right], comments[left]
	}
	hasMore := len(comments) == limit
	for i := range comments {
		if comments[i].User != nil {
			comments[i].User.HidePrivateData()
		}
		for j := range comments[i].Replies {
			if comments[i].Replies[j].User != nil {
				comments[i].Replies[j].User.HidePrivateData()
			}
		}
	}
	return c.Response().Json(200, goravelhttp.Json{"comments": comments, "has_more": hasMore})
}

func (h *SocialController) ReplyComment(c goravelhttp.Context) goravelhttp.Response {
	userID, err := authenticatedUserID(c)
	if err != nil {
		return c.Response().Json(401, goravelhttp.Json{"error": "Unauthorized"})
	}
	postID, err := routeID(c, "id")
	if err != nil {
		return c.Response().Json(400, goravelhttp.Json{"error": "invalid post"})
	}
	var input struct {
		Content  string `json:"content"`
		ParentID int64  `json:"parent_id"`
	}
	if c.Request().Bind(&input) != nil || strings.TrimSpace(input.Content) == "" || len(input.Content) > 5000 {
		return c.Response().Json(400, goravelhttp.Json{"error": "content and parent_id are required"})
	}
	var post models.Post
	if db.DB.First(&post, postID).Error != nil || !canViewPost(userID, &post) {
		return c.Response().Json(404, goravelhttp.Json{"error": "post not found"})
	}
	var parent models.PostComment
	if db.DB.Where("id = ? AND post_id = ?", input.ParentID, postID).First(&parent).Error != nil {
		return c.Response().Json(404, goravelhttp.Json{"error": "parent comment not found"})
	}
	comment := models.PostComment{PostID: postID, UserID: userID, ParentID: &parent.ID, Content: strings.TrimSpace(input.Content)}
	if db.DB.Create(&comment).Error != nil {
		return c.Response().Json(500, goravelhttp.Json{"error": "failed to reply"})
	}
	notifyUser(parent.UserID, userID, "comment_reply", "comment", parent.ID, "Someone replied to your comment")
	db.DB.Preload("User").First(&comment, comment.ID)
	if comment.User != nil {
		comment.User.HidePrivateData()
	}
	return c.Response().Json(201, comment)
}

func (h *SocialController) EditComment(c goravelhttp.Context) goravelhttp.Response {
	userID, err := authenticatedUserID(c)
	if err != nil {
		return c.Response().Json(401, goravelhttp.Json{"error": "Unauthorized"})
	}
	commentID, err := routeID(c, "id")
	if err != nil {
		return c.Response().Json(400, goravelhttp.Json{"error": "invalid comment"})
	}
	var input struct {
		Content string `json:"content"`
	}
	if c.Request().Bind(&input) != nil || strings.TrimSpace(input.Content) == "" || len(input.Content) > 5000 {
		return c.Response().Json(400, goravelhttp.Json{"error": "content must contain 1-5000 characters"})
	}
	result := db.DB.Model(&models.PostComment{}).Where("id = ? AND user_id = ?", commentID, userID).Update("content", strings.TrimSpace(input.Content))
	if result.RowsAffected == 0 {
		return c.Response().Json(404, goravelhttp.Json{"error": "comment not found"})
	}
	return c.Response().Json(200, goravelhttp.Json{"message": "comment updated"})
}

func (h *SocialController) DeleteComment(c goravelhttp.Context) goravelhttp.Response {
	userID, err := authenticatedUserID(c)
	if err != nil {
		return c.Response().Json(401, goravelhttp.Json{"error": "Unauthorized"})
	}
	commentID, err := routeID(c, "id")
	if err != nil {
		return c.Response().Json(400, goravelhttp.Json{"error": "invalid comment"})
	}
	var comment models.PostComment
	if db.DB.First(&comment, commentID).Error != nil {
		return c.Response().Json(404, goravelhttp.Json{"error": "comment not found"})
	}
	var post models.Post
	db.DB.First(&post, comment.PostID)
	if comment.UserID != userID && post.UserID != userID {
		return c.Response().Json(403, goravelhttp.Json{"error": "forbidden"})
	}
	db.DB.Delete(&comment)
	return c.Response().Json(200, goravelhttp.Json{"message": "comment deleted"})
}

var shareChannels = map[string]bool{"message": true, "facebook": true, "x": true, "threads": true, "linkedin": true, "instagram": true, "telegram": true, "tiktok": true, "whatsapp": true, "pinterest": true, "copy": true}

func (h *SocialController) Share(c goravelhttp.Context) goravelhttp.Response {
	userID, err := authenticatedUserID(c)
	if err != nil {
		return c.Response().Json(401, goravelhttp.Json{"error": "Unauthorized"})
	}
	postID, err := routeID(c, "id")
	if err != nil {
		return c.Response().Json(400, goravelhttp.Json{"error": "invalid post"})
	}
	var input struct {
		Channel string `json:"channel"`
	}
	_ = c.Request().Bind(&input)
	input.Channel = strings.ToLower(input.Channel)
	if !shareChannels[input.Channel] {
		return c.Response().Json(400, goravelhttp.Json{"error": "unsupported share channel"})
	}
	var post models.Post
	if db.DB.First(&post, postID).Error != nil || !canViewPost(userID, &post) {
		return c.Response().Json(404, goravelhttp.Json{"error": "post not found"})
	}
	db.DB.Create(&models.PostShare{PostID: postID, UserID: userID, Channel: input.Channel})
	notifyUser(post.UserID, userID, "share", "post", postID, "Someone shared your post")
	return c.Response().Json(200, goravelhttp.Json{"share_url": fmt.Sprintf("/post/%d", postID), "channel": input.Channel})
}

func (h *SocialController) Report(c goravelhttp.Context) goravelhttp.Response {
	userID, err := authenticatedUserID(c)
	if err != nil {
		return c.Response().Json(401, goravelhttp.Json{"error": "Unauthorized"})
	}
	postID, err := routeID(c, "id")
	if err != nil {
		return c.Response().Json(400, goravelhttp.Json{"error": "invalid post"})
	}
	var input struct {
		Reason  string `json:"reason"`
		Details string `json:"details"`
	}
	if c.Request().Bind(&input) != nil || strings.TrimSpace(input.Reason) == "" || len(input.Reason) > 100 || len(input.Details) > 5000 {
		return c.Response().Json(400, goravelhttp.Json{"error": "valid reason is required"})
	}
	report := models.PostReport{PostID: postID, ReporterID: userID, Reason: strings.TrimSpace(input.Reason), Details: strings.TrimSpace(input.Details), Status: "pending"}
	if err := db.DB.Create(&report).Error; err != nil {
		return c.Response().Json(409, goravelhttp.Json{"error": "post was already reported"})
	}
	return c.Response().Json(201, report)
}

func (h *SocialController) RecordView(c goravelhttp.Context) goravelhttp.Response {
	userID, err := authenticatedUserID(c)
	if err != nil {
		return c.Response().Json(401, goravelhttp.Json{"error": "Unauthorized"})
	}
	postID, err := routeID(c, "id")
	if err != nil {
		return c.Response().Json(400, goravelhttp.Json{"error": "invalid post"})
	}
	var post models.Post
	if db.DB.First(&post, postID).Error != nil || !canViewPost(userID, &post) {
		return c.Response().Json(404, goravelhttp.Json{"error": "post not found"})
	}
	db.DB.Clauses(clause.OnConflict{DoNothing: true}).Create(&models.PostView{PostID: postID, UserID: userID})
	var count int64
	db.DB.Model(&models.PostView{}).Where("post_id = ?", postID).Count(&count)
	return c.Response().Json(200, goravelhttp.Json{"views_count": count})
}

func (h *SocialController) Notifications(c goravelhttp.Context) goravelhttp.Response {
	userID, err := authenticatedUserID(c)
	if err != nil {
		return c.Response().Json(401, goravelhttp.Json{"error": "Unauthorized"})
	}
	items := make([]models.Notification, 0)
	if err := db.DB.Where("user_id = ?", userID).Preload("Actor").Order("created_at desc").Limit(50).Find(&items).Error; err != nil {
		return c.Response().Json(500, goravelhttp.Json{"error": "failed to load notifications"})
	}
	for i := range items {
		if items[i].Actor != nil {
			items[i].Actor.HidePrivateData()
		}
	}
	return c.Response().Json(200, items)
}

func (h *SocialController) ReadNotification(c goravelhttp.Context) goravelhttp.Response {
	userID, err := authenticatedUserID(c)
	if err != nil {
		return c.Response().Json(401, goravelhttp.Json{"error": "Unauthorized"})
	}
	id, err := routeID(c, "id")
	if err != nil {
		return c.Response().Json(400, goravelhttp.Json{"error": "invalid notification"})
	}
	now := time.Now()
	result := db.DB.Model(&models.Notification{}).Where("id = ? AND user_id = ?", id, userID).Update("read_at", now)
	if result.RowsAffected == 0 {
		return c.Response().Json(404, goravelhttp.Json{"error": "notification not found"})
	}
	return c.Response().Json(200, goravelhttp.Json{"message": "notification read"})
}

func (h *SocialController) Search(c goravelhttp.Context) goravelhttp.Response {
	userID, err := authenticatedUserID(c)
	if err != nil {
		return c.Response().Json(401, goravelhttp.Json{"error": "Unauthorized"})
	}
	term := strings.TrimSpace(c.Request().Query("q", ""))
	if utf8.RuneCountInString(term) < 2 || utf8.RuneCountInString(term) > 100 {
		return c.Response().Json(400, goravelhttp.Json{"error": "q must contain 2-100 characters"})
	}
	like := "%" + term + "%"
	tag := strings.TrimPrefix(strings.ToLower(term), "#")
	users := make([]models.User, 0)
	posts := make([]models.Post, 0)
	jobs := make([]models.JobPosting, 0)
	products := make([]models.Post, 0)

	if err := db.DB.Where("id <> ? AND account_status = 'active' AND (name LIKE ? OR username LIKE ? OR title LIKE ? OR company LIKE ? OR location LIKE ?)", userID, like, like, like, like, like).
		Order("name").Limit(30).Find(&users).Error; err != nil {
		return c.Response().Json(500, goravelhttp.Json{"error": "failed to search users"})
	}
	userIDs := make([]int64, len(users))
	for i := range users {
		userIDs[i] = users[i].ID
	}
	blockedUsers := blockedBetweenBatch(userID, userIDs)
	followingUsers := acceptedFollowingBatch(userID, userIDs)
	accessibleUsers := users[:0]
	for i := range users {
		if !blockedUsers[users[i].ID] && (!users[i].IsPrivate || followingUsers[users[i].ID]) {
			accessibleUsers = append(accessibleUsers, users[i])
		}
	}

	if err := db.DB.Model(&models.Post{}).Distinct("posts.*").
		Joins("LEFT JOIN post_hashtags ON post_hashtags.post_id = posts.id").
		Joins("LEFT JOIN users ON users.id = posts.user_id").
		Where("posts.post_type <> ? AND (posts.title LIKE ? OR posts.content LIKE ? OR posts.location LIKE ? OR post_hashtags.tag = ? OR users.name LIKE ? OR users.username LIKE ?)", models.PostTypeShop, like, like, like, tag, like, like).
		Preload("User").Preload("Media").Preload("Link").Preload("Hashtags").Preload("Shop").
		Order("posts.id desc").Limit(50).Find(&posts).Error; err != nil {
		return c.Response().Json(500, goravelhttp.Json{"error": "failed to search posts"})
	}

	if err := db.DB.Model(&models.JobPosting{}).Distinct("job_postings.*").
		Joins("JOIN users ON users.id = job_postings.employer_id").
		Where("users.account_status = 'active' AND (job_postings.title LIKE ? OR job_postings.company LIKE ? OR job_postings.location LIKE ? OR job_postings.type LIKE ? OR job_postings.description LIKE ? OR job_postings.category LIKE ?)", like, like, like, like, like, like).
		Preload("Employer").Order("job_postings.id desc").Limit(30).Find(&jobs).Error; err != nil {
		return c.Response().Json(500, goravelhttp.Json{"error": "failed to search jobs"})
	}

	if err := db.DB.Model(&models.Post{}).Distinct("posts.*").
		Joins("JOIN shop_products ON shop_products.post_id = posts.id").
		Joins("LEFT JOIN users ON users.id = posts.user_id").
		Where("posts.post_type = ? AND (posts.title LIKE ? OR posts.content LIKE ? OR shop_products.category LIKE ? OR shop_products.brand LIKE ? OR users.name LIKE ? OR users.username LIKE ?)", models.PostTypeShop, like, like, like, like, like, like).
		Preload("User").Preload("Media").Preload("Hashtags").Preload("Shop").
		Order("posts.id desc").Limit(30).Find(&products).Error; err != nil {
		return c.Response().Json(500, goravelhttp.Json{"error": "failed to search products"})
	}

	// Batch the block/employer/author checks for posts, jobs, and products in one
	// pair of queries instead of one query per row (was an N+1 query storm).
	postAuthorIDs := make([]int64, 0, len(posts)+len(products))
	for i := range posts {
		postAuthorIDs = append(postAuthorIDs, posts[i].UserID)
	}
	for i := range products {
		postAuthorIDs = append(postAuthorIDs, products[i].UserID)
	}
	for i := range jobs {
		postAuthorIDs = append(postAuthorIDs, jobs[i].EmployerID)
	}
	blockedAuthors := blockedBetweenBatch(userID, postAuthorIDs)
	followingAuthors := acceptedFollowingBatch(userID, postAuthorIDs)

	visible := make([]models.Post, 0, len(posts))
	for i := range posts {
		if canViewPreloadedPost(userID, &posts[i], blockedAuthors, followingAuthors) {
			posts[i].User.HidePrivateData()
			visible = append(visible, posts[i])
		}
	}

	accessibleJobs := jobs[:0]
	for i := range jobs {
		if !blockedAuthors[jobs[i].EmployerID] {
			jobs[i].Employer = publicUsers([]models.User{jobs[i].Employer})[0]
			accessibleJobs = append(accessibleJobs, jobs[i])
		}
	}

	visibleProducts := make([]models.Post, 0, len(products))
	for i := range products {
		if canViewPreloadedPost(userID, &products[i], blockedAuthors, followingAuthors) {
			products[i].User.HidePrivateData()
			visibleProducts = append(visibleProducts, products[i])
		}
	}

	return c.Response().Json(200, goravelhttp.Json{
		"users": publicUsers(accessibleUsers), "posts": visible,
		"jobs": accessibleJobs, "products": visibleProducts,
	})
}

func (h *SocialController) EmbedPost(c goravelhttp.Context) goravelhttp.Response {
	postID, err := routeID(c, "id")
	if err != nil {
		return c.Response().String(400, "Invalid post")
	}
	var post models.Post
	if db.DB.Preload("User").Preload("Media").Preload("Link").First(&post, postID).Error != nil || !canViewPost(0, &post) {
		return c.Response().String(404, "Post not found")
	}
	title, content := "Post", ""
	if post.Title != nil {
		title = *post.Title
	}
	if post.Content != nil {
		content = *post.Content
	}
	page := fmt.Sprintf(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><style>body{font:14px system-ui;margin:0}.post{border:1px solid #ddd;border-radius:12px;padding:16px;max-width:640px}h3{margin:8px 0}p{white-space:pre-wrap}img,video{max-width:100%%}</style></head><body><article class="post"><strong>%s</strong><h3>%s</h3><p>%s</p></article></body></html>`, html.EscapeString(post.User.Name), html.EscapeString(title), html.EscapeString(content))
	return c.Response().Data(200, "text/html; charset=utf-8", []byte(page))
}

func (h *SocialController) EmbedCode(c goravelhttp.Context) goravelhttp.Response {
	postID, err := routeID(c, "id")
	if err != nil {
		return c.Response().Json(400, goravelhttp.Json{"error": "invalid post"})
	}
	code := fmt.Sprintf(`<iframe src="%s/embed/posts/%d" width="100%%" height="420" loading="lazy" sandbox="allow-same-origin"></iframe>`, strings.TrimRight(c.Request().Header("Origin", ""), "/"), postID)
	return c.Response().Json(200, goravelhttp.Json{"embed_code": code})
}

type adminReportResponse struct {
	ID           int64      `json:"id"`
	PostID       int64      `json:"post_id"`
	ReporterID   int64      `json:"reporter_id"`
	Reason       string     `json:"reason"`
	Details      string     `json:"details,omitempty"`
	Status       string     `json:"status"`
	ReviewedBy   *int64     `json:"reviewed_by,omitempty"`
	ReviewedAt   *time.Time `json:"reviewed_at,omitempty"`
	CreatedAt    time.Time  `json:"created_at"`
	PostTitle    *string    `json:"post_title,omitempty"`
	PostContent  *string    `json:"post_content,omitempty"`
	AuthorID     *int64     `json:"author_id,omitempty"`
	AuthorName   *string    `json:"author_name,omitempty"`
	AuthorAvatar *string    `json:"author_avatar,omitempty"`
	ReporterName *string    `json:"reporter_name,omitempty"`
}

func (h *SocialController) AdminReports(c goravelhttp.Context) goravelhttp.Response {
	reports := make([]adminReportResponse, 0)
	err := db.DB.Table("post_reports AS reports").
		Select(`reports.*, posts.title AS post_title, posts.content AS post_content,
			posts.user_id AS author_id, authors.name AS author_name,
			authors.avatar_url AS author_avatar, reporters.name AS reporter_name`).
		Joins("LEFT JOIN posts ON posts.id = reports.post_id").
		Joins("LEFT JOIN users AS authors ON authors.id = posts.user_id").
		Joins("LEFT JOIN users AS reporters ON reporters.id = reports.reporter_id").
		Order("reports.id DESC").Limit(200).Scan(&reports).Error
	if err != nil {
		return c.Response().Json(500, goravelhttp.Json{"error": "failed to load reports"})
	}
	return c.Response().Json(200, reports)
}

func (h *SocialController) ReviewReport(c goravelhttp.Context) goravelhttp.Response {
	adminID, _ := authenticatedUserID(c)
	id, err := routeID(c, "id")
	if err != nil {
		return c.Response().Json(400, goravelhttp.Json{"error": "invalid report"})
	}
	var input struct {
		Status     string `json:"status"`
		DeletePost bool   `json:"delete_post"`
	}
	if c.Request().Bind(&input) != nil || (input.Status != "resolved" && input.Status != "dismissed") {
		return c.Response().Json(400, goravelhttp.Json{"error": "status must be resolved or dismissed"})
	}
	return dbTransactionResponse(c, func(tx *gorm.DB) error {
		var report models.PostReport
		if err := tx.First(&report, id).Error; err != nil {
			return err
		}
		now := time.Now()
		if err := tx.Model(&report).Updates(map[string]any{"status": input.Status, "reviewed_by": adminID, "reviewed_at": now}).Error; err != nil {
			return err
		}
		if input.DeletePost {
			return tx.Delete(&models.Post{}, report.PostID).Error
		}
		return nil
	}, "report reviewed")
}

func (h *SocialController) AdminBlockUser(c goravelhttp.Context) goravelhttp.Response {
	id, err := routeID(c, "id")
	if err != nil {
		return c.Response().Json(400, goravelhttp.Json{"error": "invalid user"})
	}
	result := db.DB.Model(&models.User{}).Where("id = ? AND role <> 'admin'", id).Update("account_status", "blocked")
	if result.RowsAffected == 0 {
		return c.Response().Json(404, goravelhttp.Json{"error": "user not found"})
	}
	return c.Response().Json(200, goravelhttp.Json{"message": "user blocked"})
}

func (h *SocialController) AdminUnblockUser(c goravelhttp.Context) goravelhttp.Response {
	id, err := routeID(c, "id")
	if err != nil {
		return c.Response().Json(400, goravelhttp.Json{"error": "invalid user"})
	}
	result := db.DB.Model(&models.User{}).Where("id = ? AND account_status = 'blocked'", id).Update("account_status", "active")
	if result.RowsAffected == 0 {
		return c.Response().Json(404, goravelhttp.Json{"error": "blocked user not found"})
	}
	return c.Response().Json(200, goravelhttp.Json{"message": "user unblocked"})
}
