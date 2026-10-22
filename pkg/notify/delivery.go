package notify

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/smtp"
	"os"
	"strings"
	"time"

	"github.com/goravel/framework/facades"
)

var webhookClient = &http.Client{Timeout: 8 * time.Second}

func configOrEnv(key string, fallback ...string) string {
	if val := strings.TrimSpace(os.Getenv(key)); val != "" {
		return val
	}
	if facades.Config() != nil {
		if val := strings.TrimSpace(fmt.Sprint(facades.Config().Env(key, ""))); val != "" && val != "<nil>" {
			return val
		}
	}
	if len(fallback) > 0 {
		return fallback[0]
	}
	return ""
}

func SendVerification(channel, target, code, purpose string) error {
	switch strings.ToLower(channel) {
	case "email":
		return sendEmail(target, code, purpose)
	case "sms":
		return sendWebhook("SMS_WEBHOOK_URL", "SMS_WEBHOOK_TOKEN", channel, target, code, purpose)
	case "whatsapp":
		return sendWebhook("WHATSAPP_WEBHOOK_URL", "WHATSAPP_WEBHOOK_TOKEN", channel, target, code, purpose)
	default:
		return errors.New("channel must be email, sms, or whatsapp")
	}
}

func sendEmail(target, code, purpose string) error {
	host := configOrEnv("MAIL_HOST")
	port := configOrEnv("MAIL_PORT", "587")
	username := configOrEnv("MAIL_USERNAME")
	password := configOrEnv("MAIL_PASSWORD")
	from := configOrEnv("MAIL_FROM_ADDRESS")
	if host == "" || port == "" || from == "" {
		return errors.New("SMTP is not configured")
	}
	subject := "Verification code"
	body := fmt.Sprintf("Your verification code for %s is %s. This code expires in 10 minutes.", purpose, code)
	message := []byte("To: " + target + "\r\n" +
		"From: " + from + "\r\n" +
		"Subject: " + subject + "\r\n" +
		"MIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\n" + body)
	address := host + ":" + port
	if username == "" {
		return smtp.SendMail(address, nil, from, []string{target}, message)
	}
	auth := smtp.PlainAuth("", username, password, host)
	return smtp.SendMail(address, auth, from, []string{target}, message)
}

func sendWebhook(urlEnv, tokenEnv, channel, target, code, purpose string) error {
	endpoint := configOrEnv(urlEnv)
	if endpoint == "" {
		return fmt.Errorf("%s is not configured", urlEnv)
	}
	payload, _ := json.Marshal(map[string]string{
		"channel": channel,
		"target":  target,
		"code":    code,
		"purpose": purpose,
	})
	req, err := http.NewRequest(http.MethodPost, endpoint, bytes.NewReader(payload))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	if token := configOrEnv(tokenEnv); token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}
	response, err := webhookClient.Do(req)
	if err != nil {
		return err
	}
	defer response.Body.Close()
	if response.StatusCode < 200 || response.StatusCode >= 300 {
		return fmt.Errorf("notification provider returned HTTP %d", response.StatusCode)
	}
	return nil
}
