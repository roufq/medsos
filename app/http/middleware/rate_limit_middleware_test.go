package middleware

import (
	"sync"
	"sync/atomic"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestFixedWindowLimiterRejectsAndResets(t *testing.T) {
	limiter := &fixedWindowLimiter{windows: make(map[string]rateWindow)}
	now := time.Unix(100, 0)

	allowed, remaining, _ := limiter.take("login:127.0.0.1", 2, time.Minute, now)
	assert.True(t, allowed)
	assert.Equal(t, 1, remaining)
	allowed, remaining, _ = limiter.take("login:127.0.0.1", 2, time.Minute, now)
	assert.True(t, allowed)
	assert.Equal(t, 0, remaining)
	allowed, _, _ = limiter.take("login:127.0.0.1", 2, time.Minute, now)
	assert.False(t, allowed)

	allowed, remaining, _ = limiter.take("login:127.0.0.1", 2, time.Minute, now.Add(time.Minute))
	assert.True(t, allowed)
	assert.Equal(t, 1, remaining)
}

func TestFixedWindowLimiterIsSafeUnderConcurrentLoad(t *testing.T) {
	limiter := &fixedWindowLimiter{windows: make(map[string]rateWindow)}
	now := time.Unix(200, 0)
	var allowedCount int64
	var workers sync.WaitGroup

	for i := 0; i < 1000; i++ {
		workers.Add(1)
		go func() {
			defer workers.Done()
			allowed, _, _ := limiter.take("api:shared-client", 300, time.Minute, now)
			if allowed {
				atomic.AddInt64(&allowedCount, 1)
			}
		}()
	}
	workers.Wait()

	assert.Equal(t, int64(300), allowedCount)
}
