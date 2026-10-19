package controllers

import (
	"bytes"
	"errors"
	"fmt"
	"goravel/app/facades"
	"html/template"
	"net/url"
	"regexp"
	"strings"
	"unicode/utf8"

	"goravel/app/models"
	"goravel/pkg/db"

	goravelhttp "github.com/goravel/framework/contracts/http"
)

// appBaseURL is the public origin used in share links and embed codes. Using
// configuration (not the request's Origin header) keeps generated codes
// absolute and stable when pasted into another website.
func appBaseURL() string {
	if base := strings.TrimRight(fmt.Sprint(facades.Config().Env("FRONTEND_URL", "")), "/"); base != "" {
		return base
	}
	return strings.TrimRight(fmt.Sprint(facades.Config().Env("APP_URL", "http://localhost:3000")), "/")
}

func publicPostURL(postID int64) string {
	var post models.Post
	if db.DB.Select("id", "public_hash").First(&post, postID).Error != nil {
		return ""
	}
	return fmt.Sprintf("%s/p/%s", appBaseURL(), post.PublicToken())
}

var postHashPattern = regexp.MustCompile(`^[a-f0-9]{32}$`)

func routePostID(c goravelhttp.Context) (int64, error) {
	token := c.Request().Route("id")
	if postHashPattern.MatchString(token) {
		var post models.Post
		if err := db.DB.Select("id").Where("public_hash = ?", token).First(&post).Error; err != nil {
			return 0, err
		}
		return post.ID, nil
	}
	return 0, errors.New("invalid post ID: only hash tokens are allowed")
}

// shareLinks returns web share-intent URLs. Instagram and TikTok offer no
// web share intent, so the client copies the link and opens the app instead.
func shareLinks(postID int64, title string) map[string]string {
	link := publicPostURL(postID)
	u, t := url.QueryEscape(link), url.QueryEscape(title)
	both := url.QueryEscape(strings.TrimSpace(title + " " + link))
	return map[string]string{
		"facebook":  "https://www.facebook.com/sharer/sharer.php?u=" + u,
		"x":         "https://twitter.com/intent/tweet?url=" + u + "&text=" + t,
		"threads":   "https://www.threads.net/intent/post?text=" + both,
		"linkedin":  "https://www.linkedin.com/sharing/share-offsite/?url=" + u,
		"telegram":  "https://t.me/share/url?url=" + u + "&text=" + t,
		"whatsapp":  "https://wa.me/?text=" + both,
		"pinterest": "https://pinterest.com/pin/create/button/?url=" + u + "&description=" + t,
		"instagram": "",
		"tiktok":    "",
		"copy":      link,
	}
}

type publicPostView struct {
	ID          int64
	Title       string
	Excerpt     string
	Content     string
	AuthorName  string
	AuthorUser  string
	AuthorPhoto string
	Images      []string
	VideoURL    string
	LinkURL     string
	LinkTitle   string
	Price       string
	PostURL     string
	AppURL      string
	ViewInApp   string
}

