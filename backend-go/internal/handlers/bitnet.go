package handlers

import (
	"log"
	"net/http"
	"niyama-backend/internal/services"

	"github.com/gin-gonic/gin"
)

type BitNetHandler struct {
	bitnetService *services.BitNetService
}

func NewBitNetHandler() *BitNetHandler {
	return &BitNetHandler{
		bitnetService: services.NewBitNetService(),
	}
}

// GeneratePolicy generates a policy from natural language description
func (h *BitNetHandler) GeneratePolicy(c *gin.Context) {
	var req services.PolicyGenerationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("Failed to bind request: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}

	if req.Description == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Description is required"})
		return
	}

	policy, err := h.bitnetService.GeneratePolicy(req)
	if err != nil {
		log.Printf("Failed to generate policy: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate policy"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"policy":      policy,
		"description": req.Description,
		"framework":   req.Framework,
		"language":    req.Language,
	})
}

// AnalyzePolicy analyzes a policy for various aspects
func (h *BitNetHandler) AnalyzePolicy(c *gin.Context) {
	var req services.PolicyAnalysisRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("Failed to bind request: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}

	if req.Policy == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Policy is required"})
		return
	}

	if req.AnalysisType == "" {
		req.AnalysisType = "explain"
	}

	analysis, err := h.bitnetService.AnalyzePolicy(req)
	if err != nil {
		log.Printf("Failed to analyze policy: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to analyze policy"})
		return
	}

	c.JSON(http.StatusOK, analysis)
}

// ExplainPolicy explains a policy in simple terms
func (h *BitNetHandler) ExplainPolicy(c *gin.Context) {
	var req struct {
		Policy string `json:"policy" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("Failed to bind request: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}

	explanation, err := h.bitnetService.ExplainPolicy(req.Policy)
	if err != nil {
		log.Printf("Failed to explain policy: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to explain policy"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"explanation": explanation,
		"policy":      req.Policy,
	})
}

// ValidatePolicy validates a policy for issues and security concerns
func (h *BitNetHandler) ValidatePolicy(c *gin.Context) {
	var req struct {
		Policy string `json:"policy" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("Failed to bind request: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}

	validation, err := h.bitnetService.ValidatePolicy(req.Policy)
	if err != nil {
		log.Printf("Failed to validate policy: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to validate policy"})
		return
	}

	c.JSON(http.StatusOK, validation)
}

// OptimizePolicy optimizes a policy for better performance
func (h *BitNetHandler) OptimizePolicy(c *gin.Context) {
	var req struct {
		Policy string `json:"policy" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("Failed to bind request: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}

	optimization, err := h.bitnetService.OptimizePolicy(req.Policy)
	if err != nil {
		log.Printf("Failed to optimize policy: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to optimize policy"})
		return
	}

	c.JSON(http.StatusOK, optimization)
}

// CheckCompliance checks policy compliance with a specific framework
func (h *BitNetHandler) CheckCompliance(c *gin.Context) {
	var req struct {
		Policy    string `json:"policy" binding:"required"`
		Framework string `json:"framework" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("Failed to bind request: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}

	compliance, err := h.bitnetService.CheckCompliance(req.Policy, req.Framework)
	if err != nil {
		log.Printf("Failed to check compliance: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check compliance"})
		return
	}

	c.JSON(http.StatusOK, compliance)
}

// GetSupportedFrameworks returns list of supported compliance frameworks
func (h *BitNetHandler) GetSupportedFrameworks(c *gin.Context) {
	frameworks := []string{
		"SOC 2",
		"HIPAA",
		"GDPR",
		"ISO 27001",
		"ISO 42001",
		"PCI DSS",
		"NIST",
		"CIS",
		"COBIT",
		"ITIL",
	}

	c.JSON(http.StatusOK, gin.H{
		"frameworks": frameworks,
	})
}

// GetSupportedLanguages returns list of supported policy languages
func (h *BitNetHandler) GetSupportedLanguages(c *gin.Context) {
	languages := []string{
		"Rego",
		"YAML",
		"JSON",
		"OPA",
		"Gatekeeper",
		"Kyverno",
	}

	c.JSON(http.StatusOK, gin.H{
		"languages": languages,
	})
}
