package handlers

import (
	"net/http"

	"niyama-backend/internal/services"

	"github.com/gin-gonic/gin"
)

type PolicyHandler struct {
	service *services.PolicyService
}

func NewPolicyHandler(service *services.PolicyService) *PolicyHandler {
	return &PolicyHandler{service: service}
}

func (h *PolicyHandler) GetPolicies(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Get policies - TODO"})
}

func (h *PolicyHandler) GetPolicy(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Get policy - TODO"})
}

func (h *PolicyHandler) CreatePolicy(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Create policy - TODO"})
}

func (h *PolicyHandler) UpdatePolicy(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Update policy - TODO"})
}

func (h *PolicyHandler) DeletePolicy(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Delete policy - TODO"})
}

func (h *PolicyHandler) EvaluatePolicy(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Evaluate policy - TODO"})
}
