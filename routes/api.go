package routes

import (
	"github.com/goravel/framework/contracts/route"
	"github.com/goravel/framework/facades"
	"time"

	"goravel/app/helpers"
	"goravel/app/http/controllers"
	"goravel/app/http/middleware"
	"goravel/app/repositories"
	"goravel/app/services"
	"goravel/pkg/db"
)

func Api() {
	// 1. Initialize Repositories
	userRepo := repositories.NewUserRepository()
	postRepo := repositories.NewPostRepository()
	portfolioRepo := repositories.NewPortfolioRepository(db.DB)
	networkRepo := repositories.NewNetworkRepository()
	jobRepo := repositories.NewJobRepository()
	msgRepo := repositories.NewMessageRepository()

	// 2. Initialize Services
	authService := services.NewAuthService(userRepo)
	userService := services.NewUserService(userRepo)
	postService := services.NewPostService(postRepo, userRepo)
	portfolioService := services.NewPortfolioService(portfolioRepo)

	// 3. Initialize Controllers
	localStorage := helpers.GetLocalStorageService()
	authController := controllers.NewAuthController(authService)
	userController := controllers.NewUserController(userService, authService, postService)
	postController := controllers.NewPostController(postService, userController, localStorage)
	portfolioController := controllers.NewPortfolioController(portfolioService)
	networkController := controllers.NewNetworkController(networkRepo)
	jobController := controllers.NewJobController(jobRepo)
	msgController := controllers.NewMessageController(msgRepo)

	// ==========================================
	// REST API Routes (JSON)
	// ==========================================
	api := facades.Route().Prefix("api/v1").Middleware(middleware.ConcurrentLimit(500))

	// Public Auth Endpoints
	api.Middleware(middleware.RateLimit("register", 5, time.Minute)).Post("auth/register", authController.RegisterAPI)
	api.Middleware(middleware.RateLimit("login", 10, time.Minute)).Post("auth/login", authController.LoginAPI)
	api.Middleware(middleware.RateLimit("refresh", 30, time.Minute)).Post("auth/refresh", authController.RefreshAPI)

	// Authenticated Endpoints
	api.Middleware(middleware.AuthMiddleware(), middleware.RateLimit("api", 300, time.Minute)).Group(func(router route.Router) {
		// Auth
		router.Post("auth/logout", authController.LogoutAPI)

		// Users
		router.Get("users/{id}", userController.GetProfileAPI)
		router.Put("users/profile", userController.UpdateProfileAPI)

		// Posts
		router.Post("posts", postController.CreatePostAPI)
		router.Get("posts", postController.GetFeedAPI)
		router.Delete("posts/{id}", postController.DeletePostAPI)
		router.Get("posts/link-preview", postController.GetLinkPreviewAPI)
		router.Post("posts/{id}/like", postController.LikePostAPI)
		router.Post("posts/{id}/comment", postController.CommentPostAPI)

		// Uploads
		router.Post("media/upload", postController.UploadMediaAPI)

		// Portfolios
		router.Get("users/{id}/portfolios", portfolioController.GetPortfolios)
		router.Post("users/profile/portfolios", portfolioController.CreatePortfolio)
		router.Delete("users/profile/portfolios/{id}", portfolioController.DeletePortfolio)

		// Network
		router.Get("network/connections", networkController.GetConnections)
		router.Get("network/requests", networkController.GetPendingRequests)
		router.Get("network/suggestions", networkController.GetSuggestions)
		router.Post("network/request", networkController.SendRequest)
		router.Post("network/accept", networkController.AcceptRequest)
		router.Post("network/decline", networkController.DeclineRequest)

		// Jobs
		router.Get("jobs", jobController.GetAllJobs)
		router.Post("jobs/apply", jobController.ApplyJob)

		// Messages
		router.Get("messages/conversations", msgController.GetConversations)
		router.Get("messages", msgController.GetMessages)
		router.Post("messages", msgController.SendMessage)

		// Admin Operations
		router.Middleware(middleware.AdminMiddleware()).Group(func(admin route.Router) {
			admin.Get("admin/stats", userController.AdminGetStatsAPI)
			admin.Get("admin/users", userController.AdminGetUsersAPI)
		})
	})
}
