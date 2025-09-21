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

	// Initialize database connections (optional for development)
	db, err := database.Initialize(cfg)
	if err != nil {
		log.Printf("Warning: Database connection failed: %v", err)
		log.Println("Running in development mode without database")
		db = nil
	}

	// Initialize services
	services := services.NewServices(db, cfg)

	// Initialize handlers
	handlers := handlers.NewHandlers(services)

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

	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func setupRouter(handlers *handlers.Handlers, cfg *config.Config, db *database.Database) *gin.Engine {
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

	// API routes (no auth required for development)
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

		// Policy routes (no auth required for development)
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
		}

		// Template routes (no auth required for development)
		templates := api.Group("/templates")
		{
			templates.GET("", handlers.Template.GetTemplates)
			templates.GET("/:id", handlers.Template.GetTemplate)
			templates.POST("", handlers.Template.CreateTemplate)
			templates.PUT("/:id", handlers.Template.UpdateTemplate)
			templates.DELETE("/:id", handlers.Template.DeleteTemplate)
		}

		// Compliance routes (no auth required for development)
		compliance := api.Group("/compliance")
		{
			compliance.GET("/frameworks", handlers.Compliance.GetFrameworks)
			compliance.GET("/frameworks/:id", handlers.Compliance.GetFramework)
			compliance.GET("/reports", handlers.Compliance.GetReports)
			compliance.POST("/reports", handlers.Compliance.GenerateReport)
		}

		// AI routes (no auth required for development)
		ai := api.Group("/ai")
		{
			ai.POST("/generate-policy", handlers.AI.GeneratePolicy)
			ai.POST("/optimize-policy/:id", handlers.AI.OptimizePolicy)
		}

		// Monitoring routes (no auth required for development)
		monitoring := api.Group("/monitoring")
		{
			monitoring.GET("/metrics", handlers.Monitoring.GetMetrics)
			monitoring.GET("/alerts", handlers.Monitoring.GetAlerts)
		}

		// User routes (no auth required for development)
		users := api.Group("/users")
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
