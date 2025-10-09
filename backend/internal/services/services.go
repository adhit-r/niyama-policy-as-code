package services

import (
	"niyama-backend/internal/config"
	"niyama-backend/internal/database"
)

type Services struct {
	Auth      *AuthService
	Policy    *PolicyService
	Template  *TemplateService
	Compliance *ComplianceService
	AI        *AIService
	Monitoring *MonitoringService
	User      *UserService
}

func NewServices(db *database.Database, cfg *config.Config) *Services {
	return &Services{
		Auth:      NewAuthService(db, cfg),
		Policy:    NewPolicyService(db, cfg),
		Template:  NewTemplateService(db, cfg),
		Compliance: NewComplianceService(db, cfg),
		AI:        NewAIService(db, cfg),
		Monitoring: NewMonitoringService(db, cfg),
		User:      NewUserService(db, cfg),
	}
}
