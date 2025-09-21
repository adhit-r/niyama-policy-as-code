package handlers

import (
	"net/http"
	"runtime"
	"time"

	"niyama-backend/internal/config"
	"niyama-backend/internal/database"

	"github.com/gin-gonic/gin"
)

type HealthHandler struct {
	db  *database.Database
	cfg *config.Config
}

func NewHealthHandler(db *database.Database, cfg *config.Config) *HealthHandler {
	return &HealthHandler{
		db:  db,
		cfg: cfg,
	}
}

type HealthResponse struct {
	Status      string                 `json:"status"`
	Service     string                 `json:"service"`
	Environment string                 `json:"environment"`
	Timestamp   time.Time              `json:"timestamp"`
	Version     string                 `json:"version"`
	Uptime      string                 `json:"uptime"`
	Checks      map[string]HealthCheck `json:"checks"`
	System      SystemInfo             `json:"system"`
}

type HealthCheck struct {
	Status    string    `json:"status"`
	Message   string    `json:"message,omitempty"`
	LastCheck time.Time `json:"last_check"`
	Duration  string    `json:"duration,omitempty"`
}

type SystemInfo struct {
	GoVersion     string      `json:"go_version"`
	NumGoroutines int         `json:"num_goroutines"`
	MemoryUsage   MemoryStats `json:"memory_usage"`
}

type MemoryStats struct {
	Alloc      uint64 `json:"alloc_mb"`
	TotalAlloc uint64 `json:"total_alloc_mb"`
	Sys        uint64 `json:"sys_mb"`
	NumGC      uint32 `json:"num_gc"`
}

var startTime = time.Now()

func (h *HealthHandler) HealthCheck(c *gin.Context) {
	checks := make(map[string]HealthCheck)

	// Database health check
	checks["database"] = h.checkDatabase()

	// Memory health check
	checks["memory"] = h.checkMemory()

	// Determine overall status
	overallStatus := "healthy"
	for _, check := range checks {
		if check.Status != "healthy" {
			overallStatus = "unhealthy"
			break
		}
	}

	// Get system info
	var m runtime.MemStats
	runtime.ReadMemStats(&m)

	system := SystemInfo{
		GoVersion:     runtime.Version(),
		NumGoroutines: runtime.NumGoroutine(),
		MemoryUsage: MemoryStats{
			Alloc:      bToMb(m.Alloc),
			TotalAlloc: bToMb(m.TotalAlloc),
			Sys:        bToMb(m.Sys),
			NumGC:      m.NumGC,
		},
	}

	environment := "development"
	if h.cfg != nil {
		environment = h.cfg.Environment
	}

	response := HealthResponse{
		Status:      overallStatus,
		Service:     "niyama-backend",
		Environment: environment,
		Timestamp:   time.Now().UTC(),
		Version:     "1.0.0", // TODO: Get from build info
		Uptime:      time.Since(startTime).String(),
		Checks:      checks,
		System:      system,
	}

	statusCode := http.StatusOK
	if overallStatus != "healthy" {
		statusCode = http.StatusServiceUnavailable
	}

	c.JSON(statusCode, response)
}

func (h *HealthHandler) checkDatabase() HealthCheck {
	start := time.Now()

	if h.db == nil {
		return HealthCheck{
			Status:    "warning",
			Message:   "Database connection not configured",
			LastCheck: start,
		}
	}

	// Try to ping the database
	sqlDB, err := h.db.DB.DB()
	if err != nil {
		return HealthCheck{
			Status:    "unhealthy",
			Message:   "Failed to get database instance: " + err.Error(),
			LastCheck: start,
		}
	}

	if err := sqlDB.Ping(); err != nil {
		return HealthCheck{
			Status:    "unhealthy",
			Message:   "Database ping failed: " + err.Error(),
			LastCheck: start,
		}
	}

	duration := time.Since(start)
	return HealthCheck{
		Status:    "healthy",
		Message:   "Database connection is healthy",
		LastCheck: start,
		Duration:  duration.String(),
	}
}

func (h *HealthHandler) checkMemory() HealthCheck {
	start := time.Now()

	var m runtime.MemStats
	runtime.ReadMemStats(&m)

	// Check if memory usage is too high (example: 1GB limit)
	allocMB := bToMb(m.Alloc)
	if allocMB > 1024 {
		return HealthCheck{
			Status:    "warning",
			Message:   "High memory usage detected",
			LastCheck: start,
		}
	}

	return HealthCheck{
		Status:    "healthy",
		Message:   "Memory usage is normal",
		LastCheck: start,
	}
}

// ReadinessCheck provides a readiness probe endpoint
func (h *HealthHandler) ReadinessCheck(c *gin.Context) {
	// Check if all critical dependencies are ready
	ready := true
	checks := make(map[string]string)

	// Database readiness
	if h.db != nil {
		sqlDB, err := h.db.DB.DB()
		if err != nil || sqlDB.Ping() != nil {
			ready = false
			checks["database"] = "not ready"
		} else {
			checks["database"] = "ready"
		}
	} else {
		checks["database"] = "not configured"
	}

	status := "ready"
	statusCode := http.StatusOK
	if !ready {
		status = "not ready"
		statusCode = http.StatusServiceUnavailable
	}

	c.JSON(statusCode, gin.H{
		"status":    status,
		"checks":    checks,
		"timestamp": time.Now().UTC(),
	})
}

// LivenessCheck provides a liveness probe endpoint
func (h *HealthHandler) LivenessCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":    "alive",
		"service":   "niyama-backend",
		"timestamp": time.Now().UTC(),
	})
}

// bToMb converts bytes to megabytes
func bToMb(b uint64) uint64 {
	return b / 1024 / 1024
}