package models

import "testing"

func TestRecordedActivityDoesNotIncludePollingOrPrivateReads(t *testing.T) {
	for _, test := range []struct {
		method, path string
		record       bool
	}{
		{"GET", "/api/v1/posts", true}, {"GET", "/api/v1/explore", true}, {"GET", "/api/v1/search", true}, {"GET", "/api/v1/users/ahmad", true},
		{"POST", "/api/v1/posts", true}, {"POST", "/api/v1/messages", true},
		{"GET", "/api/v1/messages", false}, {"GET", "/api/v1/posts/a/comments", false}, {"GET", "/api/v1/users/me", false},
		{"POST", "/api/v1/auth/activity", false}, {"GET", "/api/v1/messages/call/poll", false},
		{"DELETE", "/api/v1/admin/posts/a", false}, {"POST", "/api/v1/admin/posts/a/restore", false},
	} {
		if got := ShouldRecordActivity(test.method, test.path); got != test.record {
			t.Errorf("%s %s: got %v", test.method, test.path, got)
		}
	}
	if ActivityDescription("POST", "/api/v1/posts") != "Membuat postingan" {
		t.Fatal("creation should have a readable description")
	}
	if ActivityDescription("GET", "/api/v1/users/ahmad") != "Melihat profil" {
		t.Fatal("profile read should have a readable description")
	}
}
