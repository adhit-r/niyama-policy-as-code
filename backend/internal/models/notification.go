package models

import (
	"time"

	"gorm.io/gorm"
)

// Notification represents a notification for a user
type Notification struct {
	ID             uint                   `json:"id" gorm:"primaryKey"`
	UserID         uint                   `json:"user_id"`
	User           User                   `json:"user" gorm:"foreignKey:UserID"`
	OrganizationID uint                   `json:"organization_id"`
	Organization   Organization           `json:"organization" gorm:"foreignKey:OrganizationID"`
	Type           NotificationType       `json:"type"`
	Title          string                 `json:"title"`
	Message        string                 `json:"message"`
	Data           map[string]interface{} `json:"data" gorm:"serializer:json"`
	IsRead         bool                   `json:"is_read" gorm:"default:false"`
	IsArchived     bool                   `json:"is_archived" gorm:"default:false"`
	Priority       NotificationPriority   `json:"priority" gorm:"default:normal"`
	CreatedAt      time.Time              `json:"created_at"`
	UpdatedAt      time.Time              `json:"updated_at"`
	DeletedAt      gorm.DeletedAt         `json:"-" gorm:"index"`
}

// NotificationType represents the type of notification
type NotificationType string

const (
	NotificationTypePolicyViolation NotificationType = "policy_violation"
	NotificationTypePolicyCreated   NotificationType = "policy_created"
	NotificationTypePolicyUpdated   NotificationType = "policy_updated"
	NotificationTypePolicyDeleted   NotificationType = "policy_deleted"
	NotificationTypeScanCompleted   NotificationType = "scan_completed"
	NotificationTypeDriftDetected   NotificationType = "drift_detected"
	NotificationTypeSystemAlert     NotificationType = "system_alert"
	NotificationTypeUserMention     NotificationType = "user_mention"
	NotificationTypeWebhookFailed   NotificationType = "webhook_failed"
)

func (t NotificationType) String() string {
	return string(t)
}

func (t NotificationType) IsValid() bool {
	switch t {
	case NotificationTypePolicyViolation, NotificationTypePolicyCreated, NotificationTypePolicyUpdated,
		NotificationTypePolicyDeleted, NotificationTypeScanCompleted, NotificationTypeDriftDetected,
		NotificationTypeSystemAlert, NotificationTypeUserMention, NotificationTypeWebhookFailed:
		return true
	default:
		return false
	}
}

// NotificationPriority represents the priority of a notification
type NotificationPriority string

const (
	PriorityLow    NotificationPriority = "low"
	PriorityNormal NotificationPriority = "normal"
	PriorityHigh   NotificationPriority = "high"
	PriorityUrgent NotificationPriority = "urgent"
)

func (p NotificationPriority) String() string {
	return string(p)
}

func (p NotificationPriority) IsValid() bool {
	switch p {
	case PriorityLow, PriorityNormal, PriorityHigh, PriorityUrgent:
		return true
	default:
		return false
	}
}

// Activity represents an activity in the system
type Activity struct {
	ID             uint                   `json:"id" gorm:"primaryKey"`
	UserID         uint                   `json:"user_id"`
	User           User                   `json:"user" gorm:"foreignKey:UserID"`
	OrganizationID uint                   `json:"organization_id"`
	Organization   Organization           `json:"organization" gorm:"foreignKey:OrganizationID"`
	Type           ActivityType           `json:"type"`
	Title          string                 `json:"title"`
	Description    string                 `json:"description"`
	Data           map[string]interface{} `json:"data" gorm:"serializer:json"`
	CreatedAt      time.Time              `json:"created_at"`
	UpdatedAt      time.Time              `json:"updated_at"`
	DeletedAt      gorm.DeletedAt         `json:"-" gorm:"index"`
}

// ActivityType represents the type of activity
type ActivityType string

const (
	ActivityTypePolicyCreated   ActivityType = "policy_created"
	ActivityTypePolicyUpdated   ActivityType = "policy_updated"
	ActivityTypePolicyDeleted   ActivityType = "policy_deleted"
	ActivityTypePolicyEvaluated ActivityType = "policy_evaluated"
	ActivityTypeScanStarted     ActivityType = "scan_started"
	ActivityTypeScanCompleted   ActivityType = "scan_completed"
	ActivityTypeDriftDetected   ActivityType = "drift_detected"
	ActivityTypeUserLogin       ActivityType = "user_login"
	ActivityTypeUserLogout      ActivityType = "user_logout"
	ActivityTypeWebhookSent     ActivityType = "webhook_sent"
	ActivityTypeWebhookFailed   ActivityType = "webhook_failed"
)

func (t ActivityType) String() string {
	return string(t)
}

func (t ActivityType) IsValid() bool {
	switch t {
	case ActivityTypePolicyCreated, ActivityTypePolicyUpdated, ActivityTypePolicyDeleted,
		ActivityTypePolicyEvaluated, ActivityTypeScanStarted, ActivityTypeScanCompleted,
		ActivityTypeDriftDetected, ActivityTypeUserLogin, ActivityTypeUserLogout,
		ActivityTypeWebhookSent, ActivityTypeWebhookFailed:
		return true
	default:
		return false
	}
}
