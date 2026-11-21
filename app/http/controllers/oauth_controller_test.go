package controllers

import (
	"encoding/json"
	"testing"
)

func TestOAuthHelpers(t *testing.T) {
	t.Setenv("OAUTH_DEV_MODE", "true")
	t.Setenv("APP_ENV", "production")
	t.Setenv("OAUTH_GOOGLE_CLIENT_ID", "")
	t.Setenv("OAUTH_GOOGLE_CLIENT_SECRET", "")

	if _, err := providerConfig("google"); err == nil {
		t.Fatal("expected error when OAUTH_DEV_MODE=true outside APP_ENV=local")
	}

	t.Setenv("APP_ENV", "local")
	p, err := providerConfig("google")
	if err != nil || !p.devMode || p.name != "google" {
		t.Fatalf("expected devMode google provider, got %+v, err=%v", p, err)
	}

	if got := parseAppleUserJSON(`{"name":{"firstName":"Budi","lastName":"Santoso"}}`); got != "Budi Santoso" {
		t.Fatalf("expected Budi Santoso, got %q", got)
	}
	if got := parseOAuthPicture(json.RawMessage(`"https://example.com/a.jpg"`)); got != "https://example.com/a.jpg" {
		t.Fatalf("unexpected direct picture: %q", got)
	}
	if got := parseOAuthPicture(json.RawMessage(`{"data":{"url":"https://example.com/fb.jpg"}}`)); got != "https://example.com/fb.jpg" {
		t.Fatalf("unexpected fb picture: %q", got)
	}
}

