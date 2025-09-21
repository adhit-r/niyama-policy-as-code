package handlers

import (
	"niyama-backend/internal/config"
	"niyama-backend/internal/database"
	"niyama-backend/internal/services"
)

type Handlers struct {
	Health     *HealthHandler
	Auth       *AuthHandler
	Policy     *PolicyHandler
	Template   *TemplateHandler
	Compliance *ComplianceHandler
	AI         *AIHandler
	Monitoring *MonitoringHandler
	User       *UserHandler
}

func NewHandlers(services *services.Services, db *database.Database, cfg *config.Config) *Handlers {
	return &Handlers{
		Health:     NewHealthHandler(db, cfg),
		Auth:       NewAuthHandler(services.Auth),
		Policy:     NewPolicyHandler(services.Policy),
		Template:   NewTemplateHandler(services.Template),
		Compliance: NewComplianceHandler(services.Compliance),
		AI:         NewAIHandler(services.AI),
		Monitoring: NewMonitoringHandler(services.Monitoring),
		User:       NewUserHandler(services.User),
	}
}
