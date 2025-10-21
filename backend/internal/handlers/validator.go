package handlers

import (
	"net/http"
	"niyama-backend/internal/services"

	"github.com/gin-gonic/gin"
)

type ValidatorHandler struct {
	service *services.ValidatorService
}

func NewValidatorHandler(service *services.ValidatorService) *ValidatorHandler {
	return &ValidatorHandler{service: service}
}

func (h *ValidatorHandler) ValidateIaC(c *gin.Context) {
	var req services.ValidationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Mock user for now
	userID := uint(1)
	orgID := uint(1)

	result, err := h.service.ValidateIaC(&req, userID, orgID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Return appropriate HTTP status based on validation result
	statusCode := http.StatusOK
	if result.Status == "fail" {
		statusCode = http.StatusUnprocessableEntity // 422
	}

	c.JSON(statusCode, result)
}
