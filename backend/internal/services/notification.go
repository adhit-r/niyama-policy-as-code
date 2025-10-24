package services

import (
	"fmt"
	"time"

	"niyama-backend/internal/models"
	"niyama-backend/internal/websocket"

	"gorm.io/gorm"
)

type NotificationService struct {
	db  *gorm.DB
	hub *websocket.Hub
}

func NewNotificationService(db *gorm.DB, hub *websocket.Hub) *NotificationService {
	return &NotificationService{
		db:  db,
		hub: hub,
	}
}

// CreateNotification creates a new notification
func (s *NotificationService) CreateNotification(notification *models.Notification) error {
	if err := s.db.Create(notification).Error; err != nil {
		return fmt.Errorf("failed to create notification: %w", err)
	}

	// Send real-time notification via WebSocket
	s.sendRealtimeNotification(notification)

	return nil
}

// GetNotifications retrieves notifications for a user
func (s *NotificationService) GetNotifications(userID uint, limit int, offset int) ([]models.Notification, error) {
	var notifications []models.Notification
	query := s.db.Where("user_id = ?", userID).
		Order("created_at DESC").
		Offset(offset)

	if limit > 0 {
		query = query.Limit(limit)
	}

	err := query.Find(&notifications).Error
	return notifications, err
}

// GetUnreadCount returns the count of unread notifications for a user
func (s *NotificationService) GetUnreadCount(userID uint) (int64, error) {
	var count int64
	err := s.db.Model(&models.Notification{}).
		Where("user_id = ? AND is_read = ?", userID, false).
		Count(&count).Error
	return count, err
}

// MarkAsRead marks a notification as read
func (s *NotificationService) MarkAsRead(notificationID uint, userID uint) error {
	return s.db.Model(&models.Notification{}).
		Where("id = ? AND user_id = ?", notificationID, userID).
		Update("is_read", true).Error
}

// MarkAllAsRead marks all notifications as read for a user
func (s *NotificationService) MarkAllAsRead(userID uint) error {
	return s.db.Model(&models.Notification{}).
		Where("user_id = ? AND is_read = ?", userID, false).
		Update("is_read", true).Error
}

// ArchiveNotification archives a notification
func (s *NotificationService) ArchiveNotification(notificationID uint, userID uint) error {
	return s.db.Model(&models.Notification{}).
		Where("id = ? AND user_id = ?", notificationID, userID).
		Update("is_archived", true).Error
}

// DeleteNotification deletes a notification
func (s *NotificationService) DeleteNotification(notificationID uint, userID uint) error {
	return s.db.Where("id = ? AND user_id = ?", notificationID, userID).
		Delete(&models.Notification{}).Error
}

// CreateActivity creates a new activity
func (s *NotificationService) CreateActivity(activity *models.Activity) error {
	if err := s.db.Create(activity).Error; err != nil {
		return fmt.Errorf("failed to create activity: %w", err)
	}

	// Send real-time activity via WebSocket
	s.sendRealtimeActivity(activity)

	return nil
}

// GetActivities retrieves activities for a user or organization
func (s *NotificationService) GetActivities(userID uint, orgID uint, limit int, offset int) ([]models.Activity, error) {
	var activities []models.Activity
	query := s.db.Where("organization_id = ?", orgID).
		Order("created_at DESC").
		Offset(offset)

	if limit > 0 {
		query = query.Limit(limit)
	}

	err := query.Find(&activities).Error
	return activities, err
}

// NotifyPolicyViolation creates a notification for policy violation
func (s *NotificationService) NotifyPolicyViolation(userID uint, orgID uint, policyID uint, policyName string, severity string) error {
	notification := &models.Notification{
		UserID:         userID,
		OrganizationID: orgID,
		Type:           models.NotificationTypePolicyViolation,
		Title:          "Policy Violation Detected",
		Message:        fmt.Sprintf("Policy '%s' has been violated", policyName),
		Data: map[string]interface{}{
			"policy_id":   policyID,
			"policy_name": policyName,
			"severity":    severity,
		},
		Priority: s.getPriorityFromSeverity(severity),
	}

	return s.CreateNotification(notification)
}

// NotifyPolicyCreated creates a notification for policy creation
func (s *NotificationService) NotifyPolicyCreated(userID uint, orgID uint, policyID uint, policyName string) error {
	notification := &models.Notification{
		UserID:         userID,
		OrganizationID: orgID,
		Type:           models.NotificationTypePolicyCreated,
		Title:          "New Policy Created",
		Message:        fmt.Sprintf("Policy '%s' has been created", policyName),
		Data: map[string]interface{}{
			"policy_id":   policyID,
			"policy_name": policyName,
		},
		Priority: models.PriorityNormal,
	}

	return s.CreateNotification(notification)
}

// NotifyScanCompleted creates a notification for scan completion
func (s *NotificationService) NotifyScanCompleted(userID uint, orgID uint, scanID uint, results map[string]interface{}) error {
	notification := &models.Notification{
		UserID:         userID,
		OrganizationID: orgID,
		Type:           models.NotificationTypeScanCompleted,
		Title:          "Scan Completed",
		Message:        "Security scan has been completed",
		Data: map[string]interface{}{
			"scan_id": scanID,
			"results": results,
		},
		Priority: models.PriorityNormal,
	}

	return s.CreateNotification(notification)
}

// sendRealtimeNotification sends a notification via WebSocket
func (s *NotificationService) sendRealtimeNotification(notification *models.Notification) {
	message := &websocket.Message{
		Type: "notification",
		Data: map[string]interface{}{
			"id":       notification.ID,
			"type":     notification.Type,
			"title":    notification.Title,
			"message":  notification.Message,
			"priority": notification.Priority,
			"data":     notification.Data,
		},
		Timestamp: time.Now().Format(time.RFC3339),
		UserID:    notification.UserID,
		OrgID:     notification.OrganizationID,
	}

	s.hub.BroadcastToUser(notification.UserID, message)
}

// sendRealtimeActivity sends an activity via WebSocket
func (s *NotificationService) sendRealtimeActivity(activity *models.Activity) {
	message := &websocket.Message{
		Type: "activity",
		Data: map[string]interface{}{
			"id":          activity.ID,
			"type":        activity.Type,
			"title":       activity.Title,
			"description": activity.Description,
			"data":        activity.Data,
		},
		Timestamp: time.Now().Format(time.RFC3339),
		UserID:    activity.UserID,
		OrgID:     activity.OrganizationID,
	}

	// Broadcast to all users in the organization
	s.hub.BroadcastToOrganization(activity.OrganizationID, message)
}

// getPriorityFromSeverity converts severity to notification priority
func (s *NotificationService) getPriorityFromSeverity(severity string) models.NotificationPriority {
	switch severity {
	case "critical":
		return models.PriorityUrgent
	case "high":
		return models.PriorityHigh
	case "medium":
		return models.PriorityNormal
	case "low":
		return models.PriorityLow
	default:
		return models.PriorityNormal
	}
}
