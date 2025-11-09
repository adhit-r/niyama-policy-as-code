package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type HealthHandler struct{}

func NewHealthHandler() *HealthHandler {
	return &HealthHandler{}
}

func (h *HealthHandler) HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":      "healthy",
		"timestamp":   time.Now().UTC().Format(time.RFC3339),
		"version":     "1.0.0",
		"environment": "development",
		"service":     "niyama-backend",
	})
}
