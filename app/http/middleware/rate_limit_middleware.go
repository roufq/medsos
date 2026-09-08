package middleware

import (
	"fmt"
	"net/http"
	"strconv"
	"sync"
	"time"

	goravelhttp "github.com/goravel/framework/contracts/http"
)

type rateWindow struct {
	count   int
	resetAt time.Time
}

type fixedWindowLimiter struct {
	mu      sync.Mutex
	windows map[string]rateWindow
	calls   uint64
}

var requestLimiter = &fixedWindowLimiter{windows: make(map[string]rateWindow)}

const maxTrackedRateLimitKeys = 100000

// RateLimit protects an endpoint group per client IP. For multiple application
// instances, enforce an additional shared limit at the reverse proxy/API gateway.
func RateLimit(name string, maximum int, window time.Duration) goravelhttp.Middleware {
	return func(ctx goravelhttp.Context) {
		now := time.Now()
		identity := ctx.Request().Ip()
		if userID := ctx.Value("userID"); userID != nil {
			identity = "user:" + fmt.Sprint(userID)
		}
		key := name + ":" + identity
		allowed, remaining, resetAt := requestLimiter.take(key, maximum, window, now)

		ctx.Response().Header("X-RateLimit-Limit", strconv.Itoa(maximum))
		ctx.Response().Header("X-RateLimit-Remaining", strconv.Itoa(remaining))
		ctx.Response().Header("X-RateLimit-Reset", strconv.FormatInt(resetAt.Unix(), 10))
		if !allowed {
			retryAfter := max(1, int(time.Until(resetAt).Seconds()))
			ctx.Response().Header("Retry-After", strconv.Itoa(retryAfter))
			ctx.Request().AbortWithStatusJson(http.StatusTooManyRequests, goravelhttp.Json{
				"error": "Too many requests. Please try again later.",
			})
			return
		}

		ctx.Request().Next()
	}
}

func (l *fixedWindowLimiter) take(key string, maximum int, window time.Duration, now time.Time) (bool, int, time.Time) {
	l.mu.Lock()
	defer l.mu.Unlock()

	l.calls++
	if l.calls%1024 == 0 {
		for existingKey, entry := range l.windows {
			if !now.Before(entry.resetAt) {
				delete(l.windows, existingKey)
			}
		}
	}

	entry, exists := l.windows[key]
	if !exists && len(l.windows) >= maxTrackedRateLimitKeys {
		return false, 0, now.Add(window)
	}
	if !exists || !now.Before(entry.resetAt) {
		entry = rateWindow{resetAt: now.Add(window)}
	}
	if entry.count >= maximum {
		return false, 0, entry.resetAt
	}

	entry.count++
	l.windows[key] = entry
	return true, maximum - entry.count, entry.resetAt
}

// ConcurrentLimit sheds excess work quickly so a traffic spike cannot exhaust
// database connections, goroutines, or memory while queued requests pile up.
func ConcurrentLimit(maximum int) goravelhttp.Middleware {
	semaphore := make(chan struct{}, maximum)
	return func(ctx goravelhttp.Context) {
		select {
		case semaphore <- struct{}{}:
			defer func() { <-semaphore }()
			ctx.Request().Next()
		default:
			ctx.Response().Header("Retry-After", "1")
			ctx.Request().AbortWithStatusJson(http.StatusServiceUnavailable, goravelhttp.Json{
				"error": "Server is busy. Please retry shortly.",
			})
		}
	}
}
