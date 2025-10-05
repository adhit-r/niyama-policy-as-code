package services

import (
	"niyama-backend/internal/config"
	"niyama-backend/internal/database"
)

type ComplianceService struct {
	db  *database.Database
	cfg *config.Config
}

func NewComplianceService(db *database.Database, cfg *config.Config) *ComplianceService {
	return &ComplianceService{
		db:  db,
		cfg: cfg,
	}
}
