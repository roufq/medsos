package config_legacy

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port             string
	DBHost           string
	DBPort           string
	DBUser           string
	DBPassword       string
	DBName           string
	JWTAccessSecret  string
	JWTRefreshSecret string
	StorageProvider  string
	StorageAPIKey    string
	StorageAPISecret string
}

var AppConfig *Config

// LoadConfig loads environment variables from .env file and populates Config struct
func LoadConfig() {
	// We check if .env exists, if so load it (optional for production since env vars can be injected directly)
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found, loading from system environment variables")
	}

	AppConfig = &Config{
		Port:             getEnv("PORT", "8080"),
		DBHost:           getEnv("DB_HOST", "localhost"),
		DBPort:           getEnv("DB_PORT", "3306"),
		DBUser:           getEnv("DB_USER", "root"),
		DBPassword:       getEnv("DB_PASSWORD", ""),
		DBName:           getEnv("DB_NAME", "facebook_clone"),
		JWTAccessSecret:  getEnv("JWT_ACCESS_SECRET", "facebookclonesecretaccesskey123!"),
		JWTRefreshSecret: getEnv("JWT_REFRESH_SECRET", "facebookclonesecretrefreshkey123!"),
		StorageProvider:  getEnv("STORAGE_PROVIDER", "local"),
		StorageAPIKey:    getEnv("STORAGE_API_KEY", ""),
		StorageAPISecret: getEnv("STORAGE_API_SECRET", ""),
	}
}

func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}
