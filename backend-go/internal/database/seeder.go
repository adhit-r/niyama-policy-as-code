package database

import (
	"log"
	"time"

	"niyama-backend/internal/models"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// Seed initial data into the database
func Seed(db *gorm.DB) error {
	log.Println("🌱 Seeding database with initial data...")

	// Create default organization
	org := &models.Organization{
		Name:        "Niyama Default Organization",
		Slug:        "niyama-default",
		Description: "Default organization for Niyama platform",
		Settings: map[string]interface{}{
			"theme":        "orange",
			"timezone":     "UTC",
			"date_format":  "YYYY-MM-DD",
			"time_format":  "24h",
		},
		IsActive: true,
	}

	if err := db.FirstOrCreate(org, models.Organization{Slug: "niyama-default"}).Error; err != nil {
		return err
	}

	// Create default admin user
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	adminUser := &models.User{
		Email:        "admin@niyama.dev",
		Username:     "admin",
		Password:     string(hashedPassword),
		FirstName:    "Admin",
		LastName:     "User",
		Role:         models.GlobalRoleAdmin,
		IsActive:     true,
		DefaultOrgID: &org.ID,
		LastLogin:    &[]time.Time{time.Now()}[0],
	}

	if err := db.FirstOrCreate(adminUser, models.User{Email: "admin@niyama.dev"}).Error; err != nil {
		return err
	}

	// Create organization role for admin
	orgRole := &models.UserOrganizationRole{
		UserID:         adminUser.ID,
		OrganizationID: org.ID,
		Role:           models.RoleOwner,
		Permissions:    models.GetPermissionsForRole(models.RoleOwner),
	}

	if err := db.FirstOrCreate(orgRole, models.UserOrganizationRole{
		UserID:         adminUser.ID,
		OrganizationID: org.ID,
	}).Error; err != nil {
		return err
	}

	// Create sample policies
	samplePolicies := []models.Policy{
		{
			Name:         "Kubernetes Security Policy",
			Description: "Basic security policy for Kubernetes clusters",
			Content: `package kubernetes.security

import future.keywords.if

default allow := false

allow if {
    input.kind == "Pod"
    input.spec.securityContext.runAsNonRoot == true
    input.spec.securityContext.readOnlyRootFilesystem == true
}`,
			Language:       "rego",
			Category:       "Security",
			AccessLevel:    models.AccessPublic,
			Status:         models.StatusActive,
			AuthorID:       adminUser.ID,
			OrganizationID: org.ID,
			Tags:           []string{"kubernetes", "security", "containers"},
			Metadata: map[string]interface{}{
				"version": "1.0.0",
				"author":  "Niyama Team",
			},
		},
		{
			Name:         "Resource Limits Policy",
			Description: "Enforce resource limits on containers",
			Content: `package resource.limits

import future.keywords.if

default allow := false

allow if {
    input.kind == "Pod"
    input.spec.containers[_].resources.limits.cpu
    input.spec.containers[_].resources.limits.memory
}`,
			Language:       "rego",
			Category:       "Resource Management",
			AccessLevel:    models.AccessPublic,
			Status:         models.StatusActive,
			AuthorID:       adminUser.ID,
			OrganizationID: org.ID,
			Tags:           []string{"kubernetes", "resources", "limits"},
			Metadata: map[string]interface{}{
				"version": "1.0.0",
				"author":  "Niyama Team",
			},
		},
	}

	for _, policy := range samplePolicies {
		if err := db.FirstOrCreate(&policy, models.Policy{Name: policy.Name, OrganizationID: org.ID}).Error; err != nil {
			log.Printf("Warning: Failed to create policy %s: %v", policy.Name, err)
		}
	}

	// Create sample templates
	sampleTemplates := []models.PolicyTemplate{
		{
			Name:        "Docker Security Template",
			Description: "Security best practices for Docker containers",
			Content: `package docker.security

import future.keywords.if

default allow := false

allow if {
    input.Image != ""
    not input.Image == "latest"
    input.User != "root"
}`,
			Language: "rego",
			Category: "Security",
			Tags:     []string{"docker", "security", "containers"},
			IsPublic: true,
			AuthorID: adminUser.ID,
		},
		{
			Name:        "AWS S3 Bucket Policy",
			Description: "Secure S3 bucket configuration template",
			Content: `package aws.s3

import future.keywords.if

default allow := false

allow if {
    input.BucketPolicy.Version == "2012-10-17"
    input.BucketPolicy.Statement[_].Effect == "Deny"
    input.BucketPolicy.Statement[_].Condition.StringNotEquals["s3:x-amz-server-side-encryption"]
}`,
			Language: "rego",
			Category: "Cloud Security",
			Tags:     []string{"aws", "s3", "security", "encryption"},
			IsPublic: true,
			AuthorID: adminUser.ID,
		},
	}

	for _, template := range sampleTemplates {
		if err := db.FirstOrCreate(&template, models.PolicyTemplate{Name: template.Name}).Error; err != nil {
			log.Printf("Warning: Failed to create template %s: %v", template.Name, err)
		}
	}

	// Create compliance frameworks
	frameworks := []models.ComplianceFramework{
		{
			Name:        "SOC 2 Type II",
			Description: "Service Organization Control 2 Type II compliance framework",
			Version:     "2023",
			Type:        "SOC2",
			IsActive:    true,
		},
		{
			Name:        "HIPAA",
			Description: "Health Insurance Portability and Accountability Act",
			Version:     "2023",
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
		{
			Name:        "ISO 27001",
			Description: "Information Security Management System",
			Version:     "2022",
			Type:        "ISO27001",
			IsActive:    true,
		},
	}

	for _, framework := range frameworks {
		if err := db.FirstOrCreate(&framework, models.ComplianceFramework{Name: framework.Name}).Error; err != nil {
			log.Printf("Warning: Failed to create framework %s: %v", framework.Name, err)
		}
	}

	log.Println("✅ Database seeding completed successfully!")
	return nil
}
