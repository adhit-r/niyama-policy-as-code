package handlers

import (
	"net/http"
	"niyama-backend/internal/services"

	"github.com/gin-gonic/gin"
)

type SchedulerHandler struct {
	service *services.SchedulerService
}

func NewSchedulerHandler(service *services.SchedulerService) *SchedulerHandler {
	return &SchedulerHandler{service: service}
}

func (h *SchedulerHandler) CreateScanSchedule(c *gin.Context) {
	var req services.ScanSchedule
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Mock user for now
	userID := uint(1)
	orgID := uint(1)

	schedule, err := h.service.CreateScanSchedule(&req, userID, orgID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, schedule)
}

func (h *SchedulerHandler) UpdateScanSchedule(c *gin.Context) {
	scheduleID := c.Param("id")

	var req services.ScanSchedule
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Mock user for now
	userID := uint(1)
	orgID := uint(1)

	schedule, err := h.service.UpdateScanSchedule(scheduleID, &req, userID, orgID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, schedule)
}

func (h *SchedulerHandler) GetScanSchedule(c *gin.Context) {
	scheduleID := c.Param("id")

	// Mock user for now
	userID := uint(1)
	orgID := uint(1)

	schedule, err := h.service.GetScanSchedule(scheduleID, userID, orgID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, schedule)
}

func (h *SchedulerHandler) ListScanSchedules(c *gin.Context) {
	// Mock user for now
	userID := uint(1)
	orgID := uint(1)

	schedules, err := h.service.ListScanSchedules(userID, orgID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"schedules": schedules})
}

func (h *SchedulerHandler) DeleteScanSchedule(c *gin.Context) {
	scheduleID := c.Param("id")

	// Mock user for now
	userID := uint(1)
	orgID := uint(1)

	err := h.service.DeleteScanSchedule(scheduleID, userID, orgID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Schedule deleted successfully"})
}

func (h *SchedulerHandler) TriggerScan(c *gin.Context) {
	var req services.ScanTrigger
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Mock user for now
	userID := uint(1)
	orgID := uint(1)

	scanID, err := h.service.TriggerScan(&req, userID, orgID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"scan_id": scanID, "message": "Scan triggered successfully"})
}

func (h *SchedulerHandler) CreateCronJob(c *gin.Context) {
	var req services.ScanSchedule
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Mock user for now
	userID := uint(1)
	orgID := uint(1)

	cronJob, err := h.service.CreateKubernetesCronJob(&req, userID, orgID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, cronJob)
}

func (h *SchedulerHandler) ListCronJobs(c *gin.Context) {
	// Mock user for now
	userID := uint(1)
	orgID := uint(1)

	cronJobs, err := h.service.ListCronJobs(userID, orgID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"cron_jobs": cronJobs})
}

func (h *SchedulerHandler) GetScheduledScans(c *gin.Context) {
	schedules, err := h.service.GetScheduledScans()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"scheduled_scans": schedules})
}
