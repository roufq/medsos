package helpers

import (
	"github.com/goravel/framework/facades"
	"goravel/pkg/storage"
)

// GetLocalStorageService initializes storage service dynamically based on environment configuration
func GetLocalStorageService() storage.StorageService {
	appURL := facades.Config().Env("APP_URL", "http://localhost").(string)
	if port := facades.Config().Env("APP_PORT", ""); port != "" && appURL == "http://localhost" {
		appURL = appURL + ":" + port.(string)
	}
	return storage.NewLocalStorageService("./uploads", appURL)
}
