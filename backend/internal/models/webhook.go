package models

import (
	"time"

	"gorm.io/gorm"
)

// Webhook represents a webhook configuration
type Webhook struct {
	ID             uint           `json:"id" gorm:"primaryKey"`
	Name           string         `json:"name" gorm:"not null"`
	URL            string         `json:"url" gorm:"not null"`
	Secret         string         `json:"secret"`
	Events         []string       `json:"events" gorm:"serializer:json"`
	IsActive       bool           `json:"is_active" gorm:"default:true"`
	OrganizationID uint           `json:"organization_id"`
	Organization   Organization   `json:"organization" gorm:"foreignKey:OrganizationID"`
	CreatedBy      uint           `json:"created_by"`
	Creator        User           `json:"creator" gorm:"foreignKey:CreatedBy"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `json:"-" gorm:"index"`
}

// WebhookEvent represents a webhook event
type WebhookEvent struct {
	ID        uint                   `json:"id" gorm:"primaryKey"`
	WebhookID uint                   `json:"webhook_id"`
	Webhook   Webhook                `json:"webhook" gorm:"foreignKey:WebhookID"`
	EventType string                 `json:"event_type"`
	Payload   map[string]interface{} `json:"payload" gorm:"serializer:json"`
	Status    EventStatus            `json:"status" gorm:"default:pending"`
	Attempts  int                    `json:"attempts" gorm:"default:0"`
	Response  string                 `json:"response"`
	CreatedAt time.Time              `json:"created_at"`
	UpdatedAt time.Time              `json:"updated_at"`
	DeletedAt gorm.DeletedAt         `json:"-" gorm:"index"`
}

// EventStatus represents the status of a webhook event
type EventStatus string

const (
	EventStatusPending  EventStatus = "pending"
	EventStatusSent     EventStatus = "sent"
	EventStatusFailed   EventStatus = "failed"
	EventStatusRetrying EventStatus = "retrying"
)

func (s EventStatus) String() string {
	return string(s)
}

func (s EventStatus) IsValid() bool {
	switch s {
	case EventStatusPending, EventStatusSent, EventStatusFailed, EventStatusRetrying:
		return true
	default:
		return false
	}
}

// WebhookDelivery represents a webhook delivery attempt
type WebhookDelivery struct {
	ID          uint         `json:"id" gorm:"primaryKey"`
	EventID     uint         `json:"event_id"`
	Event       WebhookEvent `json:"event" gorm:"foreignKey:EventID"`
	Status      EventStatus  `json:"status"`
	Response    string       `json:"response"`
	AttemptedAt time.Time    `json:"attempted_at"`
	CreatedAt   time.Time    `json:"created_at"`
}
