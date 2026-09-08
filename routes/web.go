package routes

import (
	"time"

	"github.com/goravel/framework/contracts/http"
	"github.com/goravel/framework/facades"

	"goravel/app/helpers"
	"goravel/app/http/controllers"
	"goravel/app/http/middleware"
	"goravel/app/repositories"
	"goravel/app/services"
)

func Web() {
	// 1. Initialize Repositories
	userRepo := repositories.NewUserRepository()
	postRepo := repositories.NewPostRepository()

	// 2. Initialize Services
	authService := services.NewAuthService(userRepo)
	userService := services.NewUserService(userRepo)
	postService := services.NewPostService(postRepo, userRepo)

	// 3. Initialize Controllers
	localStorage := helpers.GetLocalStorageService()
	authController := controllers.NewAuthController(authService)
	userController := controllers.NewUserController(userService, authService, postService)
	postController := controllers.NewPostController(postService, userController, localStorage)

	facades.Route().Static("uploads", "./uploads")

	// Serve Frontend Static Assets
	facades.Route().Static("frontend/dist", "./frontend/dist")

	// ==========================================
	// SSR Web View Routes (HTML)
	// ==========================================
	web := facades.Route().Prefix("web").Middleware(middleware.ConcurrentLimit(300), middleware.RateLimit("web", 180, time.Minute))

	web.Get("login", authController.ShowLoginWeb)
	web.Middleware(middleware.RateLimit("web-login", 10, time.Minute)).Post("login", authController.HandleLoginWeb)
	web.Get("register", authController.ShowRegisterWeb)
	web.Middleware(middleware.RateLimit("web-register", 5, time.Minute)).Post("register", authController.HandleRegisterWeb)
	web.Get("logout", authController.HandleLogoutWeb)

	web.Get("beranda", postController.ShowBerandaWeb)
	web.Post("beranda", postController.HandleCreatePostWeb)
	web.Get("profile", userController.ShowProfileWeb)
	web.Get("profile/{id}", userController.ShowProfileWeb)

	// Admin Dashboard SSR Views
	web.Get("admin/dashboard", userController.ShowAdminDashboardWeb)
	web.Get("admin/users", userController.ShowAdminUsersWeb)
	web.Get("admin/posts", userController.ShowAdminPostsWeb)
	web.Post("admin/posts/{id}/delete", userController.HandleAdminDeletePostWeb)
	web.Get("admin/moderation", userController.ShowAdminModerationWeb)
	web.Get("admin/settings", userController.ShowAdminSettingsWeb)

	// ==========================================
	// SPA Frontend Catch-All Route
	// ==========================================
	// Any unmatched route will be sent to the React frontend index.html
	facades.Route().Fallback(func(c http.Context) http.Response {
		return c.Response().File("./frontend/dist/index.html")
	})
}
