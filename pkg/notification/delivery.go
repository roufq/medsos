package notification

import (
	"context"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"errors"
	webpush "github.com/SherClockHolmes/webpush-go"
	"goravel/app/models"
	"goravel/pkg/db"
	"goravel/pkg/notify"
	"goravel/pkg/platform"
	"goravel/pkg/totp"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
	"io"
	"log"
	"net/http"
	"net/url"
	"strings"
	"time"
)

func ValidSubscription(s webpush.Subscription) bool {
	u, e := url.Parse(s.Endpoint)
	if e != nil || u.Scheme != "https" || u.User != nil || u.Port() != "" || len(s.Endpoint) > 2000 {
		return false
	}
	allowed := false
	for _, host := range []string{"fcm.googleapis.com", "push.services.mozilla.com", "push.apple.com", "notify.windows.com"} {
		if u.Hostname() == host || strings.HasSuffix(u.Hostname(), "."+host) {
			allowed = true
		}
	}
	auth, e1 := base64.RawURLEncoding.DecodeString(strings.TrimRight(s.Keys.Auth, "="))
	key, e2 := base64.RawURLEncoding.DecodeString(strings.TrimRight(s.Keys.P256dh, "="))
	return allowed && e1 == nil && e2 == nil && len(auth) == 16 && len(key) == 65
}
func Keys() (models.PushKey, error) {
	var key models.PushKey
	if e := db.DB.First(&key, 1).Error; e == nil {
		return key, nil
	} else if !errors.Is(e, gorm.ErrRecordNotFound) {
		return key, e
	}
	private, public, e := webpush.GenerateVAPIDKeys()
	if e != nil {
		return key, e
	}
	encrypted, e := totp.Encrypt(private)
	if e != nil {
		return key, e
	}
	key = models.PushKey{ID: 1, Public: public, Private: encrypted}
	if e = db.DB.Clauses(clause.OnConflict{DoNothing: true}).Create(&key).Error; e != nil {
		return key, e
	}
	return key, db.DB.First(&key, 1).Error
}
func SubscriptionID(endpoint string) string {
	sum := sha256.Sum256([]byte(endpoint))
	return hex.EncodeToString(sum[:])
}

// A committed outbox row is claimed before network calls. Expired leases are retried after crashes.
func Run() {
	for {
		if err := deliverNext(); err != nil {
			log.Printf("notification delivery pending: %v", err)
		}
		time.Sleep(2 * time.Second)
	}
}
func deliverNext() error {
	var row models.NotificationDelivery
	now := time.Now()
	e := db.DB.Transaction(func(tx *gorm.DB) error {
		if e := tx.Clauses(clause.Locking{Strength: "UPDATE", Options: "SKIP LOCKED"}).Where("done = ? AND next_attempt <= ? AND (lease_until IS NULL OR lease_until < ?)", false, now, now).Order("id").First(&row).Error; e != nil {
			return e
		}
		return tx.Model(&row).Updates(map[string]any{"lease_until": now.Add(2 * time.Minute), "attempts": gorm.Expr("attempts + 1")}).Error
	})
	if errors.Is(e, gorm.ErrRecordNotFound) {
		return nil
	}
	if e != nil {
		return e
	}
	var n models.Notification
	var user models.User
	done := false
	if db.DB.First(&n, row.NotificationID).Error != nil || db.DB.First(&user, n.UserID).Error != nil || user.AccountStatus != "active" {
		done = true
	}
	settings, e := platform.Settings()
	if e != nil {
		return e
	}
	emailSent, pushSent := row.EmailSent, row.PushSent
	if !done {
		if !settings.EmailNotifications || !user.EmailNotifications || user.EmailVerifiedAt == nil {
			emailSent = true
		} else if !emailSent {
			e = notify.SendMessageEmail(user.Email, "Postter notification", n.Message+"\n\nOpen Postter to view your notifications.")
			emailSent = e == nil
		}
		if !settings.PushNotifications {
			pushSent = true
		} else if !pushSent {
			subscriptions := []models.PushSubscription{}
			if e = db.DB.Where("user_id = ?", user.ID).Find(&subscriptions).Error; e == nil {
				pushSent = true
				var key models.PushKey
				if len(subscriptions) > 0 {
					key, e = Keys()
				}
				private, decryptErr := totp.Decrypt(key.Private)
				if len(subscriptions) > 0 && (e != nil || decryptErr != nil) {
					pushSent = false
				} else {
					payload, _ := json.Marshal(map[string]string{"title": "Postter", "body": n.Message, "url": "/notifications"})
					client := &http.Client{Timeout: 10 * time.Second, CheckRedirect: func(*http.Request, []*http.Request) error { return http.ErrUseLastResponse }}
					for _, sub := range subscriptions {
						value := webpush.Subscription{Endpoint: sub.Endpoint, Keys: webpush.Keys{Auth: sub.Auth, P256dh: sub.P256dh}}
						if !ValidSubscription(value) {
							db.DB.Delete(&sub)
							continue
						}
						ctx, cancel := context.WithTimeout(context.Background(), 12*time.Second)
						r, err := webpush.SendNotificationWithContext(ctx, payload, &value, &webpush.Options{Subscriber: "https://postter.us", VAPIDPublicKey: key.Public, VAPIDPrivateKey: private, TTL: 3600, HTTPClient: client})
						cancel()
						if err != nil {
							pushSent = false
							continue
						}
						io.Copy(io.Discard, io.LimitReader(r.Body, 4096))
						r.Body.Close()
						if r.StatusCode == 404 || r.StatusCode == 410 {
							db.DB.Delete(&sub)
						} else if r.StatusCode < 200 || r.StatusCode >= 300 {
							pushSent = false
						}
					}
				}
			}
		}
		done = emailSent && pushSent
	}
	return db.DB.Model(&row).Updates(map[string]any{"email_sent": emailSent, "push_sent": pushSent, "done": done || row.Attempts >= 5, "next_attempt": time.Now().Add(time.Duration(row.Attempts+1) * time.Minute), "lease_until": nil}).Error
}
