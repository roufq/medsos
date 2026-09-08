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
)

var webhookClient = &http.Client{Timeout: 8 * time.Second}

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
	host := strings.TrimSpace(os.Getenv("MAIL_HOST"))
	port := strings.TrimSpace(os.Getenv("MAIL_PORT"))
	username := os.Getenv("MAIL_USERNAME")
	password := os.Getenv("MAIL_PASSWORD")
	from := strings.TrimSpace(os.Getenv("MAIL_FROM_ADDRESS"))
	if host == "" || port == "" || from == "" {
		return errors.New("SMTP is not configured")
	}
	auth := smtp.PlainAuth("", username, password, host)
	subject := "Verification code"
	body := fmt.Sprintf("Your verification code for %s is %s. This code expires in 10 minutes.", purpose, code)
	message := []byte("To: " + target + "\r\n" +
		"From: " + from + "\r\n" +
		"Subject: " + subject + "\r\n" +
		"MIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\n" + body)
	return smtp.SendMail(host+":"+port, auth, from, []string{target}, message)
}

func sendWebhook(urlEnv, tokenEnv, channel, target, code, purpose string) error {
	endpoint := strings.TrimSpace(os.Getenv(urlEnv))
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
	if token := strings.TrimSpace(os.Getenv(tokenEnv)); token != "" {
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
