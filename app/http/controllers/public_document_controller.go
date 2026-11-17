package controllers

import (
	"encoding/xml"
	http "github.com/goravel/framework/contracts/http"
	"goravel/app/models"
	"goravel/pkg/db"
	"html"
	"net/url"
	"os"
	"regexp"
	"strings"
)

var titleElement = regexp.MustCompile(`(?s)<title>.*?</title>`)
var descriptionElement = regexp.MustCompile(`<meta\s+name=["']description["'][^>]*>`)
var publicUsername = regexp.MustCompile(`^[A-Za-z0-9_]{3,40}$`)
var publicHashPattern = regexp.MustCompile(`^[a-fA-F0-9]{32}$`)

func publicDocumentHTML(document, title, description, canonical, image string, indexable bool) string {
	escape := html.EscapeString
	document = titleElement.ReplaceAllStringFunc(document, func(string) string { return "<title>" + escape(title) + "</title>" })
	document = descriptionElement.ReplaceAllString(document, "")
	robots := "index,follow"
	if !indexable {
		robots = "noindex,nofollow"
	}
	metaDescription := []rune(description)
	if len(metaDescription) > 320 {
		metaDescription = metaDescription[:320]
	}
	head := `<meta name="description" content="` + escape(string(metaDescription)) + `"><meta name="robots" content="` + robots + `"><meta property="og:title" content="` + escape(title) + `"><meta property="og:description" content="` + escape(string(metaDescription)) + `"><meta property="og:url" content="` + escape(canonical) + `"><meta property="og:type" content="website"><link rel="canonical" href="` + escape(canonical) + `">`
	if strings.HasPrefix(image, "https://") || strings.HasPrefix(image, "http://") || strings.HasPrefix(image, "/") {
		head += `<meta property="og:image" content="` + escape(image) + `">`
	}
	document = strings.Replace(document, "</head>", head+"</head>", 1)
	if indexable {
		document = strings.Replace(document, `<div id="root"></div>`, `<div id="root"></div><noscript><article><h1>`+escape(title)+`</h1><p>`+escape(description)+`</p><a href="/explore">Jelajahi Postter</a></article></noscript>`, 1)
	}
	return document
}

// Send indexable metadata with the SPA, without exposing followers-only content.
func PublicDocument(c http.Context) http.Response {
	source, err := os.ReadFile("./frontend/dist/index.html")
	if err != nil {
		return c.Response().String(503, "Frontend belum tersedia")
	}
	path := strings.Trim(c.Request().Origin().URL.Path, "/")
	title, description, image := "postter.us — Cerita, karya, dan koneksi baru", "Bagikan cerita, temukan inspirasi, dan terhubung dengan komunitas.", "https://postter.us/frontend/dist/images/postter-logo.png"
	canonical := "https://postter.us/" + path
	indexable := path == "" || path == "home" || path == "explore" || path == "shop"
	status := 200
	if publicUsername.MatchString(path) && !models.ReservedUsername(path) {
		var user models.User
		err := db.DB.Where("LOWER(username) = LOWER(?) AND account_status = 'active'", path).First(&user).Error
		if err != nil {
			status = 404
		}
		if err == nil && !user.IsPrivate {
			indexable = true
			title = user.Name + " (@" + *user.Username + ") · postter.us"
			canonical = "https://postter.us/" + url.PathEscape(*user.Username)
			if user.Bio != nil {
				description = *user.Bio
			}
			if user.AvatarURL != nil {
				image = *user.AvatarURL
			}
		}
	}
	parts := strings.Split(path, "/")
	if len(parts) == 2 && (parts[0] == "post" || parts[0] == "posts" || parts[0] == "videos") && publicHashPattern.MatchString(parts[1]) {
		var post models.Post
		status = 404
		if db.DB.Preload("Media").Preload("Link").Where("public_hash = ?", parts[1]).First(&post).Error == nil && canViewPost(0, &post) {
			status = 200
			indexable = true
			if post.Title != nil {
				title = *post.Title + " · postter.us"
			}
			if post.Content != nil {
				description = *post.Content
			}
			if len(post.Media) > 0 {
				image = post.Media[0].MediaURL
			} else if post.Link != nil && post.Link.ImageURL != nil {
				image = *post.Link.ImageURL
			}
		}
	}
	return c.Response().Header("Content-Type", "text/html; charset=utf-8").Header("Cache-Control", "no-store").String(status, publicDocumentHTML(string(source), title, description, canonical, image, indexable))
}

func Robots(c http.Context) http.Response {
	return c.Response().Header("Content-Type", "text/plain; charset=utf-8").String(200, "User-agent: *\nAllow: /\nAllow: /api/v1/public/\nAllow: /api/v1/platform/settings\nDisallow: /admin\nDisallow: /messages\nDisallow: /settings\nDisallow: /api/\nSitemap: https://postter.us/sitemap.xml\n")
}

func Sitemap(c http.Context) http.Response {
	type entry struct {
		Loc string `xml:"loc"`
	}
	result := struct {
		XMLName xml.Name `xml:"urlset"`
		XMLNS   string   `xml:"xmlns,attr"`
		URLs    []entry  `xml:"url"`
	}{XMLNS: "http://www.sitemaps.org/schemas/sitemap/0.9"}
	result.URLs = []entry{{"https://postter.us/"}, {"https://postter.us/explore"}, {"https://postter.us/home"}, {"https://postter.us/shop"}}
	var users []struct{ Username string }
	if db.DB.Model(&models.User{}).Select("username").Where("account_status = 'active' AND is_private = 0 AND username IS NOT NULL").Limit(20000).Find(&users).Error != nil {
		return c.Response().String(503, "Sitemap unavailable")
	}
	for _, u := range users {
		if !models.ReservedUsername(u.Username) {
			result.URLs = append(result.URLs, entry{"https://postter.us/" + url.PathEscape(u.Username)})
		}
	}
	var posts []struct {
		PublicHash string
		PostType   string
	}
	err := db.DB.Table("posts").Select("posts.public_hash, posts.post_type").Joins("JOIN users ON users.id = posts.user_id").Where("posts.deleted_at IS NULL AND users.account_status = 'active' AND users.is_private = 0 AND posts.visibility = 'public' AND posts.repost_of_id IS NULL AND posts.public_hash IS NOT NULL").Order("posts.id desc").Limit(20000).Scan(&posts).Error
	if err != nil {
		return c.Response().String(503, "Sitemap unavailable")
	}
	for _, p := range posts {
		prefix := "/post/"
		if p.PostType == "video" {
			prefix = "/videos/"
		}
		result.URLs = append(result.URLs, entry{"https://postter.us" + prefix + p.PublicHash})
	}
	output, err := xml.Marshal(result)
	if err != nil {
		return c.Response().String(503, "Sitemap unavailable")
	}
	return c.Response().Header("Content-Type", "application/xml; charset=utf-8").String(200, xml.Header+string(output))
}