func loadPublicPost(c goravelhttp.Context) (*publicPostView, bool) {
	postID, err := routePostID(c)
	if err != nil {
		return nil, false
	}
	var post models.Post
	if db.DB.Preload("User").Preload("Media").Preload("Link").Preload("Shop").First(&post, postID).Error != nil || !canViewPost(0, &post) {
		return nil, false
	}
	view := &publicPostView{ID: post.ID, AuthorName: post.User.Name, PostURL: publicPostURL(post.ID), AppURL: appBaseURL(), ViewInApp: fmt.Sprintf("%s/post/%s", appBaseURL(), post.PublicToken())}
	if post.Title != nil {
		view.Title = *post.Title
	}
	if post.Content != nil {
		view.Content = *post.Content
		view.Excerpt = view.Content
		if utf8.RuneCountInString(view.Excerpt) > 280 {
			view.Excerpt = string([]rune(view.Excerpt)[:280]) + "…"
		}
	}
	if post.User.Username != nil {
		view.AuthorUser = *post.User.Username
	}
	if post.User.AvatarURL != nil {
		view.AuthorPhoto = *post.User.AvatarURL
	}
	for _, media := range post.Media {
		if media.MediaType == models.MediaTypeImage {
			view.Images = append(view.Images, media.MediaURL)
		} else if view.VideoURL == "" && media.ProcessingStatus == "ready" {
			view.VideoURL = media.MediaURL
		}
	}
	if post.Link != nil {
		view.LinkURL = post.Link.URL
		if post.Link.Title != nil {
			view.LinkTitle = *post.Link.Title
		}
		if len(view.Images) == 0 && post.Link.ImageURL != nil {
			view.Images = append(view.Images, *post.Link.ImageURL)
		}
	}
	if post.Shop != nil {
		view.Price = formatPrice(post.Shop.PriceMinor, post.Shop.Currency)
	}
	return view, true
}

// zeroDecimalCurrencies store whole units in price_minor (mirrors the
// frontend's utils/postFormat.tsx).
var zeroDecimalCurrencies = map[string]bool{"IDR": true, "JPY": true, "KRW": true, "VND": true, "CLP": true, "ISK": true, "UGX": true, "XAF": true, "XOF": true}

func formatPrice(minor int64, currency string) string {
	if zeroDecimalCurrencies[currency] {
		return fmt.Sprintf("%s %d", currency, minor)
	}
	return fmt.Sprintf("%s %d.%02d", currency, minor/100, minor%100)
}

var embedTemplate = template.Must(template.New("embed").Parse(`<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{{.Title}}</title>
<style>body{font:14px/1.5 system-ui,sans-serif;margin:0;color:#111;background:#fff}.post{border:1px solid #ddd;border-radius:12px;padding:16px;max-width:640px;box-sizing:border-box}.author{display:flex;align-items:center;gap:8px}.author img{width:36px;height:36px;border-radius:50%;object-fit:cover}.muted{color:#666;font-size:12px}h3{margin:10px 0 6px}p{white-space:pre-wrap;margin:0 0 10px}.media img,.media video{width:100%;border-radius:8px;max-height:360px;object-fit:cover}.price{font-weight:700;color:#0a66c2}a.cta{display:inline-block;margin-top:10px;color:#0a66c2;font-weight:600;text-decoration:none}</style></head>
<body><article class="post"><div class="author">{{if .AuthorPhoto}}<img src="{{.AuthorPhoto}}" alt="">{{end}}<div><strong>{{.AuthorName}}</strong>{{if .AuthorUser}}<div class="muted">@{{.AuthorUser}}</div>{{end}}</div></div>
<h3>{{.Title}}</h3>{{if .Price}}<div class="price">{{.Price}}</div>{{end}}<p>{{.Excerpt}}</p>
<div class="media">{{if .VideoURL}}<video src="{{.VideoURL}}" controls preload="metadata"></video>{{else if .Images}}<img src="{{index .Images 0}}" alt="">{{end}}</div>
<a class="cta" href="{{.PostURL}}" target="_blank" rel="noopener">Lihat postingan lengkap →</a></article></body></html>`))

