package controllers

import (
	"crypto/hmac"
	"crypto/sha1"
	"encoding/base64"
	goravelhttp "github.com/goravel/framework/contracts/http"
	"github.com/stretchr/testify/require"
	"testing"
	"time"
)

func TestCallSignalsSurviveReadsUntilAcknowledged(t *testing.T) {
	callMu.Lock()
	defer callMu.Unlock()
	previous, sequence := callQueues, callEventSequence
	defer func() { callQueues, callEventSequence = previous, sequence }()
	callQueues = make(map[int64][]callSignalEvent)
	callEventSequence = 0
	queueCallEventLocked(1, callSignalEvent{CallID: "call", SignalType: "answer"})
	queueCallEventLocked(2, callSignalEvent{CallID: "other", SignalType: "offer"})
	queueCallEventLocked(1, callSignalEvent{CallID: "call", SignalType: "candidate"})
	first := pendingCallEventsLocked(1, 0)
	require.Len(t, first, 2)
	require.Equal(t, first, pendingCallEventsLocked(1, 0), "another page or retry must not consume signals")
	remaining := pendingCallEventsLocked(1, first[0].Sequence)
	require.Len(t, remaining, 1)
	require.Equal(t, "candidate", remaining[0].SignalType)
	require.Len(t, pendingCallEventsLocked(2, 0), 1, "acknowledgement must be scoped to the authenticated user")
	require.Empty(t, pendingCallEventsLocked(1, remaining[0].Sequence))
	require.Len(t, first, 2, "response snapshots remain unchanged")
	for i := 0; i < 150; i++ {
		queueCallEventLocked(1, callSignalEvent{})
	}
	require.Len(t, pendingCallEventsLocked(1, 0), 100, "unacknowledged queues stay bounded")
}

func TestCallICEConfigUsesTemporaryTURNAuthentication(t *testing.T) {
	now := time.Unix(1700000000, 0)
	config := callICEConfig(42, now, "turn:relay.example:3478?transport=udp, turns:relay.example:5349,https://invalid", "test-secret")
	require.True(t, config["turn_available"].(bool))
	servers := config["iceServers"].([]goravelhttp.Json)
	require.Len(t, servers, 3)
	turn := servers[2]
	require.Equal(t, []string{"turn:relay.example:3478?transport=udp", "turns:relay.example:5349"}, turn["urls"])
	require.Equal(t, "1700003600:42", turn["username"])
	mac := hmac.New(sha1.New, []byte("test-secret"))
	_, _ = mac.Write([]byte("1700003600:42"))
	require.Equal(t, base64.StdEncoding.EncodeToString(mac.Sum(nil)), turn["credential"])
	for _, values := range [][2]string{{"", ""}, {"turn:relay.example:3478", ""}, {"https://invalid", "secret"}} {
		fallback := callICEConfig(42, now, values[0], values[1])
		require.False(t, fallback["turn_available"].(bool))
		require.Len(t, fallback["iceServers"], 2)
	}
}
