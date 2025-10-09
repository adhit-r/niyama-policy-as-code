package services

import (
	"niyama-backend/internal/config"
	"niyama-backend/internal/database"
)

type MonitoringService struct {
	db  *database.Database
	cfg *config.Config
}

func NewMonitoringService(db *database.Database, cfg *config.Config) *MonitoringService {
	return &MonitoringService{
		db:  db,
		cfg: cfg,
	}
}
