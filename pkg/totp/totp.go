package totp

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha1"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/base32"
	"encoding/base64"
	"encoding/binary"
	"errors"
	"fmt"
	"goravel/app/facades"
	"io"
	"strings"
	"time"
)

func NewSecret() (string, error) {
	b := make([]byte, 20)
	if _, e := rand.Read(b); e != nil {
		return "", e
	}
	return base32.StdEncoding.WithPadding(base32.NoPadding).EncodeToString(b), nil
}
func Code(secret string, counter int64) string {
	key, e := base32.StdEncoding.WithPadding(base32.NoPadding).DecodeString(secret)
	if e != nil {
		return ""
	}
	b := make([]byte, 8)
	binary.BigEndian.PutUint64(b, uint64(counter))
	mac := hmac.New(sha1.New, key)
	mac.Write(b)
	sum := mac.Sum(nil)
	offset := sum[len(sum)-1] & 15
	return fmt.Sprintf("%06d", (binary.BigEndian.Uint32(sum[offset:offset+4])&0x7fffffff)%1000000)
}
func Validate(secret, code string, last int64, now time.Time) (int64, bool) {
	if len(code) != 6 {
		return 0, false
	}
	for _, r := range code {
		if r < '0' || r > '9' {
			return 0, false
		}
	}
	for n := int64(-1); n <= 1; n++ {
		counter := now.Unix()/30 + n
		if counter > last && subtle.ConstantTimeCompare([]byte(Code(secret, counter)), []byte(code)) == 1 {
			return counter, true
		}
	}
	return 0, false
}
func aead() (cipher.AEAD, error) {
	secret := fmt.Sprint(facades.Config().Env("JWT_SECRET", ""))
	if len(strings.TrimSpace(secret)) < 32 {
		return nil, errors.New("Invalid encryption key")
	}
	key := sha256.Sum256([]byte("postter/totp/" + secret))
	block, e := aes.NewCipher(key[:])
	if e != nil {
		return nil, e
	}
	return cipher.NewGCM(block)
}
func Encrypt(value string) (string, error) {
	a, e := aead()
	if e != nil {
		return "", e
	}
	nonce := make([]byte, a.NonceSize())
	if _, e = io.ReadFull(rand.Reader, nonce); e != nil {
		return "", e
	}
	return base64.RawStdEncoding.EncodeToString(a.Seal(nonce, nonce, []byte(value), nil)), nil
}
func Decrypt(value string) (string, error) {
	a, e := aead()
	if e != nil {
		return "", e
	}
	b, e := base64.RawStdEncoding.DecodeString(value)
	if e != nil || len(b) < a.NonceSize() {
		return "", errors.New("Invalid encrypted secret")
	}
	b, e = a.Open(nil, b[:a.NonceSize()], b[a.NonceSize():], nil)
	return string(b), e
}
