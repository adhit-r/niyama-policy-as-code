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

// OptimizePolicyRequest represents the request for policy optimization
type OptimizePolicyRequest struct {
	Policy     string                 `json:"policy" binding:"required"`
	Context    map[string]interface{} `json:"context"`
	FocusAreas []string               `json:"focus_areas"` // performance, security, maintainability, compliance
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

	var req OptimizePolicyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request",
			"message": err.Error(),
		})
		return
	}

	serviceReq := services.PolicyOptimizationRequest{
		PolicyID:   policyID,
		Policy:     req.Policy,
		Context:    req.Context,
		FocusAreas: req.FocusAreas,
	}

	response, err := h.service.OptimizePolicy(serviceReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to optimize policy",
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, response)
}

// DetectConflictsRequest represents the request for conflict detection
type DetectConflictsRequest struct {
	Policies []string               `json:"policies" binding:"required"`
	Context  map[string]interface{} `json:"context"`
}

func (h *AIHandler) DetectConflicts(c *gin.Context) {
	var req DetectConflictsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request",
			"message": err.Error(),
		})
		return
	}

	serviceReq := services.PolicyConflictRequest{
		Policies: req.Policies,
		Context:  req.Context,
	}

	response, err := h.service.DetectPolicyConflicts(serviceReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to detect conflicts",
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, response)
}

// AnalyzeComplianceGapsRequest represents the request for compliance gap analysis
type AnalyzeComplianceGapsRequest struct {
	Policy     string                 `json:"policy" binding:"required"`
	Frameworks []string               `json:"frameworks" binding:"required"`
	Context    map[string]interface{} `json:"context"`
}

func (h *AIHandler) AnalyzeComplianceGaps(c *gin.Context) {
	policyID := c.Param("id")
	if policyID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request",
			"message": "Policy ID is required",
		})
		return
	}

	var req AnalyzeComplianceGapsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request",
			"message": err.Error(),
		})
		return
	}

	serviceReq := services.ComplianceGapRequest{
		PolicyID:   policyID,
		Policy:     req.Policy,
		Frameworks: req.Frameworks,
		Context:    req.Context,
	}

	response, err := h.service.AnalyzeComplianceGaps(serviceReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to analyze compliance gaps",
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, response)
}

// AssessImpactRequest represents the request for impact assessment
type AssessImpactRequest struct {
	Policy    string                 `json:"policy" binding:"required"`
	Context   map[string]interface{} `json:"context"`
	TimeRange string                 `json:"time_range"` // 1d, 7d, 30d, 90d
}

func (h *AIHandler) AssessImpact(c *gin.Context) {
	policyID := c.Param("id")
	if policyID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request",
			"message": "Policy ID is required",
		})
		return
	}

	var req AssessImpactRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request",
			"message": err.Error(),
		})
		return
	}

	serviceReq := services.PolicyImpactRequest{
		PolicyID:  policyID,
		Policy:    req.Policy,
		Context:   req.Context,
		TimeRange: req.TimeRange,
	}

	response, err := h.service.AssessPolicyImpact(serviceReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to assess policy impact",
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, response)
}
