package totp

import (
	"encoding/base32"
	"testing"
	"time"
)

func TestRFCVectorsAndReplay(t *testing.T) {
	secret := base32.StdEncoding.WithPadding(base32.NoPadding).EncodeToString([]byte("12345678901234567890"))
	for _, v := range []struct {
		at   int64
		code string
	}{{59, "287082"}, {1111111109, "081804"}, {2000000000, "279037"}} {
		if Code(secret, v.at/30) != v.code {
			t.Fatal("RFC vector failed", v.at)
		}
		counter, ok := Validate(secret, v.code, 0, time.Unix(v.at, 0))
		if !ok {
			t.Fatal("Rejected valid code")
		}
		if _, ok = Validate(secret, v.code, counter, time.Unix(v.at, 0)); ok {
			t.Fatal("Accepted replay")
		}
	}
	if _, ok := Validate(secret, "000000", 0, time.Unix(59, 0)); ok {
		t.Fatal("Accepted invalid code")
	}
}
