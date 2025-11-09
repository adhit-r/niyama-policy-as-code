package database

import (
	"log"

	"niyama-backend/internal/models"

	"gorm.io/gorm"
)

// Seed seeds the database with initial data
func Seed(db *gorm.DB) error {
	log.Println("🌱 Seeding database with initial data...")

	// Create default organization
	org := &models.Organization{
		Name:        "Default Organization",
		Slug:        "default",
		Description: "Default organization for development",
		Settings:    `{"theme":"light","timezone":"UTC"}`,
		IsActive:    true,
	}

	// Check if organization already exists
	var existingOrg models.Organization
	if err := db.Where("slug = ?", "default").First(&existingOrg).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			// Create the organization
			if err := db.Create(org).Error; err != nil {
				return err
			}
			log.Println("✅ Created default organization")
		} else {
			return err
		}
	} else {
		log.Println("ℹ️  Default organization already exists")
	}

	// Create default admin user
	adminUser := &models.User{
		Email:     "admin@niyama.local",
		Username:  "admin",
		Password:  "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
		FirstName: "Admin",
		LastName:  "User",
		Role:      models.GlobalRoleAdmin,
		IsActive:  true,
		// DefaultOrgID: &org.ID, // Temporarily commented out
	}

	// Check if admin user already exists
	var existingUser models.User
	if err := db.Where("email = ?", "admin@niyama.local").First(&existingUser).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			// Create the admin user
			if err := db.Create(adminUser).Error; err != nil {
				return err
			}
			log.Println("✅ Created default admin user")
		} else {
			return err
		}
	} else {
		log.Println("ℹ️  Default admin user already exists")
	}

	// Create user-organization role
	userOrgRole := &models.UserOrganizationRole{
		UserID:         adminUser.ID,
		OrganizationID: org.ID,
		Role:           models.RoleOwner,
		Permissions:    `["*"]`, // All permissions
	}

	// Check if role already exists
	var existingRole models.UserOrganizationRole
	if err := db.Where("user_id = ? AND organization_id = ?", adminUser.ID, org.ID).First(&existingRole).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			// Create the role
			if err := db.Create(userOrgRole).Error; err != nil {
				return err
			}
			log.Println("✅ Created user-organization role")
		} else {
			return err
		}
	} else {
		log.Println("ℹ️  User-organization role already exists")
	}

	// Create sample compliance frameworks
	frameworks := []models.ComplianceFramework{
		{
			Name:        "SOC 2 Type II",
			Description: "Service Organization Control 2 Type II compliance framework",
			Version:     "2017",
			Type:        "SOC2",
			IsActive:    true,
		},
		{
			Name:        "HIPAA",
			Description: "Health Insurance Portability and Accountability Act",
			Version:     "2021",
			Type:        "HIPAA",
			IsActive:    true,
		},
		{
			Name:        "GDPR",
			Description: "General Data Protection Regulation",
			Version:     "2018",
			Type:        "GDPR",
			IsActive:    true,
		},
	}

	for _, framework := range frameworks {
		var existingFramework models.ComplianceFramework
		if err := db.Where("name = ? AND type = ?", framework.Name, framework.Type).First(&existingFramework).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				if err := db.Create(&framework).Error; err != nil {
					log.Printf("⚠️  Failed to create framework %s: %v", framework.Name, err)
				} else {
					log.Printf("✅ Created compliance framework: %s", framework.Name)
				}
			} else {
				log.Printf("⚠️  Error checking framework %s: %v", framework.Name, err)
			}
		} else {
			log.Printf("ℹ️  Framework %s already exists", framework.Name)
		}
	}

	log.Println("✅ Database seeding completed")
	return nil
}
