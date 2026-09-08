package services

import (
	"errors"
	"strings"

	"goravel/app/dto"
	"goravel/app/models"
	"goravel/app/repositories"
	"goravel/pkg/linkpreview"
)

type PostService interface {
	CreatePost(userID int64, req *dto.CreatePostRequest) (*models.Post, error)
	GetFeed(limit, offset int) ([]models.Post, error)
	GetUserPosts(userID int64) ([]models.Post, error)
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
	if len(req.Title) > 255 || len(req.Content) > 10000 || len(req.LinkURL) > 2000 || len(req.MediaURLs) > 10 {
		return nil, errors.New("post exceeds the allowed size")
	}
	switch req.PostType {
	case models.PostTypeText, models.PostTypeImage, models.PostTypeVideo, models.PostTypeLink:
	default:
		return nil, errors.New("invalid post type")
	}
	post := &models.Post{
		UserID:   userID,
		PostType: req.PostType,
	}
	if req.Title != "" {
		post.Title = &req.Title
	}
	if req.Content != "" {
		post.Content = &req.Content
	}

	// Map uploaded media assets to child PostMedia records
	if req.PostType == models.PostTypeImage || req.PostType == models.PostTypeVideo {
		var mType models.MediaType
		if req.PostType == models.PostTypeImage {
			mType = models.MediaTypeImage
		} else {
			mType = models.MediaTypeVideo
		}

		for _, u := range req.MediaURLs {
			post.Media = append(post.Media, models.PostMedia{
				MediaType: mType,
				MediaURL:  u,
			})
		}
	}

	// Try extracting Open Graph previews for shared URLs
	if req.PostType == models.PostTypeLink && req.LinkURL != "" {
		preview, err := linkpreview.FetchPreview(req.LinkURL)
		if err == nil {
			post.Link = &models.PostLink{
				URL:         req.LinkURL,
				Title:       &preview.Title,
				Description: &preview.Description,
				ImageURL:    &preview.ImageURL,
				SiteName:    &preview.SiteName,
			}
		} else {
			// Save the link URL directly even if scraping fails
			post.Link = &models.PostLink{
				URL: req.LinkURL,
			}
		}
	}

	if err := s.postRepo.Create(post); err != nil {
		return nil, err
	}

	// Re-fetch populated instance with user details preloaded
	return s.postRepo.GetByID(post.ID)
}

func (s *postService) GetFeed(limit, offset int) ([]models.Post, error) {
	return s.postRepo.ListAll(limit, offset)
}

func (s *postService) GetUserPosts(userID int64) ([]models.Post, error) {
	return s.postRepo.ListByUserID(userID)
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
	return s.postRepo.ToggleLike(postID, userID)
}

func (s *postService) AddCommentToPost(postID, userID int64, content string) (*models.PostComment, error) {
	content = strings.TrimSpace(content)
	if content == "" || len(content) > 5000 {
		return nil, errors.New("comment must be between 1 and 5000 bytes")
	}
	return s.postRepo.AddComment(postID, userID, content)
}
