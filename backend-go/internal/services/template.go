package services

import (
	"niyama-backend/internal/config"
	"niyama-backend/internal/database"
)

type TemplateService struct {
	db  *database.Database
	cfg *config.Config
}

func NewTemplateService(db *database.Database, cfg *config.Config) *TemplateService {
	return &TemplateService{
		db:  db,
		cfg: cfg,
	}
}
