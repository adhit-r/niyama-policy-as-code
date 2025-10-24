package handlers

import (
	"fmt"
	"net/http"
	"niyama-backend/internal/services"
	"time"

	"github.com/gin-gonic/gin"
)

type EvidenceHandler struct {
	service *services.EvidenceService
}

func NewEvidenceHandler(service *services.EvidenceService) *EvidenceHandler {
	return &EvidenceHandler{service: service}
}

func (h *EvidenceHandler) ExportEvidence(c *gin.Context) {
	framework := c.Query("framework")
	format := c.DefaultQuery("format", "json")

	if framework == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "framework parameter required"})
		return
	}

	// Default to last 30 days
	endDate := time.Now()
	startDate := endDate.AddDate(0, 0, -30)

	req := &services.EvidenceRequest{
		Framework: framework,
		StartDate: startDate,
		EndDate:   endDate,
	}

	evidence, err := h.service.CollectEvidence(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	switch format {
	case "csv":
		csvData, err := h.service.ExportCSV(evidence)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.Header("Content-Type", "text/csv")
		c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=%s-evidence.csv", framework))
		c.Data(http.StatusOK, "text/csv", csvData)

	default:
		c.JSON(http.StatusOK, evidence)
	}
}