var publicPageTemplate = template.Must(template.New("page").Parse(`<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{{.Title}}</title>
<meta name="description" content="{{.Excerpt}}"><meta property="og:type" content="article"><meta property="og:title" content="{{.Title}}"><meta property="og:description" content="{{.Excerpt}}"><meta property="og:url" content="{{.PostURL}}">{{if .Images}}<meta property="og:image" content="{{index .Images 0}}"><meta name="twitter:card" content="summary_large_image">{{else}}<meta name="twitter:card" content="summary">{{end}}
<style>body{font:16px/1.6 system-ui,sans-serif;margin:0;background:#f3f4f6;color:#111}main{max-width:720px;margin:0 auto;padding:16px}article{background:#fff;border-radius:16px;padding:20px}.author{display:flex;gap:10px;align-items:center}.author img{width:44px;height:44px;border-radius:50%;object-fit:cover}.muted{color:#666;font-size:14px}p{white-space:pre-wrap}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:8px}.grid img,video{width:100%;border-radius:10px}.price{font-size:20px;font-weight:700;color:#0a66c2}.cta{display:inline-block;margin-top:16px;background:#0a66c2;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none;font-weight:600}</style></head>
<body><main><article><div class="author">{{if .AuthorPhoto}}<img src="{{.AuthorPhoto}}" alt="">{{end}}<div><strong>{{.AuthorName}}</strong>{{if .AuthorUser}}<div class="muted">@{{.AuthorUser}}</div>{{end}}</div></div>
<h1>{{.Title}}</h1>{{if .Price}}<div class="price">{{.Price}}</div>{{end}}<p>{{.Content}}</p>
{{if .VideoURL}}<video src="{{.VideoURL}}" controls preload="metadata"></video>{{end}}{{if .Images}}<div class="grid">{{range .Images}}<img src="{{.}}" alt="" loading="lazy">{{end}}</div>{{end}}
{{if .LinkURL}}<p><a href="{{.LinkURL}}" rel="noopener nofollow ugc" target="_blank">{{if .LinkTitle}}{{.LinkTitle}}{{else}}{{.LinkURL}}{{end}}</a></p>{{end}}
<a class="cta" href="{{.ViewInApp}}">Buka di aplikasi untuk like &amp; komentar</a></article></main></body></html>`))

func renderPublic(c goravelhttp.Context, tmpl *template.Template) goravelhttp.Response {
	view, ok := loadPublicPost(c)
	if !ok {
		return c.Response().String(404, "Post not found")
	}
	var buf bytes.Buffer
	if err := tmpl.Execute(&buf, view); err != nil {
		return c.Response().String(500, "Failed to render post")
	}
	return c.Response().Header("Cache-Control", "public, max-age=60").Data(200, "text/html; charset=utf-8", buf.Bytes())
}

// EmbedPost renders a compact, script-free card for third-party iframes.
func (h *SocialController) EmbedPost(c goravelhttp.Context) goravelhttp.Response {
	return renderPublic(c, embedTemplate)
}

// PublicPostPage is the share target: OpenGraph tags let Facebook, WhatsApp,
// LinkedIn, X, etc. show a rich preview; only public posts are rendered.
func (h *SocialController) PublicPostPage(c goravelhttp.Context) goravelhttp.Response {
	if !postHashPattern.MatchString(c.Request().Route("id")) {
		return c.Response().String(404, "Post not found")
	}
	return renderPublic(c, publicPageTemplate)
}

func (h *SocialController) EmbedCode(c goravelhttp.Context) goravelhttp.Response {
	userID, err := authenticatedUserID(c)
	if err != nil {
		return c.Response().Json(401, goravelhttp.Json{"error": "Unauthorized"})
	}
	postID, err := routePostID(c)
	if err != nil {
		return c.Response().Json(400, goravelhttp.Json{"error": "invalid post"})
	}
	var post models.Post
	if db.DB.First(&post, postID).Error != nil || !canViewPost(userID, &post) {
		return c.Response().Json(404, goravelhttp.Json{"error": "post not found"})
	}
	if !canViewPost(0, &post) {
		return c.Response().Json(400, goravelhttp.Json{"error": "only public posts can be embedded"})
	}
	src := fmt.Sprintf("%s/embed/posts/%s", appBaseURL(), post.PublicToken())
	code := fmt.Sprintf(`<iframe src="%s" width="100%%" height="520" style="border:0;max-width:640px" loading="lazy" sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox" title="Embedded post"></iframe>`, template.HTMLEscapeString(src))
	return c.Response().Json(200, goravelhttp.Json{"embed_code": code, "embed_url": src, "post_url": publicPostURL(postID)})
}
