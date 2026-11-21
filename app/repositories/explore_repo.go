package repositories

import (
	"goravel/app/models"
	"goravel/pkg/db"
	"strings"
)

// Topics use the hashtags authors already attach to their posts.
var ExploreTopics = map[string][]string{
	"all": nil, "poster": {"poster"}, "design": {"design", "desain"},
	"art": {"art", "seni"}, "photography": {"photography", "fotografi", "foto"},
	"fashion": {"fashion", "busana"}, "technology": {"technology", "teknologi", "tech"},
	"travel": {"travel", "wisata", "traveling"}, "lifestyle": {"lifestyle", "gayahidup"},
	"business": {"business", "bisnis", "usaha"}, "food": {"food", "kuliner", "makanan"},
	"music": {"music", "musik"}, "sport": {"sport", "olahraga"}, "nature": {"nature", "alam"},
	"education": {"education", "pendidikan"}, "automotive": {"automotive", "otomotif", "mobil"},
}

func ExplorePosts(viewerID int64, limit, offset int, topic, sort, search string) ([]models.Post, error) {
	query := withCounters(db.DB.Model(&models.Post{}), viewerID).
		Where("posts.visibility = 'public' AND posts.repost_of_id IS NULL").
		Where("EXISTS (SELECT 1 FROM users author WHERE author.id = posts.user_id AND author.account_status = 'active' AND author.is_private = 0)").
		Where("NOT EXISTS (SELECT 1 FROM user_blocks b WHERE (b.blocker_id = ? AND b.blocked_id = posts.user_id) OR (b.blocker_id = posts.user_id AND b.blocked_id = ?))", viewerID, viewerID)
	if tags := ExploreTopics[topic]; len(tags) > 0 {
		query = query.Where("EXISTS (SELECT 1 FROM post_hashtags h WHERE h.post_id = posts.id AND LOWER(h.tag) IN ?)", tags)
	}
	if search != "" {
		pattern := "%" + strings.TrimLeft(search, "#@") + "%"
		query = query.Where("posts.title LIKE ? OR posts.content LIKE ? OR EXISTS (SELECT 1 FROM users u WHERE u.id = posts.user_id AND (u.name LIKE ? OR u.username LIKE ?)) OR EXISTS (SELECT 1 FROM post_hashtags h WHERE h.post_id=posts.id AND h.tag LIKE ?)", pattern, pattern, pattern, pattern, pattern)
	}
	query = query.Order("posts.is_featured DESC")
	if sort == "popular" {
		query = query.Order("((SELECT COUNT(*) FROM post_likes l WHERE l.post_id=posts.id) + (SELECT COUNT(*) FROM post_comments c WHERE c.post_id=posts.id)) DESC")
	}
	var posts []models.Post
	err := postPreloads(query, viewerID).Order("posts.id DESC").Offset(offset).Limit(limit).Find(&posts).Error
	for i := range posts {
		sanitizePostUsers(&posts[i])
	}
	return posts, err
}
