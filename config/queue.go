package config

import (
	"goravel/app/facades"
)

func init() {
	config := facades.Config()
	config.Add("queue", map[string]any{
		// Default Queue Connection Name
		"default": config.Env("QUEUE_CONNECTION", "database"),

		// Queue Connections
		//
		// Here you may configure the connection information for each server that is used by your application.
		// Drivers: "sync", "database", "custom"
		"connections": map[string]any{
			"sync": map[string]any{
				"driver": "sync",
			},
			"database": map[string]any{
				"driver":      "database",
				"connection":  config.Env("DB_CONNECTION", "mysql"),
				"table":       "jobs",
				"queue":       "default",
				"concurrent":  config.Env("QUEUE_CONCURRENT", 4),
				"retry_after": config.Env("QUEUE_RETRY_AFTER_SECONDS", 90),
			},
		},

		// Failed Queue Jobs
		//
		// These options configure the behavior of failed queue job logging so you
		// can control how and where failed jobs are stored.
		"failed": map[string]any{
			"database": config.Env("DB_CONNECTION", "mysql"),
			"table":    "failed_jobs",
		},
	})
}
