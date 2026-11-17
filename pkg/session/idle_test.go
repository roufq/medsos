package session

import (
	"goravel/app/models"
	"testing"
	"time"
)

func TestIdleDeadline(t *testing.T) {
	t.Setenv("SESSION_IDLE_TIMEOUT_SECONDS", "")
	now := time.Now()
	cases := []struct {
		name     string
		age      time.Duration
		expires  time.Duration
		expected bool
	}{
		{"active before twelve hours", 12*time.Hour - time.Second, 24 * time.Hour, false},
		{"exact twelve hour timeout", 12 * time.Hour, 24 * time.Hour, true},
		{"idle even after token refresh", 12*time.Hour + time.Second, 7 * 24 * time.Hour, true},
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

func TestIdleTimeoutConfiguration(t *testing.T) {
	for _, tc := range []struct {
		value string
		want  time.Duration
	}{
		{"", 12 * time.Hour},
		{"invalid", 12 * time.Hour},
		{"-1", 12 * time.Hour},
		{"59", 12 * time.Hour},
		{"43200", 12 * time.Hour},
		{"1800", 30 * time.Minute},
		{"60", time.Minute},
	} {
		t.Run("timeout_"+tc.value, func(t *testing.T) {
			t.Setenv("SESSION_IDLE_TIMEOUT_SECONDS", tc.value)
			if got := IdleTimeout(); got != tc.want {
				t.Fatalf("IdleTimeout() = %v, want %v", got, tc.want)
			}
		})
	}
}
