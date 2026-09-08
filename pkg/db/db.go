package db

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"regexp"
	"strconv"
	"strings"
	"time"

	"goravel/app/facades"
	"goravel/app/models"

	_ "github.com/go-sql-driver/mysql" // MySQL driver for raw SQL
	"golang.org/x/crypto/bcrypt"
	gmysql "gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

var safeDatabaseName = regexp.MustCompile(`^[A-Za-z0-9_]+$`)

func envInt(name string, fallback int) int {
	value, err := strconv.Atoi(os.Getenv(name))
	if err != nil || value <= 0 {
		return fallback
	}
	return value
}

// InitDB initializes database connection and handles auto database creation
func InitDB() {
	// 1. Connect without DB name to run CREATE DATABASE IF NOT EXISTS
	host := facades.Config().Env("DB_HOST", "127.0.0.1").(string)
	port := facades.Config().Env("DB_PORT", "3306").(string)
	user := facades.Config().Env("DB_USERNAME", "root").(string)
	password := facades.Config().Env("DB_PASSWORD", "").(string)
	dbName := facades.Config().Env("DB_DATABASE", "facebook_clone").(string)
	if !safeDatabaseName.MatchString(dbName) {
		log.Fatalf("DB_DATABASE may only contain letters, numbers, and underscores")
	}

	dsnWithoutDB := fmt.Sprintf("%s:%s@tcp(%s:%s)/?charset=utf8mb4&parseTime=True&loc=Local",
		user, password, host, port)

	rawDB, err := sql.Open("mysql", dsnWithoutDB)
	if err != nil {
		log.Fatalf("Failed to open connection to MySQL root server: %v", err)
	}
	defer rawDB.Close()

	// Ensure connection is up
	var pingErr error
	for i := 0; i < 5; i++ {
		pingErr = rawDB.Ping()
		if pingErr == nil {
			break
		}
		log.Printf("Waiting for MySQL... attempt %d/5. Error: %v", i+1, pingErr)
		time.Sleep(2 * time.Second)
	}
	if pingErr != nil {
		log.Fatalf("MySQL server is not responding: %v", pingErr)
	}

	// Create database if not exists
	_, err = rawDB.Exec(fmt.Sprintf("CREATE DATABASE IF NOT EXISTS `%s` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;", dbName))
	if err != nil {
		log.Fatalf("Failed to create database: %v", err)
	}
	log.Printf("Database '%s' verified/created successfully.", dbName)

	// 2. Connect with GORM to the specific database
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		user, password, host, port, dbName)

	DB, err = gorm.Open(gmysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database '%s' via GORM: %v", dbName, err)
	}
	sqlDB, err := DB.DB()
	if err != nil {
		log.Fatalf("Failed to configure database pool: %v", err)
	}
	sqlDB.SetMaxIdleConns(envInt("DB_MAX_IDLE_CONNS", 25))
	sqlDB.SetMaxOpenConns(envInt("DB_MAX_OPEN_CONNS", 100))
	sqlDB.SetConnMaxIdleTime(time.Duration(envInt("DB_CONN_MAX_IDLE_SECONDS", 300)) * time.Second)
	sqlDB.SetConnMaxLifetime(time.Duration(envInt("DB_CONN_MAX_LIFETIME_SECONDS", 1800)) * time.Second)

	log.Println("GORM database connection established successfully.")

	// 3. Auto Migrate Models
	err = DB.AutoMigrate(
		&models.User{},
		&models.Post{},
		&models.PostMedia{},
		&models.PostLink{},
		&models.Portfolio{},
		&models.PostLike{},
		&models.PostComment{},
		&models.Follow{},
		&models.JobPosting{},
		&models.JobApplication{},
		&models.Conversation{},
		&models.Message{},
	)
	if err != nil {
		log.Fatalf("Failed to run AutoMigrate: %v", err)
	}
	log.Println("Database AutoMigrate completed successfully.")

	// 4. Seed Default Admin if the database is empty
	var userCount int64
	DB.Model(&models.User{}).Count(&userCount)
	seedAdmin := strings.EqualFold(os.Getenv("SEED_DEFAULT_ADMIN"), "true")
	if userCount == 0 && seedAdmin {
		adminEmail := strings.TrimSpace(os.Getenv("ADMIN_EMAIL"))
		adminPassword := os.Getenv("ADMIN_PASSWORD")
		if adminEmail == "" || len(adminPassword) < 12 {
			log.Fatal("ADMIN_EMAIL and ADMIN_PASSWORD (minimum 12 characters) are required when SEED_DEFAULT_ADMIN=true")
		}
		hashedPassword, hashErr := bcrypt.GenerateFromPassword([]byte(adminPassword), bcrypt.DefaultCost)
		if hashErr != nil {
			log.Fatalf("Failed to hash initial admin password: %v", hashErr)
		}
		title := "System Administrator"
		company := "Connect Modern"
		admin := models.User{
			Name:     "Admin Connect",
			Email:    adminEmail,
			Password: string(hashedPassword),
			Role:     models.RoleAdmin,
			Title:    &title,
			Company:  &company,
		}
		if err := DB.Create(&admin).Error; err != nil {
			log.Printf("Failed to seed admin user: %v", err)
		} else {
			log.Printf("Initial admin user seeded successfully: %s", adminEmail)

			// Optional: Seed a welcome post
			postContent := "Welcome to Connect Modern! This is the first system-generated post. Feel free to explore."
			welcomePost := models.Post{
				UserID:   admin.ID,
				Content:  &postContent,
				PostType: models.PostTypeText,
			}
			DB.Create(&welcomePost)
		}
	}
}
