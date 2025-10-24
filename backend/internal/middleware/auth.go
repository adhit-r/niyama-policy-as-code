package middleware

import (
	"net/http"
	"strings"

	"niyama-backend/internal/config"
	"niyama-backend/internal/database"
	"niyama-backend/internal/models"
	"niyama-backend/internal/utils"

	"github.com/gin-gonic/gin"
)

func AuthRequired(cfg *config.Config, db *database.Database) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":   "Unauthorized",
				"message": "Authorization header is required",
			})
			c.Abort()
			return
		}

		// Extract token from "Bearer <token>"
		tokenParts := strings.Split(authHeader, " ")
		if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":   "Unauthorized",
				"message": "Invalid authorization header format",
			})
			c.Abort()
			return
		}

		token := tokenParts[1]

		// Validate JWT token
		claims, err := utils.ValidateJWT(token, cfg.JWT.Secret)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":   "Unauthorized",
				"message": "Invalid or expired token",
			})
			c.Abort()
			return
		}

		// Get user from database
		var user models.User
		if err := db.DB.First(&user, claims.UserID).Error; err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":   "Unauthorized",
				"message": "User not found",
			})
			c.Abort()
			return
		}

		// Check if user is active
		if !user.IsActive {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":   "Unauthorized",
				"message": "User account is inactive",
			})
			c.Abort()
			return
		}

		// Set user in context
		c.Set("user", &user)
		c.Set("user_id", user.ID)
		c.Set("user_email", user.Email)
		c.Set("user_role", string(user.Role))

		c.Next()
	}
}

func RequireLegacyRole(requiredRole string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole, exists := c.Get("user_role")
		if !exists {
			c.JSON(http.StatusForbidden, gin.H{
				"error":   "Forbidden",
				"message": "User role not found",
			})
			c.Abort()
			return
		}

		role := userRole.(string)
		if role != requiredRole && role != "admin" {
			c.JSON(http.StatusForbidden, gin.H{
				"error":   "Forbidden",
				"message": "Insufficient permissions",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}
