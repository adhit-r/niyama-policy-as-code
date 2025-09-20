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
	c.JSON(http.StatusOK, gin.H{"message": "Get metrics - TODO"})
}

func (h *MonitoringHandler) GetAlerts(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Get alerts - TODO"})
}
