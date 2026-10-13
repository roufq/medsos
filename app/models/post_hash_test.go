package models

import (
	"regexp"
	"testing"
)

func TestPostHashCreation(t *testing.T) {
	seen := map[string]bool{}
	for i := 0; i < 100; i++ {
		post := Post{}
		if err := post.BeforeCreate(nil); err != nil {
			t.Fatal(err)
		}
		token := post.PublicToken()
		if !regexp.MustCompile(`^[a-f0-9]{32}$`).MatchString(token) || seen[token] {
			t.Fatal("invalid or repeated public hash")
		}
		seen[token] = true
		if err := post.BeforeCreate(nil); err != nil || post.PublicToken() != token {
			t.Fatal("existing token changed")
		}
	}
}
