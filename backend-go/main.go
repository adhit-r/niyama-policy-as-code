package main

import (
	"log"
	"os"

	"niyama-backend/internal/config"
	"niyama-backend/internal/database"
	"niyama-backend/internal/handlers"
	"niyama-backend/internal/middleware"
	"niyama-backend/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	// Load configuration
	cfg := config.Load()

	// Initialize database connections
	db, err := database.Initialize(cfg)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	// Initialize services
	services := services.NewServices(db, cfg)

	// Initialize handlers
	handlers := handlers.NewHandlers(services)

	// Setup Gin router
	router := setupRouter(handlers, cfg)

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8000"
	}

	log.Printf("🚀 Niyama Backend API starting on port %s", port)
	log.Printf("📚 API Documentation available at http://localhost:%s/docs", port)
	log.Printf("🏥 Health check available at http://localhost:%s/health", port)

	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func setupRouter(handlers *handlers.Handlers, cfg *config.Config) *gin.Engine {
	// Set Gin mode
	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
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
			auth.GET("/me", middleware.AuthRequired(cfg), handlers.Auth.GetCurrentUser)
			auth.POST("/logout", middleware.AuthRequired(cfg), handlers.Auth.Logout)
		}

		// Policy routes
		policies := api.Group("/policies")
		policies.Use(middleware.AuthRequired(cfg))
		{
			policies.GET("", handlers.Policy.GetPolicies)
			policies.GET("/:id", handlers.Policy.GetPolicy)
			policies.POST("", handlers.Policy.CreatePolicy)
			policies.PUT("/:id", handlers.Policy.UpdatePolicy)
			policies.DELETE("/:id", handlers.Policy.DeletePolicy)
			policies.POST("/:id/evaluate", handlers.Policy.EvaluatePolicy)
		}

		// Template routes
		templates := api.Group("/templates")
		templates.Use(middleware.AuthRequired(cfg))
		{
			templates.GET("", handlers.Template.GetTemplates)
			templates.GET("/:id", handlers.Template.GetTemplate)
			templates.POST("", handlers.Template.CreateTemplate)
			templates.PUT("/:id", handlers.Template.UpdateTemplate)
			templates.DELETE("/:id", handlers.Template.DeleteTemplate)
		}

		// Compliance routes
		compliance := api.Group("/compliance")
		compliance.Use(middleware.AuthRequired(cfg))
		{
			compliance.GET("/frameworks", handlers.Compliance.GetFrameworks)
			compliance.GET("/frameworks/:id", handlers.Compliance.GetFramework)
			compliance.GET("/reports", handlers.Compliance.GetReports)
			compliance.POST("/reports", handlers.Compliance.GenerateReport)
		}

		// AI routes
		ai := api.Group("/ai")
		ai.Use(middleware.AuthRequired(cfg))
		{
			ai.POST("/generate-policy", handlers.AI.GeneratePolicy)
			ai.POST("/optimize-policy/:id", handlers.AI.OptimizePolicy)
		}

		// BitNet AI routes
		bitnet := api.Group("/bitnet")
		bitnet.Use(middleware.AuthRequired(cfg))
		{
			bitnet.POST("/generate-policy", handlers.BitNet.GeneratePolicy)
			bitnet.POST("/analyze-policy", handlers.BitNet.AnalyzePolicy)
			bitnet.POST("/explain-policy", handlers.BitNet.ExplainPolicy)
			bitnet.POST("/validate-policy", handlers.BitNet.ValidatePolicy)
			bitnet.POST("/optimize-policy", handlers.BitNet.OptimizePolicy)
			bitnet.POST("/check-compliance", handlers.BitNet.CheckCompliance)
			bitnet.GET("/frameworks", handlers.BitNet.GetSupportedFrameworks)
			bitnet.GET("/languages", handlers.BitNet.GetSupportedLanguages)
		}

		// Monitoring routes
		monitoring := api.Group("/monitoring")
		monitoring.Use(middleware.AuthRequired(cfg))
		{
			monitoring.GET("/metrics", handlers.Monitoring.GetMetrics)
			monitoring.GET("/alerts", handlers.Monitoring.GetAlerts)
		}

		// User routes
		users := api.Group("/users")
		users.Use(middleware.AuthRequired(cfg))
		{
			users.GET("", handlers.User.GetUsers)
			users.GET("/:id", handlers.User.GetUser)
			users.PUT("/:id", handlers.User.UpdateUser)
			users.DELETE("/:id", handlers.User.DeleteUser)
		}
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
