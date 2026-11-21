package middleware

import (
	"goravel/app/models"
	"testing"
)

func TestModeratorBoundaries(t *testing.T) {
	for _, v := range []struct {
		method, path string
		allowed      bool
	}{{"POST", "/api/v1/admin/posts/hash/unknown", false}, {"POST", "/api/v1/admin/posts/hash", false}, {"PUT", "/api/v1/admin/posts/hash", true}, {"GET", "/api/v1/admin/posts", true}, {"PUT", "/api/v1/admin/reports/1", true}, {"POST", "/api/v1/admin/posts/hash/restore", true}, {"DELETE", "/api/v1/admin/posts/hash/purge", false}, {"PUT", "/api/v1/admin/users/1", false}, {"GET", "/api/v1/admin/activity", false}, {"PUT", "/api/v1/admin/posts/hash/sponsor", false}} {
		if StaffAllowed(models.RoleModerator, v.method, v.path) != v.allowed {
			t.Fatal(v)
		}
	}
	if StaffAllowed(models.RoleUser, "GET", "/api/v1/admin/posts") {
		t.Fatal("User obtained staff access")
	}
}
