package controllers

import (
	http "github.com/goravel/framework/contracts/http"
	"goravel/app/models"
	"goravel/pkg/db"
	"goravel/pkg/platform"
	"net/url"
	"strconv"
	"strings"
	"time"
)

func availableAds() bool {
	s, e := platform.Settings()
	return e == nil && s.AdsEnabled && !s.Maintenance
}
func activeAd(id string) (models.AdCampaign, error) {
	var ad models.AdCampaign
	n, e := strconv.ParseInt(id, 10, 64)
	if e != nil || n < 1 {
		return ad, strconv.ErrSyntax
	}
	now := time.Now()
	e = db.DB.Where("id = ? AND status='active' AND starts_at <= ? AND ends_at > ?", n, now, now).First(&ad).Error
	return ad, e
}
func validateAd(ad models.AdCampaign) bool {
	placement := map[string]bool{"top_banner": true, "feed": true, "sidebar": true, "profile": true, "explore": true}
	return len(strings.TrimSpace(ad.Title)) >= 2 && len(ad.Title) <= 160 && len(ad.Description) <= 500 && len(ad.ImageURL) <= 500 && len(ad.TargetURL) <= 500 && ad.ImageURL != "" && ad.TargetURL != "" && safeConsoleURL(ad.ImageURL, true) && safeConsoleURL(ad.TargetURL, false) && placement[ad.Placement] && (ad.Status == "active" || ad.Status == "paused") && !ad.StartsAt.IsZero() && ad.EndsAt.After(ad.StartsAt)
}

const adSelect = "ad_campaigns.*, (SELECT COUNT(*) FROM traffic_events WHERE ad_id=ad_campaigns.id AND kind='impression') AS impressions, (SELECT COUNT(*) FROM traffic_events WHERE ad_id=ad_campaigns.id AND kind='click') AS clicks"

func AdminAds(c http.Context) http.Response {
	if c.Request().Method() == "GET" {
		items := []models.AdCampaign{}
		if db.DB.Select(adSelect).Order("id desc").Find(&items).Error != nil {
			return consoleError(c, 503, "Cannot load advertisements")
		}
		return c.Response().Json(200, items)
	}
	if c.Request().Method() == "DELETE" {
		id, e := strconv.ParseInt(c.Request().Route("id"), 10, 64)
		if e != nil || id < 1 {
			return consoleError(c, 400, "Invalid advertisement")
		}
		if db.DB.Delete(&models.AdCampaign{}, id).Error != nil {
			return consoleError(c, 503, "Cannot delete advertisement")
		}
		return c.Response().Json(200, http.Json{"ok": true})
	}
	var ad models.AdCampaign
	if c.Request().Bind(&ad) != nil || !validateAd(ad) {
		return consoleError(c, 400, "Check advertisement title, URLs, placement and schedule")
	}
	ad.ID = 0
	ad.CreatedAt = time.Time{}
	ad.UpdatedAt = time.Time{}
	if c.Request().Method() == "PUT" {
		id, e := strconv.ParseInt(c.Request().Route("id"), 10, 64)
		if e != nil || id < 1 {
			return consoleError(c, 400, "Invalid advertisement")
		}
		var current models.AdCampaign
		if db.DB.First(&current, id).Error != nil {
			return consoleError(c, 404, "Advertisement not found")
		}
		ad.ID = id
		ad.CreatedAt = current.CreatedAt
	}
	if db.DB.Save(&ad).Error != nil {
		return consoleError(c, 503, "Cannot save advertisement")
	}
	return c.Response().Json(200, ad)
}
func PublicAds(c http.Context) http.Response {
	items := []models.AdCampaign{}
	if !availableAds() {
		return c.Response().Json(200, items)
	}
	now := time.Now()
	q := db.DB.Where("status='active' AND starts_at <= ? AND ends_at > ?", now, now)
	if placement := c.Request().Query("placement", ""); placement != "" {
		q = q.Where("placement = ?", placement)
	}
	if q.Order("id desc").Limit(20).Find(&items).Error != nil {
		return consoleError(c, 503, "Advertisements unavailable")
	}
	return c.Response().Json(200, items)
}
func PublicAdClick(c http.Context) http.Response {
	ad, e := activeAd(c.Request().Route("id"))
	if e != nil || !availableAds() {
		return consoleError(c, 404, "Advertisement unavailable")
	}
	if !safeConsoleURL(ad.TargetURL, false) {
		return consoleError(c, 400, "Invalid destination")
	}
	if db.DB.Create(&models.TrafficEvent{Kind: "click", AdID: ad.ID, Source: "direct", Path: "/ads"}).Error != nil {
		return consoleError(c, 503, "Cannot record click")
	}
	return c.Response().Redirect(302, ad.TargetURL)
}
func RecordTraffic(c http.Context) http.Response {
	settings, e := platform.Settings()
	if e != nil {
		return consoleError(c, 503, "Statistics unavailable")
	}
	if !settings.AnalyticsEnabled {
		return c.Response().Json(200, http.Json{"ok": true})
	}
	var input struct {
		Kind     string `json:"kind"`
		Path     string `json:"path"`
		Referrer string `json:"referrer"`
		AdID     int64  `json:"ad_id"`
	}
	if c.Request().Bind(&input) != nil || (input.Kind != "visit" && input.Kind != "impression") || !strings.HasPrefix(input.Path, "/") || strings.HasPrefix(input.Path, "//") || len(input.Path) > 255 {
		return consoleError(c, 400, "Invalid traffic event")
	}
	if strings.HasPrefix(input.Path, "/admin") {
		return c.Response().Json(200, http.Json{"ok": true})
	}
	input.Path = strings.SplitN(strings.SplitN(input.Path, "?", 2)[0], "#", 2)[0]
	if input.Kind == "impression" {
		ad, e := activeAd(strconv.FormatInt(input.AdID, 10))
		if e != nil || !availableAds() {
			return consoleError(c, 404, "Advertisement unavailable")
		}
		input.AdID = ad.ID
	} else {
		input.AdID = 0
	}
	source := "direct"
	if u, e := url.Parse(input.Referrer); e == nil && u.Hostname() != "" {
		host := strings.ToLower(u.Hostname())
		own := c.Request().Origin().URL.Host
		if !strings.EqualFold(host, strings.Split(own, ":")[0]) {
			source = "others"
			for _, domain := range []string{"google.", "bing.", "duckduckgo.", "yahoo."} {
				if strings.Contains(host, domain) {
					source = "search"
				}
			}
			for _, domain := range []string{"facebook.com", "instagram.com", "t.co", "twitter.com", "x.com", "tiktok.com", "linkedin.com", "threads.net", "pinterest.com", "telegram.org"} {
				if host == domain || strings.HasSuffix(host, "."+domain) {
					source = "social"
				}
			}
		}
	}
	if db.DB.Create(&models.TrafficEvent{Kind: input.Kind, Source: source, Path: input.Path, AdID: input.AdID}).Error != nil {
		return consoleError(c, 503, "Cannot record statistics")
	}
	return c.Response().Json(200, http.Json{"ok": true})
}
