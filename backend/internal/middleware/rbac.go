package middleware

import (
	"net/http"
	"strconv"

	"niyama-backend/internal/models"

	"github.com/gin-gonic/gin"
)

// RequirePermission middleware checks if the user has the required permission
func RequirePermission(permission models.Permission) gin.HandlerFunc {
	return func(c *gin.Context) {
		user := GetUserFromContext(c)
		if user == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
			c.Abort()
			return
		}

		// Check global permissions first
		if user.Role.HasPermission(permission) {
			c.Next()
			return
		}

		// Check organization-specific permissions
		orgIDStr := c.Param("orgId")
		if orgIDStr != "" {
			orgID, err := strconv.ParseUint(orgIDStr, 10, 32)
			if err == nil {
				if hasOrgPermission(user.ID, uint(orgID), permission) {
					c.Next()
					return
				}
			}
		}

		c.JSON(http.StatusForbidden, gin.H{"error": "Insufficient permissions"})
		c.Abort()
	}
}

// RequireOrgRole middleware checks if the user has the required role
func RequireOrgRole(role models.Role) gin.HandlerFunc {
	return func(c *gin.Context) {
		user := GetUserFromContext(c)
		if user == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
			c.Abort()
			return
		}

		// Check if user has the required role in the organization
		orgIDStr := c.Param("orgId")
		if orgIDStr != "" {
			orgID, err := strconv.ParseUint(orgIDStr, 10, 32)
			if err == nil {
				if hasOrgRole(user.ID, uint(orgID), role) {
					c.Next()
					return
				}
			}
		}

		c.JSON(http.StatusForbidden, gin.H{"error": "Insufficient role"})
		c.Abort()
	}
}

// RequireGlobalRole middleware checks if the user has the required global role
func RequireGlobalRole(role models.GlobalUserRole) gin.HandlerFunc {
	return func(c *gin.Context) {
		user := GetUserFromContext(c)
		if user == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
			c.Abort()
			return
		}

		if user.Role != role {
			c.JSON(http.StatusForbidden, gin.H{"error": "Insufficient global role"})
			c.Abort()
			return
		}

		c.Next()
	}
}

// GetUserFromContext extracts user from the gin context
func GetUserFromContext(c *gin.Context) *models.User {
	user, exists := c.Get("user")
	if !exists {
		return nil
	}
	return user.(*models.User)
}

// hasOrgPermission checks if user has permission in organization
func hasOrgPermission(userID, orgID uint, permission models.Permission) bool {
	// This would typically query the database for UserOrganizationRole
	// For now, we'll implement a basic check
	// TODO: Implement database query for organization permissions
	return false
}

// hasOrgRole checks if user has role in organization
func hasOrgRole(userID, orgID uint, role models.Role) bool {
	// This would typically query the database for UserOrganizationRole
	// For now, we'll implement a basic check
	// TODO: Implement database query for organization roles
	return false
}
