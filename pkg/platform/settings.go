package platform

import (
	"errors"
	"goravel/app/models"
	"goravel/pkg/db"
	"gorm.io/gorm"
)

func Settings() (models.PlatformSetting, error) {
	setting := models.PlatformSetting{ID: 1, SiteName: "postter.us", Language: "id", Timezone: "Asia/Jakarta", DefaultFeed: "explore", ItemsPerPage: 20, AnalyticsEnabled: true, AdsEnabled: true, AdminNotifications: true}
	err := db.DB.First(&setting, 1).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		err = nil
	}
	return setting, err
}
