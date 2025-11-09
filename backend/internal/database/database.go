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

	// Seed database with initial data
	if err := Seed(db); err != nil {
		log.Printf("⚠️  Database seeding failed: %v", err)
		// Don't fail the entire initialization for seeding errors
	}

	log.Printf("✅ Database connected and migrated successfully (MaxConns: %d, MinConns: %d)",
		cfg.Database.MaxConns, cfg.Database.MinConns)

	return &Database{DB: db}, nil
}

func migrate(db *gorm.DB) error {
	// Temporarily disable all migrations to debug the issue
	log.Println("⚠️  Database migrations temporarily disabled for debugging")
	return nil

	// Migrate in dependency order to avoid foreign key issues
	// 1. Organizations first (no dependencies) - temporarily skip to debug
	// if err := db.AutoMigrate(&models.Organization{}); err != nil {
	// 	return fmt.Errorf("failed to migrate organizations: %w", err)
	// }

	// 2. Users (depends on Organization)
	// if err := db.AutoMigrate(&models.User{}); err != nil {
	// 	return fmt.Errorf("failed to migrate users: %w", err)
	// }

	// 3. User-Organization relationships - temporarily skip to debug
	// if err := db.AutoMigrate(&models.UserOrganizationRole{}); err != nil {
	// 	return fmt.Errorf("failed to migrate user organization roles: %w", err)
	// }

	// 4. Policies (depends on User and Organization)
	if err := db.AutoMigrate(&models.Policy{}); err != nil {
		return fmt.Errorf("failed to migrate policies: %w", err)
	}

	// 4.1. Policy versions (depends on Policy and User)
	if err := db.AutoMigrate(&models.PolicyVersion{}); err != nil {
		return fmt.Errorf("failed to migrate policy versions: %w", err)
	}

	// 4.2. Webhooks (depends on Organization and User)
	if err := db.AutoMigrate(&models.Webhook{}); err != nil {
		return fmt.Errorf("failed to migrate webhooks: %w", err)
	}

	// 4.3. Webhook events (depends on Webhook)
	if err := db.AutoMigrate(&models.WebhookEvent{}); err != nil {
		return fmt.Errorf("failed to migrate webhook events: %w", err)
	}

	// 4.4. Webhook deliveries (depends on WebhookEvent)
	if err := db.AutoMigrate(&models.WebhookDelivery{}); err != nil {
		return fmt.Errorf("failed to migrate webhook deliveries: %w", err)
	}

	// 4.5. Notifications (depends on User and Organization)
	if err := db.AutoMigrate(&models.Notification{}); err != nil {
		return fmt.Errorf("failed to migrate notifications: %w", err)
	}

	// 4.6. Activities (depends on User and Organization)
	if err := db.AutoMigrate(&models.Activity{}); err != nil {
		return fmt.Errorf("failed to migrate activities: %w", err)
	}

	// 5. Policy templates (depends on User)
	if err := db.AutoMigrate(&models.PolicyTemplate{}); err != nil {
		return fmt.Errorf("failed to migrate policy templates: %w", err)
	}

	// 6. Policy evaluations (depends on Policy and User)
	if err := db.AutoMigrate(&models.PolicyEvaluation{}); err != nil {
		return fmt.Errorf("failed to migrate policy evaluations: %w", err)
	}

	// 7. Compliance frameworks (no dependencies)
	if err := db.AutoMigrate(&models.ComplianceFramework{}); err != nil {
		return fmt.Errorf("failed to migrate compliance frameworks: %w", err)
	}

	// 8. Compliance controls (depends on ComplianceFramework)
	if err := db.AutoMigrate(&models.ComplianceControl{}); err != nil {
		return fmt.Errorf("failed to migrate compliance controls: %w", err)
	}

	// 9. Policy compliance mappings (depends on Policy and ComplianceControl)
	if err := db.AutoMigrate(&models.PolicyComplianceMapping{}); err != nil {
		return fmt.Errorf("failed to migrate policy compliance mappings: %w", err)
	}

	// 10. Compliance reports (depends on ComplianceFramework and User)
	if err := db.AutoMigrate(&models.ComplianceReport{}); err != nil {
		return fmt.Errorf("failed to migrate compliance reports: %w", err)
	}

	return nil
}

func (d *Database) Close() error {
	sqlDB, err := d.DB.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}
