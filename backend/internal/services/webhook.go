package services

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"niyama-backend/internal/models"

	"gorm.io/gorm"
)

type WebhookService struct {
	db *gorm.DB
}

func NewWebhookService(db *gorm.DB) *WebhookService {
	return &WebhookService{db: db}
}

// CreateWebhook creates a new webhook
func (s *WebhookService) CreateWebhook(webhook *models.Webhook) error {
	return s.db.Create(webhook).Error
}

// GetWebhooks returns all webhooks for an organization
func (s *WebhookService) GetWebhooks(orgID uint) ([]models.Webhook, error) {
	var webhooks []models.Webhook
	err := s.db.Where("organization_id = ?", orgID).Find(&webhooks).Error
	return webhooks, err
}

// GetWebhook returns a specific webhook
func (s *WebhookService) GetWebhook(id uint) (*models.Webhook, error) {
	var webhook models.Webhook
	err := s.db.First(&webhook, id).Error
	if err != nil {
		return nil, err
	}
	return &webhook, nil
}

// UpdateWebhook updates a webhook
func (s *WebhookService) UpdateWebhook(webhook *models.Webhook) error {
	return s.db.Save(webhook).Error
}

// DeleteWebhook deletes a webhook
func (s *WebhookService) DeleteWebhook(id uint) error {
	return s.db.Delete(&models.Webhook{}, id).Error
}

// EmitEvent emits a webhook event
func (s *WebhookService) EmitEvent(eventType string, payload map[string]interface{}, orgID uint) error {
	// Get all active webhooks for the organization that listen to this event
	var webhooks []models.Webhook
	err := s.db.Where("organization_id = ? AND is_active = ?", orgID, true).Find(&webhooks).Error
	if err != nil {
		return fmt.Errorf("failed to get webhooks: %w", err)
	}

	for _, webhook := range webhooks {
		// Check if webhook listens to this event type
		if s.webhookListensToEvent(webhook, eventType) {
			// Create webhook event
			event := &models.WebhookEvent{
				WebhookID: webhook.ID,
				EventType: eventType,
				Payload:   payload,
				Status:    models.EventStatusPending,
			}

			if err := s.db.Create(event).Error; err != nil {
				return fmt.Errorf("failed to create webhook event: %w", err)
			}

			// Send webhook asynchronously
			go s.sendWebhook(webhook, event)
		}
	}

	return nil
}

// webhookListensToEvent checks if a webhook listens to a specific event type
func (s *WebhookService) webhookListensToEvent(webhook models.Webhook, eventType string) bool {
	for _, event := range webhook.Events {
		if event == eventType || event == "*" {
			return true
		}
	}
	return false
}

// sendWebhook sends a webhook request
func (s *WebhookService) sendWebhook(webhook models.Webhook, event *models.WebhookEvent) {
	// Prepare payload
	payload, err := json.Marshal(event.Payload)
	if err != nil {
		s.updateEventStatus(event.ID, models.EventStatusFailed, fmt.Sprintf("Failed to marshal payload: %v", err))
		return
	}

	// Create HTTP request
	req, err := http.NewRequest("POST", webhook.URL, bytes.NewBuffer(payload))
	if err != nil {
		s.updateEventStatus(event.ID, models.EventStatusFailed, fmt.Sprintf("Failed to create request: %v", err))
		return
	}

	// Set headers
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("User-Agent", "Niyama-Webhook/1.0")
	req.Header.Set("X-Webhook-Event", event.EventType)
	req.Header.Set("X-Webhook-ID", fmt.Sprintf("%d", event.ID))

	// Add signature if secret is provided
	if webhook.Secret != "" {
		signature := s.generateSignature(payload, webhook.Secret)
		req.Header.Set("X-Webhook-Signature", signature)
	}

	// Send request
	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		s.updateEventStatus(event.ID, models.EventStatusFailed, fmt.Sprintf("Request failed: %v", err))
		return
	}
	defer resp.Body.Close()

	// Update event status based on response
	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		s.updateEventStatus(event.ID, models.EventStatusSent, fmt.Sprintf("Success: %d", resp.StatusCode))
	} else {
		s.updateEventStatus(event.ID, models.EventStatusFailed, fmt.Sprintf("Failed: %d", resp.StatusCode))
	}
}

// generateSignature generates HMAC signature for webhook
func (s *WebhookService) generateSignature(payload []byte, secret string) string {
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write(payload)
	return "sha256=" + hex.EncodeToString(mac.Sum(nil))
}

// updateEventStatus updates the status of a webhook event
func (s *WebhookService) updateEventStatus(eventID uint, status models.EventStatus, response string) {
	s.db.Model(&models.WebhookEvent{}).
		Where("id = ?", eventID).
		Updates(map[string]interface{}{
			"status":   status,
			"response": response,
			"attempts": gorm.Expr("attempts + 1"),
		})
}

// GetWebhookEvents returns webhook events for a webhook
func (s *WebhookService) GetWebhookEvents(webhookID uint, limit int) ([]models.WebhookEvent, error) {
	var events []models.WebhookEvent
	query := s.db.Where("webhook_id = ?", webhookID).Order("created_at DESC")
	if limit > 0 {
		query = query.Limit(limit)
	}
	err := query.Find(&events).Error
	return events, err
}

// RetryFailedWebhooks retries failed webhook events
func (s *WebhookService) RetryFailedWebhooks() error {
	var events []models.WebhookEvent
	err := s.db.Where("status = ? AND attempts < ?", models.EventStatusFailed, 3).Find(&events).Error
	if err != nil {
		return err
	}

	for _, event := range events {
		var webhook models.Webhook
		if err := s.db.First(&webhook, event.WebhookID).Error; err != nil {
			continue
		}

		// Update status to retrying
		s.updateEventStatus(event.ID, models.EventStatusRetrying, "Retrying...")

		// Retry sending
		go s.sendWebhook(webhook, &event)
	}

	return nil
}
