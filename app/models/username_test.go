package models

import "testing"

func TestReservedProfileNames(t *testing.T) {
	for _, name := range []string{"home", "admin", "Settings", "api", "login", "explore", "messages"} {
		if !ReservedUsername(name) {
			t.Errorf("reserved name accepted: %s", name)
		}
	}
	if ReservedUsername("msurya03") {
		t.Fatal("ordinary username must remain available")
	}
	if username := GenerateUsername(nil, "admin", "", 0); username == "admin" {
		t.Fatal("generated name must not shadow admin route")
	}
}
