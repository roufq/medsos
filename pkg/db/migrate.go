package db

import (
	"database/sql"
	"fmt"
	"log"
	"path/filepath"

	"goravel/pkg/config_legacy"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/mysql"
	_ "github.com/golang-migrate/migrate/v4/source/file"
)

// RunMigrations runs the sql migration files programmatically
func RunMigrations(migrationsDir string) {
	cfg := config_legacy.AppConfig

	// We need a standard sql.DB connection for the migration driver
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?multiStatements=true&charset=utf8mb4&parseTime=True&loc=Local",
		cfg.DBUser, cfg.DBPassword, cfg.DBHost, cfg.DBPort, cfg.DBName)

	dbConn, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Fatalf("Migration connection error: %v", err)
	}
	defer dbConn.Close()

	driver, err := mysql.WithInstance(dbConn, &mysql.Config{})
	if err != nil {
		log.Fatalf("Migration driver error: %v", err)
	}

	absPath, err := filepath.Abs(migrationsDir)
	if err != nil {
		log.Fatalf("Failed to resolve absolute migrations directory path: %v", err)
	}

	sourceURL := fmt.Sprintf("file://%s", filepath.ToSlash(absPath))
	log.Printf("Running migrations from source: %s", sourceURL)

	m, err := migrate.NewWithDatabaseInstance(
		sourceURL,
		cfg.DBName,
		driver,
	)
	if err != nil {
		log.Fatalf("Failed to initialize migrate instance: %v", err)
	}

	if err := m.Up(); err != nil {
		if err == migrate.ErrNoChange {
			log.Println("No database schema migrations to apply.")
		} else {
			log.Fatalf("Failed to apply database migrations: %v", err)
		}
	} else {
		log.Println("Database schema migrations applied successfully!")
	}
}
