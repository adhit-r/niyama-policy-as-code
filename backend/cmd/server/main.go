package main

import (
	"flag"
	"log"
	"os"
	"path/filepath"

	"niyama-backend/internal/cache"
	"niyama-backend/internal/config"
	"niyama-backend/internal/database"
	"niyama-backend/internal/handlers"
	"niyama-backend/internal/middleware"
	"niyama-backend/internal/services"
	"niyama-backend/internal/websocket"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Parse command line flags
	var (
		migrate = flag.Bool("migrate", false, "Run database migrations")
		seed    = flag.Bool("seed", false, "Seed database with initial data")
		env     = flag.String("env", "development", "Environment (development, staging, production)")
	)
	flag.Parse()

	// Load environment-specific configuration
	loadEnvironmentConfig(*env)

	// Load configuration
	cfg := config.Load()

	// Initialize database connections
	db, err := database.Initialize(cfg)
	if err != nil {
		log.Printf("❌ Database connection failed: %v", err)
		if *migrate || *seed {
			log.Fatal("Database connection required for migration/seeding")
		}
		log.Println("Running in development mode without database")
		db = nil
	}

	// Initialize cache
	_, err = cache.NewCache(cfg.Redis.URL)
	if err != nil {
		log.Printf("⚠️  Cache initialization failed: %v", err)
	}

	// Handle migration command
	if *migrate {
		if db == nil {
			log.Fatal("Database connection required for migration")
		}
		log.Println("✅ Database migrations completed")
		return
	}

	// Handle seeding command
	if *seed {
		if db == nil {
			log.Fatal("Database connection required for seeding")
		}
		if err := database.Seed(db.DB); err != nil {
			log.Fatalf("❌ Database seeding failed: %v", err)
		}
		return
	}

	// Initialize websocket hub
	hub := websocket.NewHub()
	go hub.Run()

	// Initialize services
	services := services.NewServices(db, cfg, hub)

	// Initialize handlers
	handlers := handlers.NewHandlers(services, hub)

	// Setup Gin router
	router := setupRouter(handlers, cfg, db)

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8000"
	}

	log.Printf("🚀 Niyama Backend API starting on port %s", port)
	log.Printf("📚 API Documentation available at http://localhost:%s/docs", port)
	log.Printf("🏥 Health check available at http://localhost:%s/health", port)
	log.Printf("🌍 Environment: %s", *env)

	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func loadEnvironmentConfig(env string) {
	// Try to load environment-specific config first
	configPath := filepath.Join("config", env, ".env")
	if err := godotenv.Load(configPath); err != nil {
		log.Printf("No environment-specific config found at %s, trying root .env", configPath)

		// Fallback to root .env file
		if err := godotenv.Load(); err != nil {
			log.Println("No .env file found, using system environment variables")
		}
	} else {
		log.Printf("✅ Loaded environment config from %s", configPath)
	}
}

