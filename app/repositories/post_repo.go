package repositories

import (
	"goravel/app/models"
	"goravel/pkg/db"
)

type PostRepository interface {
	Create(post *models.Post) error
	GetByID(id int64) (*models.Post, error)
	ListAll(limit, offset int) ([]models.Post, error)
	ListByUserID(userID int64) ([]models.Post, error)
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
	if err := db.DB.Preload("User").Preload("Media").Preload("Link").Preload("Likes").Preload("Comments").Preload("Comments.User").First(&post, id).Error; err != nil {
		return nil, err
	}
	return &post, nil
}

func (r *postRepo) ListAll(limit, offset int) ([]models.Post, error) {
	var posts []models.Post
	err := db.DB.Preload("User").Preload("Media").Preload("Link").Preload("Likes").Preload("Comments").Preload("Comments.User").
		Order("created_at desc").
		Limit(limit).Offset(offset).
		Find(&posts).Error
	if err != nil {
		return nil, err
	}
	return posts, nil
}

func (r *postRepo) ListByUserID(userID int64) ([]models.Post, error) {
	var posts []models.Post
	err := db.DB.Preload("User").Preload("Media").Preload("Link").Preload("Likes").Preload("Comments").Preload("Comments.User").
		Where("user_id = ?", userID).
		Order("created_at desc").
		Limit(50).
		Find(&posts).Error
	if err != nil {
		return nil, err
	}
	return posts, nil
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

	return &comment, nil
}
