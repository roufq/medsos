package notification

import (
	"encoding/base64"
	webpush "github.com/SherClockHolmes/webpush-go"
	"strings"
	"testing"
)

func TestPushSubscriptionsRejectInternalAndArbitraryDestinations(t *testing.T) {
	s := webpush.Subscription{Endpoint: "https://fcm.googleapis.com/fcm/send/test", Keys: webpush.Keys{Auth: base64.RawURLEncoding.EncodeToString([]byte(strings.Repeat("a", 16))), P256dh: base64.RawURLEncoding.EncodeToString([]byte(strings.Repeat("b", 65)))}}
	if !ValidSubscription(s) {
		t.Fatal("Valid provider rejected")
	}
	for _, endpoint := range []string{"http://fcm.googleapis.com/a", "https://127.0.0.1/a", "https://attacker.test/a", "https://fcm.googleapis.com.attacker.test/a", "https://user:password@fcm.googleapis.com/a"} {
		s.Endpoint = endpoint
		if ValidSubscription(s) {
			t.Fatal("Unsafe push destination allowed", endpoint)
		}
	}
}
