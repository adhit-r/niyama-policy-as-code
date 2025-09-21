package database

import (
	"fmt"
	"log"
	"strings"

	"niyama-backend/internal/config"
	"niyama-backend/internal/models"

	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

type Database struct {
	DB *gorm.DB
}

func Initialize(cfg *config.Config) (*Database, error) {
	var db *gorm.DB
	var err error

	// Determine database type based on URL
	if strings.HasPrefix(cfg.Database.URL, "postgresql://") || strings.HasPrefix(cfg.Database.URL, "postgres://") {
		// PostgreSQL connection
		db, err = gorm.Open(postgres.Open(cfg.Database.URL), &gorm.Config{
			Logger: logger.Default.LogMode(logger.Info),
		})
		log.Println("🐘 Using PostgreSQL database")
	} else if strings.HasPrefix(cfg.Database.URL, "sqlite://") || strings.HasSuffix(cfg.Database.URL, ".db") {
		// SQLite connection
		dbPath := strings.TrimPrefix(cfg.Database.URL, "sqlite://")
		db, err = gorm.Open(sqlite.Open(dbPath), &gorm.Config{
			Logger: logger.Default.LogMode(logger.Info),
		})
		log.Printf("🗃️  Using SQLite database: %s", dbPath)
	} else {
		// Default to SQLite if URL is unclear
		dbPath := "niyama.db"
		db, err = gorm.Open(sqlite.Open(dbPath), &gorm.Config{
			Logger: logger.Default.LogMode(logger.Info),
		})
		log.Printf("🗃️  Defaulting to SQLite database: %s", dbPath)
	}

	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// Test connection
	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to get database instance: %w", err)
	}

	if err := sqlDB.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	// Auto-migrate models
	if err := migrate(db); err != nil {
		return nil, fmt.Errorf("failed to migrate database: %w", err)
	}

	log.Println("✅ Database connected and migrated successfully")

	return &Database{DB: db}, nil
}

func migrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&models.User{},
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
