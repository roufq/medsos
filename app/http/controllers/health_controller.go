package controllers

import (
	"context"
	"net/http"
	"time"

	goravelhttp "github.com/goravel/framework/contracts/http"

	"goravel/pkg/db"
)

func HealthLive(c goravelhttp.Context) goravelhttp.Response {
	return c.Response().Json(http.StatusOK, goravelhttp.Json{"status": "ok"})
}

func HealthReady(c goravelhttp.Context) goravelhttp.Response {
	if db.DB == nil {
		return c.Response().Json(http.StatusServiceUnavailable, goravelhttp.Json{"status": "not_ready"})
	}

	sqlDB, err := db.DB.DB()
	if err != nil {
		return c.Response().Json(http.StatusServiceUnavailable, goravelhttp.Json{"status": "not_ready"})
	}
	ctx, cancel := context.WithTimeout(context.Background(), time.Second)
	defer cancel()
	if err := sqlDB.PingContext(ctx); err != nil {
		return c.Response().Json(http.StatusServiceUnavailable, goravelhttp.Json{"status": "not_ready"})
	}

	return c.Response().Json(http.StatusOK, goravelhttp.Json{"status": "ready"})
}
