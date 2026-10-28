// Package csrf implements the double-submit-cookie pattern used to protect
// cookie-authenticated API requests: a non-httpOnly token is set as a
// cookie, and the caller must echo it back in a header. A cross-site page
// can trigger a request that carries our cookies automatically, but it can
// neither read this cookie (blocked by the browser's same-origin policy)
// nor know what value to put in the header, so the two can only match when
// the request actually originated from our own frontend JavaScript.
package csrf

import (
	"crypto/rand"
	"crypto/subtle"
	"encoding/base64"
)

// HeaderName is the request header the frontend must echo the csrf_token
// cookie's value back in for cookie-authenticated, state-changing requests.
const HeaderName = "X-CSRF-Token"

// CookieName is the non-httpOnly cookie holding the current CSRF token.
const CookieName = "csrf_token"

// NewToken generates a new random CSRF token value.
func NewToken() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(b), nil
}

// SafeMethod reports whether the HTTP method is read-only.
func SafeMethod(method string) bool {
	return method == "GET" || method == "HEAD" || method == "OPTIONS"
}

// Valid reports whether any candidate (header or form value) matches the cookie value in constant time.
func Valid(cookieValue string, candidates ...string) bool {
	if cookieValue == "" {
		return false
	}
	for _, candidate := range candidates {
		if candidate != "" && subtle.ConstantTimeCompare([]byte(cookieValue), []byte(candidate)) == 1 {
			return true
		}
	}
	return false
}
