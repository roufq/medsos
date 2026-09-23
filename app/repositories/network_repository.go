package repositories

import (
	"errors"
	"goravel/app/models"
	"goravel/pkg/db"
)

type NetworkRepository interface {
	GetConnections(userID int64) ([]models.User, error)
	GetPendingRequests(userID int64) ([]models.User, error)
	GetSuggestions(userID int64) ([]models.User, error)
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
		SELECT DISTINCT u.* FROM users u
		INNER JOIN follows f ON (f.follower_id = ? AND f.followed_id = u.id) OR (f.followed_id = ? AND f.follower_id = u.id)
		WHERE f.status = 'accepted' AND u.account_status = 'active'
		AND NOT EXISTS (SELECT 1 FROM user_blocks b WHERE (b.blocker_id = ? AND b.blocked_id = u.id) OR (b.blocker_id = u.id AND b.blocked_id = ?))
		LIMIT 200
	`, userID, userID, userID, userID).Scan(&users).Error
	return users, err
}

func (r *NetworkRepositoryImpl) GetPendingRequests(userID int64) ([]models.User, error) {
	var users []models.User
	err := db.DB.Raw(`
		SELECT u.* FROM users u
		INNER JOIN follows f ON f.follower_id = u.id
		WHERE f.followed_id = ? AND f.status = 'pending' AND u.account_status = 'active'
		AND NOT EXISTS (SELECT 1 FROM user_blocks b WHERE (b.blocker_id = ? AND b.blocked_id = u.id) OR (b.blocker_id = u.id AND b.blocked_id = ?))
		LIMIT 100
	`, userID, userID, userID).Scan(&users).Error
	return users, err
}

func (r *NetworkRepositoryImpl) GetSuggestions(userID int64) ([]models.User, error) {
	var users []models.User
	err := db.DB.Raw(`
		SELECT u.* FROM users u
		WHERE u.id != ? AND u.account_status = 'active' AND u.id NOT IN (
			SELECT followed_id FROM follows WHERE follower_id = ?
			UNION
			SELECT follower_id FROM follows WHERE followed_id = ?
		)
		AND NOT EXISTS (SELECT 1 FROM user_blocks b WHERE (b.blocker_id = ? AND b.blocked_id = u.id) OR (b.blocker_id = u.id AND b.blocked_id = ?))
		LIMIT 10
	`, userID, userID, userID, userID, userID).Scan(&users).Error
	return users, err
}

func (r *NetworkRepositoryImpl) AcceptRequest(followerID, followedID int64) error {
	result := db.DB.Model(&models.Follow{}).
		Where("follower_id = ? AND followed_id = ?", followerID, followedID).
		Update("status", "accepted")
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		// A same-value UPDATE (e.g. accepting an already-accepted request, or a
		// race between two accept calls) can also report 0 rows affected, so
		// only treat this as "not found" if no accepted row actually exists.
		var count int64
		db.DB.Model(&models.Follow{}).Where("follower_id = ? AND followed_id = ? AND status = 'accepted'", followerID, followedID).Count(&count)
		if count == 0 {
			return errors.New("follow request not found")
		}
	}
	return nil
}

func (r *NetworkRepositoryImpl) DeclineRequest(followerID, followedID int64) error {
	result := db.DB.Where("follower_id = ? AND followed_id = ? AND status = 'pending'", followerID, followedID).Delete(&models.Follow{})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("follow request not found")
	}
	return nil
}
