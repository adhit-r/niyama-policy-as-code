package handlers

import (
	"net/http"
	"niyama-backend/internal/services"

	"github.com/gin-gonic/gin"
)

type DriftHandler struct {
	service *services.DriftService
}

func NewDriftHandler(service *services.DriftService) *DriftHandler {
	return &DriftHandler{service: service}
}

func (h *DriftHandler) DetectDrift(c *gin.Context) {
	var req services.DriftDetectionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Mock user for now
	userID := uint(1)
	orgID := uint(1)

	result, err := h.service.DetectDrift(&req, userID, orgID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}

func (h *DriftHandler) GetDriftHistory(c *gin.Context) {
	// Mock implementation for drift history
	drifts := []map[string]interface{}{
		{
			"drift_id":     "drift_1234567890_1",
			"provider":     "aws",
			"baseline_id":  "scan_1234567890_1",
			"current_id":   "scan_1234567891_1",
			"total_drifts": 3,
			"critical":     1,
			"high":         2,
			"status":       "completed",
			"created_at":   "2024-01-15T10:30:00Z",
			"duration_ms":  3500,
		},
		{
			"drift_id":     "drift_1234567891_1",
			"provider":     "kubernetes",
			"baseline_id":  "scan_1234567891_1",
			"current_id":   "scan_1234567892_1",
			"total_drifts": 1,
			"critical":     0,
			"high":         1,
			"status":       "completed",
			"created_at":   "2024-01-15T09:15:00Z",
			"duration_ms":  1800,
		},
	}

	c.JSON(http.StatusOK, gin.H{"drifts": drifts})
}

func (h *DriftHandler) GetDriftResult(c *gin.Context) {
	driftID := c.Param("id")

	// Mock implementation for specific drift result
	result := map[string]interface{}{
		"drift_id":    driftID,
		"provider":    "aws",
		"baseline_id": "scan_1234567890_1",
		"current_id":  "scan_1234567891_1",
		"drifts": []map[string]interface{}{
			{
				"resource_id":   "i-1234567890abcdef0",
				"resource_type": "ec2-instance",
				"resource_name": "web-server-1",
				"region":        "us-east-1",
				"drift_type":    "modified",
				"severity":      "high",
				"changes": []map[string]interface{}{
					{
						"path":      "properties.instance_type",
						"operation": "modified",
						"old_value": "t3.medium",
						"new_value": "t3.large",
					},
				},
				"impact":         "Instance type changed. Verify cost implications and performance requirements.",
				"recommendation": "Review instance sizing requirements. Update monitoring and alerting if needed.",
			},
		},
		"summary": map[string]interface{}{
			"total_drifts":    1,
			"drift_types":     map[string]int{"modified": 1},
			"severity_counts": map[string]int{"high": 1},
			"resource_types":  map[string]int{"ec2-instance": 1},
			"regions":         map[string]int{"us-east-1": 1},
		},
	}

	c.JSON(http.StatusOK, result)
}

func (h *DriftHandler) GetDriftTimeline(c *gin.Context) {
	// Mock implementation for drift timeline
	timeline := []map[string]interface{}{
		{
			"timestamp": "2024-01-15T10:30:00Z",
			"event":     "drift_detected",
			"resource":  "i-1234567890abcdef0",
			"type":      "configuration_change",
			"severity":  "high",
			"message":   "Instance type changed from t3.medium to t3.large",
		},
		{
			"timestamp": "2024-01-15T09:15:00Z",
			"event":     "baseline_scan",
			"resource":  "all",
			"type":      "scan_completed",
			"severity":  "info",
			"message":   "Baseline scan completed for AWS us-east-1",
		},
		{
			"timestamp": "2024-01-15T08:00:00Z",
			"event":     "resource_removed",
			"resource":  "sg-12345678",
			"type":      "security_group_deleted",
			"severity":  "critical",
			"message":   "Security group web-sg was deleted",
		},
	}

	c.JSON(http.StatusOK, gin.H{"timeline": timeline})
}
