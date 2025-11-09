package handlers

import (
	"net/http"
	"strconv"

	"niyama-backend/internal/models"
	"niyama-backend/internal/services"

	"github.com/gin-gonic/gin"
)

type WebhookHandler struct {
	service *services.WebhookService
}

func NewWebhookHandler(service *services.WebhookService) *WebhookHandler {
	return &WebhookHandler{service: service}
}

// CreateWebhook creates a new webhook
func (h *WebhookHandler) CreateWebhook(c *gin.Context) {
	var webhook models.Webhook
	if err := c.ShouldBindJSON(&webhook); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// For development, use mock organization and user IDs
	webhook.OrganizationID = 1
	webhook.CreatedBy = 1

	if err := h.service.CreateWebhook(&webhook); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, webhook)
}

// GetWebhooks retrieves all webhooks for an organization
func (h *WebhookHandler) GetWebhooks(c *gin.Context) {
	// For development, use mock organization ID
	orgID := uint(1)

	webhooks, err := h.service.GetWebhooks(orgID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"webhooks": webhooks,
		"count":    len(webhooks),
	})
}

// GetWebhook retrieves a specific webhook
func (h *WebhookHandler) GetWebhook(c *gin.Context) {
	webhookIDStr := c.Param("id")
	webhookID, err := strconv.ParseUint(webhookIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid webhook ID"})
		return
	}

	webhook, err := h.service.GetWebhook(uint(webhookID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, webhook)
}

// UpdateWebhook updates a webhook
func (h *WebhookHandler) UpdateWebhook(c *gin.Context) {
	webhookIDStr := c.Param("id")
	webhookID, err := strconv.ParseUint(webhookIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid webhook ID"})
		return
	}

	var webhook models.Webhook
	if err := c.ShouldBindJSON(&webhook); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	webhook.ID = uint(webhookID)

	if err := h.service.UpdateWebhook(&webhook); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, webhook)
}

// DeleteWebhook deletes a webhook
func (h *WebhookHandler) DeleteWebhook(c *gin.Context) {
	webhookIDStr := c.Param("id")
	webhookID, err := strconv.ParseUint(webhookIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid webhook ID"})
		return
	}

	if err := h.service.DeleteWebhook(uint(webhookID)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Webhook deleted successfully"})
}

// GetWebhookEvents retrieves events for a webhook
func (h *WebhookHandler) GetWebhookEvents(c *gin.Context) {
	webhookIDStr := c.Param("id")
	webhookID, err := strconv.ParseUint(webhookIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid webhook ID"})
		return
	}

	limitStr := c.DefaultQuery("limit", "50")
	limit, err := strconv.Atoi(limitStr)
	if err != nil {
		limit = 50
	}

	events, err := h.service.GetWebhookEvents(uint(webhookID), limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"events": events,
		"count":  len(events),
	})
}

// TestWebhook tests a webhook by sending a test event
func (h *WebhookHandler) TestWebhook(c *gin.Context) {
	webhookIDStr := c.Param("id")
	webhookID, err := strconv.ParseUint(webhookIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid webhook ID"})
		return
	}

	webhook, err := h.service.GetWebhook(uint(webhookID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	// Send test event
	testPayload := map[string]interface{}{
		"test":      true,
		"message":   "This is a test webhook from Niyama",
		"timestamp": "2024-01-01T00:00:00Z",
	}

	if err := h.service.EmitEvent("webhook.test", testPayload, webhook.OrganizationID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Test webhook sent successfully"})
}

// RetryFailedWebhooks retries failed webhook events
func (h *WebhookHandler) RetryFailedWebhooks(c *gin.Context) {
	if err := h.service.RetryFailedWebhooks(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Failed webhooks retry initiated"})
}
