package jobs

import (
	"errors"
	"fmt"
	"time"

	"goravel/pkg/notify"
)

// SendVerificationCode delivers an already-generated, already-stored
// verification code (email/SMS/WhatsApp) outside the user's request, since
// the underlying SMTP/webhook call can block for several seconds.
type SendVerificationCode struct{}

func (receiver *SendVerificationCode) Signature() string {
	return "send_verification_code"
}

func (receiver *SendVerificationCode) Handle(args ...any) error {
	if len(args) != 4 {
		return errors.New("send_verification_code requires channel, target, code, and purpose")
	}
	channel, ok := args[0].(string)
	if !ok {
		return fmt.Errorf("invalid channel: %v", args[0])
	}
	target, ok := args[1].(string)
	if !ok {
		return fmt.Errorf("invalid target: %v", args[1])
	}
	code, ok := args[2].(string)
	if !ok {
		return fmt.Errorf("invalid code: %v", args[2])
	}
	purpose, ok := args[3].(string)
	if !ok {
		return fmt.Errorf("invalid purpose: %v", args[3])
	}
	return notify.SendVerification(channel, target, code, purpose)
}

func (receiver *SendVerificationCode) ShouldRetry(_ error, attempt int) (bool, time.Duration) {
	if attempt >= 3 {
		return false, 0
	}
	return true, time.Duration(attempt*attempt) * time.Second
}
