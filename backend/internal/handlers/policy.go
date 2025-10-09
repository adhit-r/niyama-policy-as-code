package handlers

import (
	"net/http"
	"strconv"
	"time"

	"niyama-backend/internal/models"
	"niyama-backend/internal/services"

	"github.com/gin-gonic/gin"
)

type PolicyHandler struct {
	service *services.PolicyService
}

func NewPolicyHandler(service *services.PolicyService) *PolicyHandler {
	return &PolicyHandler{service: service}
}

// GetPolicies retrieves policies based on user permissions
func (h *PolicyHandler) GetPolicies(c *gin.Context) {
	// For development, use mock user and org data
	userID := uint(1)
	orgID := uint(1)
	userRole := models.RoleAdmin

	policies, err := h.service.GetPolicies(userID, orgID, userRole)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"policies": policies,
		"count":    len(policies),
	})
}

// GetPolicy retrieves a specific policy
func (h *PolicyHandler) GetPolicy(c *gin.Context) {
	policyIDStr := c.Param("id")
	policyID, err := strconv.ParseUint(policyIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid policy ID"})
		return
	}

	// For development, use mock user and org data
	userID := uint(1)
	orgID := uint(1)
	userRole := models.RoleAdmin

	policy, err := h.service.GetPolicy(uint(policyID), userID, orgID, userRole)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"policy": policy})
}

// CreatePolicy creates a new policy
func (h *PolicyHandler) CreatePolicy(c *gin.Context) {
	var policy models.Policy
	if err := c.ShouldBindJSON(&policy); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// For development, use mock user and org data
	userID := uint(1)
	orgID := uint(1)

	err := h.service.CreatePolicy(&policy, userID, orgID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Policy created successfully",
		"policy":  policy,
	})
}

// UpdatePolicy updates an existing policy
func (h *PolicyHandler) UpdatePolicy(c *gin.Context) {
	policyIDStr := c.Param("id")
	policyID, err := strconv.ParseUint(policyIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid policy ID"})
		return
	}

	var updates models.Policy
	if err := c.ShouldBindJSON(&updates); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// For development, use mock user and org data
	userID := uint(1)
	orgID := uint(1)
	userRole := models.RoleAdmin

	err = h.service.UpdatePolicy(uint(policyID), &updates, userID, orgID, userRole)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Policy updated successfully"})
}

// DeletePolicy deletes a policy
func (h *PolicyHandler) DeletePolicy(c *gin.Context) {
	policyIDStr := c.Param("id")
	policyID, err := strconv.ParseUint(policyIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid policy ID"})
		return
	}

	// For development, use mock user and org data
	userID := uint(1)
	orgID := uint(1)
	userRole := models.RoleAdmin

	err = h.service.DeletePolicy(uint(policyID), userID, orgID, userRole)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Policy deleted successfully"})
}

// EvaluatePolicy tests a policy against input data
func (h *PolicyHandler) EvaluatePolicy(c *gin.Context) {
	policyIDStr := c.Param("id")
	policyID, err := strconv.ParseUint(policyIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid policy ID"})
		return
	}

	var testInput map[string]interface{}
	if err := c.ShouldBindJSON(&testInput); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// For development, use mock user and org data
	userID := uint(1)
	orgID := uint(1)
	userRole := models.RoleAdmin

	evaluation, err := h.service.TestPolicy(uint(policyID), testInput, userID, orgID, userRole)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":    "Policy evaluation completed",
		"evaluation": evaluation,
	})
}

// SavePolicy saves a policy (works without database for development)
func (h *PolicyHandler) SavePolicy(c *gin.Context) {
	var policy models.Policy
	if err := c.ShouldBindJSON(&policy); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// For development, simulate saving without database
	policy.ID = uint(time.Now().Unix()) // Generate a mock ID
	policy.AuthorID = 1
	policy.OrganizationID = 1
	policy.CreatedAt = time.Now()
	policy.UpdatedAt = time.Now()

	// Validate access level
	if !policy.AccessLevel.IsValid() {
		policy.AccessLevel = models.AccessPrivate
	}

	// Validate status
	if !policy.Status.IsValid() {
		policy.Status = models.StatusDraft
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Policy saved successfully",
		"policy":  policy,
	})
}

// TestPolicy tests a policy (alias for EvaluatePolicy for frontend compatibility)
func (h *PolicyHandler) TestPolicy(c *gin.Context) {
	var testRequest struct {
		PolicyID  uint                   `json:"policy_id"`
		TestInput map[string]interface{} `json:"test_input"`
	}

	if err := c.ShouldBindJSON(&testRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// For development, use mock user and org data
	userID := uint(1)
	orgID := uint(1)
	userRole := models.RoleAdmin

	evaluation, err := h.service.TestPolicy(testRequest.PolicyID, testRequest.TestInput, userID, orgID, userRole)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":    "Policy evaluation completed",
		"evaluation": evaluation,
	})
}
