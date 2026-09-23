package linkpreview

import (
	"context"
	"errors"
	"fmt"
	"io"
	"net"
	"net/http"
	"net/url"
	"regexp"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
)

// Preview represents the metadata preview info extracted from a webpage
type Preview struct {
	URL         string `json:"url"`
	Title       string `json:"title"`
	Description string `json:"description"`
	ImageURL    string `json:"image_url"`
	SiteName    string `json:"site_name"`
}

// FetchPreview retrieves Open Graph and metadata preview attributes for a validated URL
func FetchPreview(targetURL string) (*Preview, error) {
	if err := validateURL(targetURL); err != nil {
		return nil, err
	}

	client := &http.Client{
		Timeout: 5 * time.Second,
		Transport: &http.Transport{
			DialContext:           safeDialContext,
			MaxIdleConns:          20,
			MaxIdleConnsPerHost:   2,
			IdleConnTimeout:       30 * time.Second,
			TLSHandshakeTimeout:   3 * time.Second,
			ResponseHeaderTimeout: 3 * time.Second,
		},
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			if len(via) >= 3 {
				return errors.New("too many redirects")
			}
			return validateURL(req.URL.String())
		},
	}

	req, err := http.NewRequest("GET", targetURL, nil)
	if err != nil {
		return nil, err
	}
	// Look like a regular browser request to reduce bot-blocking (401/403) from sites
	// that reject requests missing typical browser headers.
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36")
	req.Header.Set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8")
	req.Header.Set("Accept-Language", "en-US,en;q=0.9")

	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to fetch page, HTTP status: %d", resp.StatusCode)
	}

	const maxPreviewBytes = 2 << 20
	doc, err := goquery.NewDocumentFromReader(io.LimitReader(resp.Body, maxPreviewBytes))
	if err != nil {
		return nil, err
	}

	preview := &Preview{URL: targetURL}

	doc.Find("meta").Each(func(i int, s *goquery.Selection) {
		property, _ := s.Attr("property")
		name, _ := s.Attr("name")
		content, _ := s.Attr("content")

		switch property {
		case "og:title":
			preview.Title = content
		case "og:description":
			preview.Description = content
		case "og:image":
			preview.ImageURL = content
		case "og:site_name":
			preview.SiteName = content
		}

		if name == "description" && preview.Description == "" {
			preview.Description = content
		}
	})

	if preview.Title == "" {
		preview.Title = doc.Find("title").First().Text()
	}

	return preview, nil
}

// slugWordPattern splits a URL path's last segment into words for a readable
// fallback title, e.g. "indonesia-president-replaces-minister" -> "Indonesia
// president replaces minister".
var slugWordPattern = regexp.MustCompile(`[a-zA-Z0-9']+`)

// FallbackPreview builds a best-effort preview without fetching the target
// page, for sites whose bot protection blocks direct scraping (e.g. Reuters'
// DataDome). It derives a readable title from the URL slug and uses a public
// favicon service (Google's) so the card still shows a real site logo
// instead of an empty placeholder — this only calls google.com, never the
// blocked site itself.
func FallbackPreview(targetURL string) *Preview {
	parsed, err := url.Parse(targetURL)
	if err != nil {
		return &Preview{URL: targetURL}
	}
	hostname := strings.TrimPrefix(parsed.Hostname(), "www.")

	title := hostname
	segments := strings.Split(strings.Trim(parsed.Path, "/"), "/")
	for i := len(segments) - 1; i >= 0; i-- {
		words := slugWordPattern.FindAllString(segments[i], -1)
		// Drop a trailing date/id stamp (e.g. "...-2026-09-14") so the
		// derived title reads like a headline, not a URL slug.
		for len(words) > 3 {
			last := words[len(words)-1]
			if isNumericToken(last) {
				words = words[:len(words)-1]
				continue
			}
			break
		}
		if len(words) >= 3 {
			title = strings.Join(words, " ")
			if len(title) > 0 {
				title = strings.ToUpper(title[:1]) + title[1:]
			}
			break
		}
	}

	return &Preview{
		URL:      targetURL,
		Title:    title,
		SiteName: hostname,
		ImageURL: "https://www.google.com/s2/favicons?sz=128&domain=" + hostname,
	}
}

func isNumericToken(word string) bool {
	for _, r := range word {
		if r < '0' || r > '9' {
			return false
		}
	}
	return word != ""
}

func safeDialContext(ctx context.Context, network, address string) (net.Conn, error) {
	host, port, err := net.SplitHostPort(address)
	if err != nil {
		return nil, err
	}
	ips, err := net.DefaultResolver.LookupIP(ctx, "ip", host)
	if err != nil {
		return nil, err
	}
	for _, ip := range ips {
		if isPrivateIP(ip) {
			continue
		}
		dialer := &net.Dialer{Timeout: 3 * time.Second, KeepAlive: 30 * time.Second}
		return dialer.DialContext(ctx, network, net.JoinHostPort(ip.String(), port))
	}
	return nil, errors.New("SSRF protection: no public destination address is available")
}

func validateURL(targetURL string) error {
	u, err := url.Parse(targetURL)
	if err != nil {
		return err
	}
	if (u.Scheme != "http" && u.Scheme != "https") || u.Hostname() == "" {
		return fmt.Errorf("invalid URL scheme: %s", u.Scheme)
	}

	ips, err := net.LookupIP(u.Hostname())
	if err != nil {
		return err
	}

	for _, ip := range ips {
		if isPrivateIP(ip) {
			return errors.New("SSRF protection: connection to local network/private IP ranges is prohibited")
		}
	}
	return nil
}

func isPrivateIP(ip net.IP) bool {
	if ip.IsLoopback() || ip.IsLinkLocalUnicast() || ip.IsLinkLocalMulticast() || ip.IsUnspecified() {
		return true
	}
	if ip4 := ip.To4(); ip4 != nil {
		return ip4[0] == 10 ||
			(ip4[0] == 172 && ip4[1] >= 16 && ip4[1] <= 31) ||
			(ip4[0] == 192 && ip4[1] == 168)
	}
	return ip[0] == 0xfc || ip[0] == 0xfd
}
