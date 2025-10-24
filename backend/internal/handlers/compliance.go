package handlers

import (
	"net/http"

	"niyama-backend/internal/services"

	"github.com/gin-gonic/gin"
)

type ComplianceHandler struct {
	service *services.ComplianceService
}

func NewComplianceHandler(service *services.ComplianceService) *ComplianceHandler {
	return &ComplianceHandler{service: service}
}

func (h *ComplianceHandler) GetFrameworks(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Get frameworks - TODO"})
}

func (h *ComplianceHandler) GetFramework(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Get framework - TODO"})
}

func (h *ComplianceHandler) GetReports(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Get reports - TODO"})
}

func (h *ComplianceHandler) GenerateReport(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Generate report - TODO"})
}
