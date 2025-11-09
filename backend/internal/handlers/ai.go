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

// GeneratePolicyRequest represents the request for policy generation
type GeneratePolicyRequest struct {
	Description string `json:"description" binding:"required"`
	Framework   string `json:"framework"`
	Language    string `json:"language"`
}

func (h *AIHandler) GeneratePolicy(c *gin.Context) {
	var req GeneratePolicyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request",
			"message": err.Error(),
		})
		return
	}

	// Set defaults
	if req.Framework == "" {
		req.Framework = "general security"
	}
	if req.Language == "" {
		req.Language = "Rego"
	}

	serviceReq := services.PolicyGenerationRequest{
		Description: req.Description,
		Framework:   req.Framework,
		Language:    req.Language,
	}

	response, err := h.service.GeneratePolicy(serviceReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to generate policy",
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, response)
}

func (h *AIHandler) OptimizePolicy(c *gin.Context) {
	policyID := c.Param("id")
	if policyID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request",
			"message": "Policy ID is required",
		})
		return
	}

	var req struct {
		Policy string `json:"policy" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request",
			"message": err.Error(),
		})
		return
	}

	optimized, err := h.service.OptimizePolicy(policyID, req.Policy)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to optimize policy",
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"policy_id":        policyID,
		"optimized_policy": optimized,
	})
}
