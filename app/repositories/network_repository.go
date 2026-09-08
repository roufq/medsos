package repositories

import (
	"goravel/app/models"
	"goravel/pkg/db"
)

type NetworkRepository interface {
	GetConnections(userID int64) ([]models.User, error)
	GetPendingRequests(userID int64) ([]models.User, error)
	GetSuggestions(userID int64) ([]models.User, error)
	SendRequest(followerID, followedID int64) error
	AcceptRequest(followerID, followedID int64) error
	DeclineRequest(followerID, followedID int64) error
}

type NetworkRepositoryImpl struct{}

func NewNetworkRepository() NetworkRepository {
	return &NetworkRepositoryImpl{}
}

func (r *NetworkRepositoryImpl) GetConnections(userID int64) ([]models.User, error) {
	var users []models.User
	// Fetch where user is either follower or followed and status is accepted
	err := db.DB.Raw(`
		SELECT u.* FROM users u
		INNER JOIN follows f ON (f.follower_id = ? AND f.followed_id = u.id) OR (f.followed_id = ? AND f.follower_id = u.id)
		WHERE f.status = 'accepted'
	`, userID, userID).Scan(&users).Error
	return users, err
}

func (r *NetworkRepositoryImpl) GetPendingRequests(userID int64) ([]models.User, error) {
	var users []models.User
	err := db.DB.Raw(`
		SELECT u.* FROM users u
		INNER JOIN follows f ON f.follower_id = u.id
		WHERE f.followed_id = ? AND f.status = 'pending'
	`, userID).Scan(&users).Error
	return users, err
}

func (r *NetworkRepositoryImpl) GetSuggestions(userID int64) ([]models.User, error) {
	var users []models.User
	err := db.DB.Raw(`
		SELECT u.* FROM users u
		WHERE u.id != ? AND u.id NOT IN (
			SELECT followed_id FROM follows WHERE follower_id = ?
			UNION
			SELECT follower_id FROM follows WHERE followed_id = ?
		)
		LIMIT 10
	`, userID, userID, userID).Scan(&users).Error
	return users, err
}

func (r *NetworkRepositoryImpl) SendRequest(followerID, followedID int64) error {
	follow := models.Follow{
		FollowerID: followerID,
		FollowedID: followedID,
		Status:     "pending",
	}
	return db.DB.Create(&follow).Error
}

func (r *NetworkRepositoryImpl) AcceptRequest(followerID, followedID int64) error {
	return db.DB.Model(&models.Follow{}).
		Where("follower_id = ? AND followed_id = ?", followerID, followedID).
		Update("status", "accepted").Error
}

func (r *NetworkRepositoryImpl) DeclineRequest(followerID, followedID int64) error {
	return db.DB.Where("follower_id = ? AND followed_id = ?", followerID, followedID).Delete(&models.Follow{}).Error
}
