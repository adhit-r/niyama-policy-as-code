package database

import (
	"fmt"
	"log"
	"time"

	"niyama-backend/internal/config"
	"niyama-backend/internal/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

type Database struct {
	DB *gorm.DB
}

func Initialize(cfg *config.Config) (*Database, error) {
	// Parse database URL and connect
	db, err := gorm.Open(postgres.Open(cfg.Database.URL), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// Get underlying sql.DB for connection pool configuration
	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to get database instance: %w", err)
	}

	// Configure connection pool
	sqlDB.SetMaxOpenConns(cfg.Database.MaxConns)
	sqlDB.SetMaxIdleConns(cfg.Database.MinConns)
	sqlDB.SetConnMaxLifetime(time.Hour)

	// Test connection
	if err := sqlDB.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	// Auto-migrate models
	if err := migrate(db); err != nil {
		return nil, fmt.Errorf("failed to migrate database: %w", err)
	}

	log.Printf("✅ Database connected and migrated successfully (MaxConns: %d, MinConns: %d)",
		cfg.Database.MaxConns, cfg.Database.MinConns)

	return &Database{DB: db}, nil
}

func migrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&models.User{},
		&models.Organization{},
		&models.UserOrganizationRole{},
		&models.Policy{},
		&models.PolicyTemplate{},
		&models.PolicyEvaluation{},
		&models.ComplianceFramework{},
		&models.ComplianceControl{},
		&models.PolicyComplianceMapping{},
		&models.ComplianceReport{},
	)
}

func (d *Database) Close() error {
	sqlDB, err := d.DB.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}

// Seed seeds the database with initial data
func Seed(db *gorm.DB) error {
	log.Println("🌱 Seeding database with initial data...")

	// Add any initial data seeding logic here
	// For now, we'll just log that seeding is complete
	log.Println("✅ Database seeding completed")

	return nil
}
