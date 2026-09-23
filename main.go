package main

import (
	"log"

	"github.com/goravel/framework/contracts/queue"

	"goravel/app/facades"
	"goravel/bootstrap"
	"goravel/pkg/db"
	"goravel/pkg/jwt"
)

func main() {
	// This bootstraps the framework and gets it ready for use.
	app := bootstrap.Boot()
	if err := jwt.ValidateConfiguration(); err != nil {
		log.Fatalf("Unsafe authentication configuration: %v", err)
	}

	// Initialize the legacy GORM DB connection
	db.InitDB()

	// Run background jobs (link preview fetch, media transcode, ...) from the
	// "default" queue in-process, since this deployment does not run a
	// separate `queue:work` worker process.
	go func() {
		worker := facades.Queue().Worker(queue.Args{Queue: "default"})
		if err := worker.Run(); err != nil {
			log.Printf("queue worker stopped: %v", err)
		}
	}()

	// Start http server
	app.Start()
}
