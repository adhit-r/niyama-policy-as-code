package services

import (
	"niyama-backend/internal/config"
	"niyama-backend/internal/database"
)

type UserService struct {
	db  *database.Database
	cfg *config.Config
}

func NewUserService(db *database.Database, cfg *config.Config) *UserService {
	return &UserService{
		db:  db,
		cfg: cfg,
	}
}
