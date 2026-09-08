package main

import (
	"goravel/bootstrap"
	"goravel/pkg/db"
	"goravel/pkg/jwt"
	"log"
)

func main() {
	// This bootstraps the framework and gets it ready for use.
	app := bootstrap.Boot()
	if err := jwt.ValidateConfiguration(); err != nil {
		log.Fatalf("Unsafe authentication configuration: %v", err)
	}

	// Initialize the legacy GORM DB connection
	db.InitDB()

	// Start http server
	app.Start()
}
