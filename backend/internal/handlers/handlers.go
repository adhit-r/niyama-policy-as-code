package handlers

import (
	"niyama-backend/internal/services"
	"niyama-backend/internal/websocket"
)

type Handlers struct {
	Health       *HealthHandler
	Auth         *AuthHandler
	Policy       *PolicyHandler
	Webhook      *WebhookHandler
	Notification *NotificationHandler
	WebSocket    *WebSocketHandler
	Template     *TemplateHandler
	Compliance   *ComplianceHandler
	AI           *AIHandler
	Monitoring   *MonitoringHandler
	User         *UserHandler
	Validator    *ValidatorHandler
	Evidence     *EvidenceHandler
	Scanner      *ScannerHandler
	Drift        *DriftHandler
	Scheduler    *SchedulerHandler
}

func NewHandlers(services *services.Services, hub *websocket.Hub) *Handlers {
	handlers := &Handlers{
		Health:     NewHealthHandler(),
		Auth:       NewAuthHandler(services.Auth),
		Policy:     NewPolicyHandler(services.Policy, services.PolicyVersion),
		WebSocket:  NewWebSocketHandler(hub),
		Template:   NewTemplateHandler(services.Template),
		Compliance: NewComplianceHandler(services.Compliance),
		AI:         NewAIHandler(services.AI),
		Monitoring: NewMonitoringHandler(services.Monitoring),
		User:       NewUserHandler(services.User),
		Validator:  NewValidatorHandler(services.Validator),
		Evidence:   NewEvidenceHandler(services.Evidence),
		Scanner:    NewScannerHandler(services.Scanner),
		Drift:      NewDriftHandler(services.Drift),
		Scheduler:  NewSchedulerHandler(services.Scheduler),
	}

	// Only initialize handlers that depend on database services if they exist
	if services.Webhook != nil {
		handlers.Webhook = NewWebhookHandler(services.Webhook)
	}
	if services.Notification != nil {
		handlers.Notification = NewNotificationHandler(services.Notification)
	}

	return handlers
}
