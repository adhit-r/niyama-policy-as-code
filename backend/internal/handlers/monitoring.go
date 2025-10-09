package handlers

import (
	"net/http"

	"niyama-backend/internal/services"

	"github.com/gin-gonic/gin"
)

type MonitoringHandler struct {
	service *services.MonitoringService
}

func NewMonitoringHandler(service *services.MonitoringService) *MonitoringHandler {
	return &MonitoringHandler{service: service}
}

func (h *MonitoringHandler) GetMetrics(c *gin.Context) {
	// Mock metrics data
	metrics := gin.H{
		"policies": gin.H{
			"total":    15,
			"active":   12,
			"inactive": 3,
		},
		"templates": gin.H{
			"total": 8,
			"used":  5,
		},
		"compliance": gin.H{
			"frameworks": 4,
			"reports":    2,
		},
		"ai_requests": gin.H{
			"total":      25,
			"successful": 23,
			"failed":     2,
		},
		"system": gin.H{
			"uptime":       "2h 15m",
			"memory_usage": "45%",
			"cpu_usage":    "12%",
		},
	}
	c.JSON(http.StatusOK, metrics)
}

func (h *MonitoringHandler) GetAlerts(c *gin.Context) {
	// Mock alerts data
	alerts := []gin.H{
		{
			"id":        "1",
			"type":      "warning",
			"message":   "Policy evaluation failed for 3 resources",
			"timestamp": "2025-09-21T13:45:00Z",
			"severity":  "medium",
		},
		{
			"id":        "2",
			"type":      "info",
			"message":   "New compliance report generated",
			"timestamp": "2025-09-21T13:30:00Z",
			"severity":  "low",
		},
		{
			"id":        "3",
			"type":      "error",
			"message":   "AI service temporarily unavailable",
			"timestamp": "2025-09-21T13:15:00Z",
			"severity":  "high",
		},
	}

	// Get limit from query params
	limit := c.DefaultQuery("limit", "10")
	if limit == "5" {
		alerts = alerts[:2] // Return only first 2 alerts
	}

	c.JSON(http.StatusOK, gin.H{
		"alerts": alerts,
		"total":  len(alerts),
	})
}
