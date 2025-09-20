package services

import (
	"niyama-backend/internal/config"
	"niyama-backend/internal/database"
)

type PolicyService struct {
	db  *database.Database
	cfg *config.Config
}

func NewPolicyService(db *database.Database, cfg *config.Config) *PolicyService {
	return &PolicyService{
		db:  db,
		cfg: cfg,
	}
}
