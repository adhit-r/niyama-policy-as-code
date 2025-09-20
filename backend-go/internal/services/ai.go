package services

import (
	"niyama-backend/internal/config"
	"niyama-backend/internal/database"
)

type AIService struct {
	db  *database.Database
	cfg *config.Config
}

func NewAIService(db *database.Database, cfg *config.Config) *AIService {
	return &AIService{
		db:  db,
		cfg: cfg,
	}
}
