package session

import (
	"goravel/app/models"
	"testing"
	"time"
)

func TestIdleDeadline(t *testing.T) {
	t.Setenv("SESSION_IDLE_TIMEOUT_SECONDS", "1800")
	now := time.Now()
	cases := []struct {
		name     string
		age      time.Duration
		expires  time.Duration
		expected bool
	}{
		{"active", 29 * time.Minute, time.Hour, false},
		{"exact timeout", 30 * time.Minute, time.Hour, true},
		{"idle even after token refresh", 31 * time.Minute, 7 * 24 * time.Hour, true},
		{"expired lifetime", time.Minute, -time.Second, true},
		{"activity extends idle window", time.Second, time.Hour, false},
	}
	for _, test := range cases {
		t.Run(test.name, func(t *testing.T) {
			row := models.LoginSession{LastActivity: now.Add(-test.age), ExpiresAt: now.Add(test.expires)}
			if idleExpired(row, now) != test.expected {
				t.Fatal("incorrect session expiry")
			}
		})
	}
}
