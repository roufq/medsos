package controllers

import (
	http "github.com/goravel/framework/contracts/http"
	"goravel/app/repositories"
	"goravel/pkg/db"
	"strconv"
	"strings"
	"unicode/utf8"
)

func Explore(c http.Context) http.Response {
	limit, e1 := strconv.Atoi(c.Request().Query("limit", "24"))
	offset, e2 := strconv.Atoi(c.Request().Query("offset", "0"))
	topic := strings.ToLower(strings.TrimSpace(c.Request().Query("topic", "all")))
	sort := c.Request().Query("sort", "latest")
	search := strings.TrimSpace(c.Request().Query("q", ""))
	_, validTopic := repositories.ExploreTopics[topic]
	if e1 != nil || e2 != nil || limit < 1 || limit > 50 || offset < 0 || offset > 10000 || !validTopic || (sort != "latest" && sort != "popular") || utf8.RuneCountInString(search) > 120 {
		return c.Response().Json(400, http.Json{"error": "Filter Explore tidak valid"})
	}
	viewer, _ := authenticatedUserID(c)
	posts, err := repositories.ExplorePosts(viewer, limit+1, offset, topic, sort, search)
	if err != nil {
		return c.Response().Json(503, http.Json{"error": "Postingan Explore belum dapat dimuat"})
	}
	more := len(posts) > limit
	if more {
		posts = posts[:limit]
	}
	return c.Response().Json(200, http.Json{"posts": posts, "has_more": more})
}

func TrendingTopics(c http.Context) http.Response {
	type topicRow struct {
		Tag   string `json:"tag"`
		Count int64  `json:"count"`
	}
	var rows []topicRow
	if db.DB != nil {
		db.DB.Table("post_hashtags h").
			Select("LOWER(h.tag) AS tag, COUNT(DISTINCT h.post_id) AS count").
			Joins("JOIN posts p ON p.id = h.post_id AND p.deleted_at IS NULL AND p.visibility = 'public'").
			Joins("JOIN users u ON u.id = p.user_id AND u.account_status = 'active' AND u.is_private = 0").
			Group("LOWER(h.tag)").
			Order("count DESC, MAX(h.post_id) DESC").
			Limit(5).
			Scan(&rows)
	}
	return c.Response().Json(200, rows)
}
