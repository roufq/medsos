package controllers

import (
	webpush "github.com/SherClockHolmes/webpush-go"
	http "github.com/goravel/framework/contracts/http"
	"goravel/app/models"
	"goravel/pkg/db"
	"goravel/pkg/notification"
	"gorm.io/gorm/clause"
)

func PushConfig(c http.Context) http.Response {
	key, e := notification.Keys()
	if e != nil {
		return consoleError(c, 503, "Push configuration unavailable")
	}
	return c.Response().Json(200, http.Json{"public_key": key.Public})
}
func PushWorker(c http.Context) http.Response {
	return c.Response().Header("Cache-Control", "no-cache").Header("Service-Worker-Allowed", "/").Data(200, "application/javascript; charset=utf-8", []byte(`self.addEventListener('push',event=>{let data={};try{data=event.data.json()}catch{};event.waitUntil(self.registration.showNotification(data.title||'Postter',{body:data.body||'New notification',icon:'/favicon.svg',data:{url:'/notifications'}}))});self.addEventListener('notificationclick',event=>{event.notification.close();event.waitUntil(clients.openWindow('/notifications'))});`))
}
func PushSubscribe(c http.Context) http.Response {
	userID, _ := authenticatedUserID(c)
	var input webpush.Subscription
	if c.Request().Bind(&input) != nil || !notification.ValidSubscription(input) {
		return consoleError(c, 400, "Invalid push subscription")
	}
	id := notification.SubscriptionID(input.Endpoint)
	if c.Request().Method() == "DELETE" {
		if db.DB.Where("id = ? AND user_id = ?", id, userID).Delete(&models.PushSubscription{}).Error != nil {
			return consoleError(c, 503, "Cannot remove push subscription")
		}
		return c.Response().Json(200, http.Json{"ok": true})
	}
	row := models.PushSubscription{ID: id, UserID: userID, Endpoint: input.Endpoint, Auth: input.Keys.Auth, P256dh: input.Keys.P256dh}
	if db.DB.Clauses(clause.OnConflict{DoNothing: true}).Create(&row).Error != nil {
		return consoleError(c, 503, "Cannot save push subscription")
	}
	var saved models.PushSubscription
	if db.DB.First(&saved, "id = ?", id).Error != nil || saved.UserID != userID {
		return consoleError(c, 409, "Subscription belongs to a different account; unsubscribe first")
	}
	return c.Response().Json(200, http.Json{"ok": true})
}
