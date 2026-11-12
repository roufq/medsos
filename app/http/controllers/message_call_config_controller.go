package controllers

import (
	"crypto/hmac"
	"crypto/sha1"
	"encoding/base64"
	"fmt"
	"strings"
	"time"

	goravelhttp "github.com/goravel/framework/contracts/http"
	"goravel/app/facades"
)

// A read never consumes a signal; the receiving tab acknowledges processed events.
// callMu must be held by the caller.
func pendingCallEventsLocked(userID int64, ack uint64) []callSignalEvent {
	queue := callQueues[userID]
	first := 0
	for first < len(queue) && queue[first].Sequence <= ack {
		first++
	}
	queue = queue[first:]
	if len(queue) == 0 {
		delete(callQueues, userID)
	} else {
		callQueues[userID] = queue
	}
	// Copy before unlocking: a concurrent enqueue may reuse the queue's backing array.
	return append([]callSignalEvent{}, queue...)
}

func callICEConfig(userID int64, now time.Time, urls, secret string) goravelhttp.Json {
	servers := []goravelhttp.Json{{"urls": "stun:stun.l.google.com:19302"}, {"urls": "stun:stun1.l.google.com:19302"}}
	turnURLs := []string{}
	for _, raw := range strings.Split(urls, ",") {
		url := strings.TrimSpace(raw)
		if strings.HasPrefix(url, "turn:") || strings.HasPrefix(url, "turns:") {
			turnURLs = append(turnURLs, url)
		}
	}
	ready := len(turnURLs) > 0 && strings.TrimSpace(secret) != ""
	if ready {
		username := fmt.Sprintf("%d:%d", now.Add(time.Hour).Unix(), userID)
		mac := hmac.New(sha1.New, []byte(secret))
		_, _ = mac.Write([]byte(username))
		servers = append(servers, goravelhttp.Json{"urls": turnURLs, "username": username, "credential": base64.StdEncoding.EncodeToString(mac.Sum(nil))})
	}
	return goravelhttp.Json{"iceServers": servers, "turn_available": ready}
}

func (c *MessageController) GetCallConfig(ctx goravelhttp.Context) goravelhttp.Response {
	userID, err := authenticatedUserID(ctx)
	if err != nil {
		return ctx.Response().Json(401, goravelhttp.Json{"error": "Unauthorized"})
	}
	ctx.Response().Header("Cache-Control", "no-store")
	return ctx.Response().Json(200, callICEConfig(userID, time.Now(),
		fmt.Sprint(facades.Config().Env("TURN_URLS", "")),
		fmt.Sprint(facades.Config().Env("TURN_SHARED_SECRET", ""))))
}
