package services

import (
	"niyama-backend/internal/config"
	"niyama-backend/internal/database"
	"niyama-backend/internal/websocket"
)

type Services struct {
	Auth          *AuthService
	Policy        *PolicyService
	PolicyVersion *PolicyVersionService
	Webhook       *WebhookService
	Notification  *NotificationService
	Template      *TemplateService
	Compliance    *ComplianceService
	AI            *AIService
	Monitoring    *MonitoringService
	User          *UserService
	Validator     *ValidatorService
	Evidence      *EvidenceService
	Scanner       *ScannerService
	Drift         *DriftService
	Scheduler     *SchedulerService
}

func NewServices(db *database.Database, cfg *config.Config, hub *websocket.Hub) *Services {
	policyService := NewPolicyService(db, cfg)

	var policyVersionService *PolicyVersionService
	var webhookService *WebhookService
	var notificationService *NotificationService

	if db != nil {
		policyVersionService = NewPolicyVersionService(db.DB)
		webhookService = NewWebhookService(db.DB)
		notificationService = NewNotificationService(db.DB, hub)
	}
	return &Services{
		Auth:          NewAuthService(db, cfg),
		Policy:        policyService,
		PolicyVersion: policyVersionService,
		Webhook:       webhookService,
		Notification:  notificationService,
		Template:      NewTemplateService(db, cfg),
		Compliance:    NewComplianceService(db, cfg),
		AI:            NewAIService(db, cfg),
		Monitoring:    NewMonitoringService(db, cfg),
		User:          NewUserService(db, cfg),
		Validator:     NewValidatorService(db, cfg, policyService),
		Evidence:      NewEvidenceService(db, cfg),
		Scanner:       NewScannerService(db, cfg),
		Drift:         NewDriftService(db, cfg),
		Scheduler:     NewSchedulerService(db, cfg),
	}
}
