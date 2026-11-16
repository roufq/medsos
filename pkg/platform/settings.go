package platform

import (
	"errors"
	"goravel/app/models"
	"goravel/pkg/db"
	"gorm.io/gorm"
)

func Settings() (models.PlatformSetting, error) {
	setting := models.PlatformSetting{ID: 1}
	err := db.DB.First(&setting, 1).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		err = nil
	}
	return setting, err
}
