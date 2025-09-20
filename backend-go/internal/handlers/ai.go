package handlers

import (
	"net/http"

	"niyama-backend/internal/services"

	"github.com/gin-gonic/gin"
)

type AIHandler struct {
	service *services.AIService
}

func NewAIHandler(service *services.AIService) *AIHandler {
	return &AIHandler{service: service}
}

func (h *AIHandler) GeneratePolicy(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Generate policy - TODO"})
}

func (h *AIHandler) OptimizePolicy(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Optimize policy - TODO"})
}