func setupRouter(handlers *handlers.Handlers, cfg *config.Config, db *database.Database) *gin.Engine {
	// Set Gin mode based on environment
	switch cfg.Environment {
	case "production":
		gin.SetMode(gin.ReleaseMode)
	case "staging":
		gin.SetMode(gin.ReleaseMode)
	default:
		gin.SetMode(gin.DebugMode)
	}

	router := gin.New()

	// Global middleware
	router.Use(gin.Logger())
	router.Use(gin.Recovery())
	router.Use(middleware.CORS(cfg))
	router.Use(middleware.RateLimit())
	router.Use(middleware.SecurityHeaders())

	// Health check
	router.GET("/health", handlers.Health.HealthCheck)

	// API routes
	api := router.Group("/api/v1")
	{
		// Auth routes
		auth := api.Group("/auth")
		{
			auth.POST("/login", handlers.Auth.Login)
			auth.POST("/register", handlers.Auth.Register)
			auth.POST("/refresh", handlers.Auth.RefreshToken)
			auth.GET("/me", middleware.AuthRequired(cfg, db), handlers.Auth.GetCurrentUser)
			auth.POST("/logout", middleware.AuthRequired(cfg, db), handlers.Auth.Logout)
		}

		// Policy routes
		policies := api.Group("/policies")
		{
			policies.GET("", handlers.Policy.GetPolicies)
			policies.GET("/:id", handlers.Policy.GetPolicy)
			policies.POST("", handlers.Policy.CreatePolicy)
			policies.PUT("/:id", handlers.Policy.UpdatePolicy)
			policies.DELETE("/:id", handlers.Policy.DeletePolicy)
			policies.POST("/:id/evaluate", handlers.Policy.EvaluatePolicy)
			policies.POST("/save", handlers.Policy.SavePolicy)
			policies.POST("/test", handlers.Policy.TestPolicy)

			// Policy version routes
			policies.GET("/:id/versions", handlers.Policy.GetPolicyVersions)
			policies.GET("/:id/versions/:version", handlers.Policy.GetPolicyVersion)
			policies.POST("/:id/rollback/:version", handlers.Policy.RollbackPolicyVersion)
			policies.GET("/:id/diff/:v1/:v2", handlers.Policy.ComparePolicyVersions)
		}

		// History route (for frontend compatibility)
		api.GET("/history", handlers.Policy.GetEvaluationHistory)

		// Webhook routes (only if handler exists)
		if handlers.Webhook != nil {
			webhooks := api.Group("/webhooks")
			{
				webhooks.POST("", handlers.Webhook.CreateWebhook)
				webhooks.GET("", handlers.Webhook.GetWebhooks)
				webhooks.GET("/:id", handlers.Webhook.GetWebhook)
				webhooks.PUT("/:id", handlers.Webhook.UpdateWebhook)
				webhooks.DELETE("/:id", handlers.Webhook.DeleteWebhook)
				webhooks.GET("/:id/events", handlers.Webhook.GetWebhookEvents)
				webhooks.POST("/:id/test", handlers.Webhook.TestWebhook)
				webhooks.POST("/retry", handlers.Webhook.RetryFailedWebhooks)
			}
		}

		// WebSocket routes
		router.GET("/ws", handlers.WebSocket.Connect)
		router.GET("/ws/stats", handlers.WebSocket.GetStats)

		// Notification routes (only if handler exists)
		if handlers.Notification != nil {
			notifications := api.Group("/notifications")
			{
				notifications.GET("", handlers.Notification.GetNotifications)
				notifications.GET("/unread-count", handlers.Notification.GetUnreadCount)
				notifications.PUT("/:id/read", handlers.Notification.MarkAsRead)
				notifications.PUT("/read-all", handlers.Notification.MarkAllAsRead)
				notifications.PUT("/:id/archive", handlers.Notification.ArchiveNotification)
				notifications.DELETE("/:id", handlers.Notification.DeleteNotification)
			}
		}

		// Activity routes (only if handler exists)
		if handlers.Notification != nil {
			activities := api.Group("/activities")
			{
				activities.GET("", handlers.Notification.GetActivities)
			}
		}

		// Template routes
		templates := api.Group("/templates")
		{
			templates.GET("", handlers.Template.GetTemplates)
			templates.GET("/:id", handlers.Template.GetTemplate)
			templates.POST("", handlers.Template.CreateTemplate)
			templates.PUT("/:id", handlers.Template.UpdateTemplate)
			templates.DELETE("/:id", handlers.Template.DeleteTemplate)
		}

		// Compliance routes
		compliance := api.Group("/compliance")
		{
			compliance.GET("/frameworks", handlers.Compliance.GetFrameworks)
			compliance.GET("/frameworks/:id", handlers.Compliance.GetFramework)
			compliance.GET("/reports", handlers.Compliance.GetReports)
			compliance.POST("/reports", handlers.Compliance.GenerateReport)
		}

		// AI routes
		ai := api.Group("/ai")
		{
			ai.POST("/generate-policy", handlers.AI.GeneratePolicy)
			ai.POST("/optimize-policy/:id", handlers.AI.OptimizePolicy)
		}

		// Monitoring routes
		monitoring := api.Group("/monitoring")
		{
			monitoring.GET("/metrics", handlers.Monitoring.GetMetrics)
			monitoring.GET("/alerts", handlers.Monitoring.GetAlerts)
		}

		// User routes
		users := api.Group("/users")
		{
			users.GET("", handlers.User.GetUsers)
			users.GET("/:id", handlers.User.GetUser)
			users.PUT("/:id", handlers.User.UpdateUser)
			users.DELETE("/:id", handlers.User.DeleteUser)
		}

		// User stats route (for frontend compatibility)
		api.GET("/user/stats", handlers.User.GetUserStats)

		// Validation routes
		validate := api.Group("/validate")
		{
			validate.POST("/iac", handlers.Validator.ValidateIaC)
		}

		// Detect route (for frontend compatibility)
		api.POST("/detect/test-upload", handlers.Validator.ValidateIaC)

		// Evidence routes
		evidence := api.Group("/evidence")
		{
			evidence.GET("/export", handlers.Evidence.ExportEvidence)
		}

		// Scanner routes
		scanner := api.Group("/scanner")
		{
			scanner.POST("/scan", handlers.Scanner.ScanCloudResources)
			scanner.GET("/scans", handlers.Scanner.GetScanHistory)
			scanner.GET("/scans/:id", handlers.Scanner.GetScanResult)
		}

		// Drift detection routes
		drift := api.Group("/drift")
		{
			drift.POST("/detect", handlers.Drift.DetectDrift)
			drift.GET("/history", handlers.Drift.GetDriftHistory)
			drift.GET("/results/:id", handlers.Drift.GetDriftResult)
			drift.GET("/timeline", handlers.Drift.GetDriftTimeline)
		}

		// Scheduler routes
		scheduler := api.Group("/scheduler")
		{
			scheduler.POST("/schedules", handlers.Scheduler.CreateScanSchedule)
			scheduler.GET("/schedules", handlers.Scheduler.ListScanSchedules)
			scheduler.GET("/schedules/:id", handlers.Scheduler.GetScanSchedule)
			scheduler.PUT("/schedules/:id", handlers.Scheduler.UpdateScanSchedule)
			scheduler.DELETE("/schedules/:id", handlers.Scheduler.DeleteScanSchedule)
			scheduler.POST("/trigger", handlers.Scheduler.TriggerScan)
			scheduler.POST("/cronjobs", handlers.Scheduler.CreateCronJob)
			scheduler.GET("/cronjobs", handlers.Scheduler.ListCronJobs)
			scheduler.GET("/scheduled", handlers.Scheduler.GetScheduledScans)
		}

		// Organization routes (will be added in Task 3.2)
		// organizations := api.Group("/organizations")
		// {
		//     organizations.GET("", handlers.Organization.GetOrganizations)
		//     organizations.POST("", handlers.Organization.CreateOrganization)
		//     organizations.GET("/:id", handlers.Organization.GetOrganization)
		//     organizations.PUT("/:id", handlers.Organization.UpdateOrganization)
		//     organizations.DELETE("/:id", handlers.Organization.DeleteOrganization)
		//     organizations.GET("/:id/users", handlers.Organization.GetOrganizationUsers)
		//     organizations.POST("/:id/invite", handlers.Organization.InviteUser)
		// }
	}

	// 404 handler
	router.NoRoute(func(c *gin.Context) {
		c.JSON(404, gin.H{
			"error":     "Not Found",
			"message":   "Route not found",
			"path":      c.Request.URL.Path,
			"timestamp": gin.H{},
		})
	})

	return router
}
