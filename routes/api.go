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
	accountController := controllers.NewAccountController()
	socialController := controllers.NewSocialController()
	oauthController := controllers.NewOAuthController()

	// ==========================================
	// REST API Routes (JSON)
	// ==========================================
	api := facades.Route().Prefix("api/v1").Middleware(middleware.ConcurrentLimit(500))
	api.Get("health/live", controllers.HealthLive)
	api.Get("health/ready", controllers.HealthReady)

	// Public Auth Endpoints
	api.Middleware(middleware.RateLimit("register", 5, time.Minute)).Post("auth/register", authController.RegisterAPI)
	api.Middleware(middleware.RateLimit("login", 10, time.Minute)).Post("auth/login", authController.LoginAPI)
	api.Middleware(middleware.RateLimit("refresh", 30, time.Minute)).Post("auth/refresh", authController.RefreshAPI)
	api.Middleware(middleware.RateLimit("forgot-password", 5, time.Minute)).Post("auth/password/forgot", accountController.ForgotPassword)
	api.Middleware(middleware.RateLimit("reset-password", 10, time.Minute)).Post("auth/password/reset", accountController.ResetPassword)
	api.Middleware(middleware.RateLimit("reactivate", 5, time.Minute)).Post("auth/account/reactivate", accountController.ReactivateAccount)
	api.Middleware(middleware.RateLimit("oauth-start", 30, time.Minute)).Get("auth/oauth/{provider}/start", oauthController.Start)
	api.Middleware(middleware.RateLimit("oauth-callback", 30, time.Minute)).Get("auth/oauth/{provider}/callback", oauthController.Callback)
	api.Middleware(middleware.RateLimit("oauth-callback", 30, time.Minute)).Post("auth/oauth/{provider}/callback", oauthController.Callback)
	api.Get("embed/posts/{id}", socialController.EmbedPost)

	// Authenticated Endpoints
	api.Middleware(middleware.AuthMiddleware(), middleware.RateLimit("api", 300, time.Minute)).Group(func(router route.Router) {
		// Auth
		router.Post("auth/logout", authController.LogoutAPI)
		router.Put("auth/password", accountController.ChangePassword)
		router.Post("auth/verification/request", accountController.RequestVerification)
		router.Post("auth/verification/confirm", accountController.ConfirmVerification)

		// Users
		router.Get("users/{id}", userController.GetProfileAPI)
		router.Put("users/profile", userController.UpdateProfileAPI)
		router.Put("users/settings", accountController.UpdateSettings)
		router.Post("users/account/delete", accountController.DeleteAccount)
		router.Post("users/{id}/block", accountController.BlockUser)
		router.Delete("users/{id}/block", accountController.UnblockUser)
		router.Get("users/blocked", accountController.BlockedUsers)
		router.Post("users/{id}/follow", socialController.Follow)
		router.Delete("users/{id}/follow", socialController.Unfollow)
		router.Get("users/{id}/followers", socialController.Followers)
		router.Get("users/{id}/following", socialController.Following)
		router.Get("users/saved-posts", socialController.SavedPosts)

		// Posts
		router.Post("posts", postController.CreatePostAPI)
		router.Get("posts", postController.GetFeedAPI)
		router.Delete("posts/{id}", postController.DeletePostAPI)
		router.Put("posts/{id}", socialController.EditPost)
		router.Middleware(middleware.ConcurrentLimit(20), middleware.RateLimit("link-preview", 30, time.Minute)).Get("posts/link-preview", postController.GetLinkPreviewAPI)
		router.Post("posts/{id}/like", postController.LikePostAPI)
		router.Post("posts/{id}/comment", postController.CommentPostAPI)
		router.Get("posts/{id}/comments", socialController.Comments)
		router.Post("posts/{id}/comments/reply", socialController.ReplyComment)
		router.Put("comments/{id}", socialController.EditComment)
		router.Delete("comments/{id}", socialController.DeleteComment)
		router.Post("posts/{id}/save", socialController.ToggleSave)
		router.Post("posts/{id}/repost", socialController.Repost)
		router.Post("posts/{id}/share", socialController.Share)
		router.Post("posts/{id}/report", socialController.Report)
		router.Post("posts/{id}/view", socialController.RecordView)
		router.Get("posts/{id}/embed-code", socialController.EmbedCode)
		router.Get("search", socialController.Search)
		router.Get("notifications", socialController.Notifications)
		router.Put("notifications/{id}/read", socialController.ReadNotification)

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
			admin.Get("admin/reports", socialController.AdminReports)
			admin.Put("admin/reports/{id}", socialController.ReviewReport)
			admin.Post("admin/users/{id}/block", socialController.AdminBlockUser)
			admin.Delete("admin/users/{id}/block", socialController.AdminUnblockUser)
		})
	})
}
