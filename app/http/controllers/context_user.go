package controllers

import (
	"errors"
	"strconv"

	"github.com/goravel/framework/contracts/http"
)

// authenticatedUserID safely reads the value written by AuthMiddleware.
func authenticatedUserID(ctx http.Context) (int64, error) {
	value := ctx.Value("userID")
	switch id := value.(type) {
	case int64:
		if id > 0 {
			return id, nil
		}
	case int:
		if id > 0 {
			return int64(id), nil
		}
	case float64:
		if id > 0 {
			return int64(id), nil
		}
	case string:
		parsed, err := strconv.ParseInt(id, 10, 64)
		if err == nil && parsed > 0 {
			return parsed, nil
		}
	}

	return 0, errors.New("authenticated user is missing from request context")
}
