package handlers

import (
	"net/http"
	"niyama-backend/internal/services"

	"github.com/gin-gonic/gin"
)

type ScannerHandler struct {
	service *services.ScannerService
}

func NewScannerHandler(service *services.ScannerService) *ScannerHandler {
	return &ScannerHandler{service: service}
}

func (h *ScannerHandler) ScanCloudResources(c *gin.Context) {
	var req services.ScanRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Mock user for now
	userID := uint(1)
	orgID := uint(1)

	result, err := h.service.ScanCloudResources(&req, userID, orgID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}

func (h *ScannerHandler) GetScanHistory(c *gin.Context) {
	// Mock implementation for scan history
	scans := []map[string]interface{}{
		{
			"scan_id":     "scan_1234567890_1",
			"provider":    "aws",
			"resources":   15,
			"status":      "completed",
			"created_at":  "2024-01-15T10:30:00Z",
			"duration_ms": 2500,
		},
		{
			"scan_id":     "scan_1234567891_1",
			"provider":    "kubernetes",
			"resources":   8,
			"status":      "completed",
			"created_at":  "2024-01-15T09:15:00Z",
			"duration_ms": 1200,
		},
	}

	c.JSON(http.StatusOK, gin.H{"scans": scans})
}

func (h *ScannerHandler) GetScanResult(c *gin.Context) {
	scanID := c.Param("id")

	// Mock implementation for specific scan result
	result := map[string]interface{}{
		"scan_id":  scanID,
		"provider": "aws",
		"resources": []map[string]interface{}{
			{
				"id":     "i-1234567890abcdef0",
				"type":   "ec2-instance",
				"name":   "web-server-1",
				"region": "us-east-1",
				"status": "running",
				"tags":   map[string]string{"Environment": "production"},
			},
		},
		"summary": map[string]interface{}{
			"total_resources": 1,
			"resource_types":  map[string]int{"ec2-instance": 1},
			"regions":         map[string]int{"us-east-1": 1},
		},
	}

	c.JSON(http.StatusOK, result)
}
