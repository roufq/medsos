package repositories

import (
	"goravel/app/models"
	"goravel/pkg/db"
	"gorm.io/gorm"
)

type PostRepository interface {
	Create(post *models.Post) error
	GetByID(id int64) (*models.Post, error)
	ListAll(viewerID int64, limit, offset int, beforeID int64) ([]models.Post, error)
	ListByUserID(viewerID, userID int64) ([]models.Post, error)
	Delete(id int64) error
	Update(post *models.Post) error
	ToggleLike(postID, userID int64) (bool, error)
	AddComment(postID, userID int64, content string) (*models.PostComment, error)
}

type postRepo struct{}

func NewPostRepository() PostRepository {
	return &postRepo{}
}

func (r *postRepo) Create(post *models.Post) error {
	return db.DB.Create(post).Error
}

func (r *postRepo) GetByID(id int64) (*models.Post, error) {
	var post models.Post
	if err := postPreloads(db.DB).First(&post, id).Error; err != nil {
		return nil, err
	}
	sanitizePostUsers(&post)
	return &post, nil
}

func (r *postRepo) ListAll(viewerID int64, limit, offset int, beforeID int64) ([]models.Post, error) {
	var posts []models.Post
	query := db.DB.Model(&models.Post{}).
		Select(`posts.*,
			(SELECT COUNT(*) FROM post_likes WHERE post_likes.post_id = posts.id) AS likes_count,
			(SELECT COUNT(*) FROM post_comments WHERE post_comments.post_id = posts.id) AS comments_count,
			EXISTS(SELECT 1 FROM post_likes WHERE post_likes.post_id = posts.id AND post_likes.user_id = ?) AS is_liked_by_me,
			EXISTS(SELECT 1 FROM saved_posts WHERE saved_posts.post_id = posts.id AND saved_posts.user_id = ?) AS is_saved_by_me,
			(SELECT COUNT(*) FROM post_views WHERE post_views.post_id = posts.id) AS views_count,
			(SELECT COUNT(*) FROM post_shares WHERE post_shares.post_id = posts.id) AS shares_count`, viewerID, viewerID).
		Where(`EXISTS (SELECT 1 FROM users author WHERE author.id = posts.user_id AND author.account_status = 'active')`).
		Where(`NOT EXISTS (SELECT 1 FROM user_blocks b WHERE (b.blocker_id = ? AND b.blocked_id = posts.user_id) OR (b.blocker_id = posts.user_id AND b.blocked_id = ?))`, viewerID, viewerID).
		Where(`(posts.user_id = ? OR (posts.visibility = 'public' AND EXISTS (SELECT 1 FROM users author WHERE author.id = posts.user_id AND author.is_private = 0)) OR EXISTS (SELECT 1 FROM follows f WHERE f.follower_id = ? AND f.followed_id = posts.user_id AND f.status = 'accepted'))`, viewerID, viewerID)
	query = postPreloads(query)
	if beforeID > 0 {
		query = query.Where("posts.id < ?", beforeID)
	} else {
		query = query.Offset(offset)
	}
	err := query.Order("posts.id desc").Limit(limit).Find(&posts).Error
	if err != nil {
		return nil, err
	}
	for i := range posts {
		sanitizePostUsers(&posts[i])
	}
	return posts, nil
}

func (r *postRepo) ListByUserID(viewerID, userID int64) ([]models.Post, error) {
	var posts []models.Post
	query := db.DB.Model(&models.Post{}).
		Select(`posts.*,
			(SELECT COUNT(*) FROM post_likes WHERE post_likes.post_id = posts.id) AS likes_count,
			(SELECT COUNT(*) FROM post_comments WHERE post_comments.post_id = posts.id) AS comments_count,
			EXISTS(SELECT 1 FROM post_likes WHERE post_likes.post_id = posts.id AND post_likes.user_id = ?) AS is_liked_by_me,
			EXISTS(SELECT 1 FROM saved_posts WHERE saved_posts.post_id = posts.id AND saved_posts.user_id = ?) AS is_saved_by_me,
			(SELECT COUNT(*) FROM post_views WHERE post_views.post_id = posts.id) AS views_count,
			(SELECT COUNT(*) FROM post_shares WHERE post_shares.post_id = posts.id) AS shares_count`, viewerID, viewerID).
		Where("user_id = ?", userID).
		Where(`NOT EXISTS (SELECT 1 FROM user_blocks b WHERE (b.blocker_id = ? AND b.blocked_id = ?) OR (b.blocker_id = ? AND b.blocked_id = ?))`, viewerID, userID, userID, viewerID).
		Where(`(? = ? OR EXISTS (SELECT 1 FROM users u WHERE u.id = ? AND u.is_private = 0) OR EXISTS (SELECT 1 FROM follows f WHERE f.follower_id = ? AND f.followed_id = ? AND f.status = 'accepted'))`, viewerID, userID, userID, viewerID, userID).
		Where(`(posts.visibility = 'public' OR posts.user_id = ? OR EXISTS (SELECT 1 FROM follows f WHERE f.follower_id = ? AND f.followed_id = posts.user_id AND f.status = 'accepted'))`, viewerID, viewerID)
	query = postPreloads(query)
	err := query.
		Order("posts.id desc").
		Limit(50).
		Find(&posts).Error
	if err != nil {
		return nil, err
	}
	for i := range posts {
		sanitizePostUsers(&posts[i])
	}
	return posts, nil
}

func sanitizePostUsers(post *models.Post) {
	post.User.HidePrivateData()
	for i := range post.Comments {
		post.Comments[i].User.HidePrivateData()
	}
	for i := range post.Mentions {
		post.Mentions[i].User.HidePrivateData()
	}
	if post.OriginalPost != nil {
		post.OriginalPost.User.HidePrivateData()
	}
}

func postPreloads(query *gorm.DB) *gorm.DB {
	return query.Preload("User").Preload("Media").Preload("Link").Preload("Hashtags").Preload("Mentions.User").Preload("Shop").Preload("OriginalPost.User").Preload("OriginalPost.Media").Preload("OriginalPost.Link")
}

func (r *postRepo) Delete(id int64) error {
	return db.DB.Delete(&models.Post{}, id).Error
}

func (r *postRepo) Update(post *models.Post) error {
	// GORM save will save associations if they are modified
	return db.DB.Save(post).Error
}

func (r *postRepo) ToggleLike(postID, userID int64) (bool, error) {
	var like models.PostLike
	err := db.DB.Where("post_id = ? AND user_id = ?", postID, userID).First(&like).Error

	if err == nil {
		// Like exists, remove it
		err = db.DB.Delete(&like).Error
		return false, err
	}

	// Like doesn't exist, create it
	like = models.PostLike{
		PostID: postID,
		UserID: userID,
	}
	err = db.DB.Create(&like).Error
	return true, err
}

func (r *postRepo) AddComment(postID, userID int64, content string) (*models.PostComment, error) {
	comment := models.PostComment{
		PostID:  postID,
		UserID:  userID,
		Content: content,
	}

	if err := db.DB.Create(&comment).Error; err != nil {
		return nil, err
	}

	// Preload the user data before returning
	db.DB.Preload("User").First(&comment, comment.ID)
	comment.User.HidePrivateData()

	return &comment, nil
}
