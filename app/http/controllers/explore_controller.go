package controllers

import (
	http "github.com/goravel/framework/contracts/http"
	"goravel/app/repositories"
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
