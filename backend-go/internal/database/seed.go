package database

import (
	"fmt"
	"log"
	"time"

	"niyama-backend/internal/models"
)

// SeedDatabase populates the database with initial data
func (d *Database) SeedDatabase() error {
	if d.DB == nil {
		return fmt.Errorf("database connection not available")
	}

	log.Println("🌱 Seeding database with sample data...")

	// Check if data already exists
	var userCount int64
	d.DB.Model(&models.User{}).Count(&userCount)
	if userCount > 0 {
		log.Println("📊 Database already contains data, skipping seed")
		return nil
	}

	// Create default organization
	org := &models.Organization{
		ID:          1,
		Name:        "Default Organization",
		Domain:      "niyama.dev",
		Description: "Default organization for Niyama platform",
		IsActive:    true,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if err := d.DB.Create(org).Error; err != nil {
		return fmt.Errorf("failed to create organization: %w", err)
	}

	// Create admin user
	adminUser := &models.User{
		ID:           1,
		Email:        "admin@niyama.dev",
		Username:     "admin",
		Password:     "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
		FirstName:    "System",
		LastName:     "Administrator",
		Role:         models.GlobalRoleAdmin,
		IsActive:     true,
		DefaultOrgID: &org.ID,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	if err := d.DB.Create(adminUser).Error; err != nil {
		return fmt.Errorf("failed to create admin user: %w", err)
	}

	// Create regular user
	regularUser := &models.User{
		ID:           2,
		Email:        "user@niyama.dev",
		Username:     "user",
		Password:     "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
		FirstName:    "Regular",
		LastName:     "User",
		Role:         models.GlobalRoleUser,
		IsActive:     true,
		DefaultOrgID: &org.ID,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	if err := d.DB.Create(regularUser).Error; err != nil {
		return fmt.Errorf("failed to create regular user: %w", err)
	}

	// Create sample policies
	policies := []models.Policy{
		{
			ID:             1,
			Name:           "Kubernetes Security Policy",
			Description:    "Ensures all pods have security contexts and run as non-root",
			Content:        `package kubernetes.security\n\nimport rego.v1\n\n# Deny containers running as root\ndeny contains msg if {\n    input.kind == "Pod"\n    some i in input.spec.containers\n    i.securityContext.runAsUser == 0\n    msg := sprintf("Container '%s' must not run as root user", [i.name])\n}\n\n# Deny containers with privileged escalation\ndeny contains msg if {\n    input.kind == "Pod"\n    some i in input.spec.containers\n    i.securityContext.allowPrivilegeEscalation == true\n    msg := sprintf("Container '%s' must not allow privilege escalation", [i.name])\n}\n\n# Require read-only root filesystem\ndeny contains msg if {\n    input.kind == "Pod"\n    some i in input.spec.containers\n    not i.securityContext.readOnlyRootFilesystem == true\n    msg := sprintf("Container '%s' must have a read-only root filesystem", [i.name])\n}`,
			Language:       "rego",
			Category:       "security",
			Status:         models.StatusActive,
			Version:        1,
			AuthorID:       adminUser.ID,
			OrganizationID: org.ID,
			IsActive:       true,
			IsPublic:       false,
			AccessLevel:    models.AccessOrg,
			CreatedAt:      time.Now(),
			UpdatedAt:      time.Now(),
		},
		{
			ID:             2,
			Name:           "Resource Limits Policy",
			Description:    "Enforces CPU and memory limits on all containers",
			Content:        `package kubernetes.resources\n\nimport rego.v1\n\n# Deny pods without resource limits\ndeny contains msg if {\n    input.kind == "Pod"\n    some i in input.spec.containers\n    not i.resources.limits.cpu\n    msg := sprintf("Container '%s' must specify CPU limits", [i.name])\n}\n\ndeny contains msg if {\n    input.kind == "Pod"\n    some i in input.spec.containers\n    not i.resources.limits.memory\n    msg := sprintf("Container '%s' must specify memory limits", [i.name])\n}\n\n# Enforce reasonable resource limits\ndeny contains msg if {\n    input.kind == "Pod"\n    some i in input.spec.containers\n    cpu_limit := i.resources.limits.cpu\n    to_number(cpu_limit) > 2\n    msg := sprintf("Container '%s' CPU limit too high: %s (max: 2)", [i.name, cpu_limit])\n}`,
			Language:       "rego",
			Category:       "resources",
			Status:         models.StatusActive,
			Version:        1,
			AuthorID:       adminUser.ID,
			OrganizationID: org.ID,
			IsActive:       true,
			IsPublic:       true,
			AccessLevel:    models.AccessPublic,
			CreatedAt:      time.Now(),
			UpdatedAt:      time.Now(),
		},
		{
			ID:             3,
			Name:           "Network Security Policy",
			Description:    "Enforces network security requirements for Kubernetes workloads",
			Content:        `package kubernetes.network\n\nimport rego.v1\n\n# Deny pods without network policies\ndeny contains msg if {\n    input.kind == "Pod"\n    not input.metadata.labels["network-policy"]\n    msg := "Pod must have network-policy label"\n}\n\n# Require specific network policies for sensitive workloads\ndeny contains msg if {\n    input.kind == "Pod"\n    input.metadata.labels.tier == "database"\n    not input.metadata.labels["network-policy"] == "restricted"\n    msg := "Database pods must use restricted network policy"\n}\n\n# Deny host network usage\ndeny contains msg if {\n    input.kind == "Pod"\n    input.spec.hostNetwork == true\n    msg := "Pods must not use host network"\n}`,
			Language:       "rego",
			Category:       "network",
			Status:         models.StatusDraft,
			Version:        1,
			AuthorID:       regularUser.ID,
			OrganizationID: org.ID,
			IsActive:       false,
			IsPublic:       false,
			AccessLevel:    models.AccessPrivate,
			CreatedAt:      time.Now(),
			UpdatedAt:      time.Now(),
		},
	}

	for _, policy := range policies {
		if err := d.DB.Create(&policy).Error; err != nil {
			return fmt.Errorf("failed to create policy '%s': %w", policy.Name, err)
		}
	}

	// Create sample compliance frameworks
	frameworks := []models.ComplianceFramework{
		{
			ID:          1,
			Name:        "SOC 2",
			Description: "SOC 2 compliance framework for service organizations",
			Version:     "2017",
			IsActive:    true,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			ID:          2,
			Name:        "NIST Cybersecurity Framework",
			Description: "NIST framework for improving critical infrastructure cybersecurity",
			Version:     "1.1",
			IsActive:    true,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
	}

	for _, framework := range frameworks {
		if err := d.DB.Create(&framework).Error; err != nil {
			return fmt.Errorf("failed to create compliance framework '%s': %w", framework.Name, err)
		}
	}

	log.Println("✅ Database seeded successfully with sample data")
	log.Printf("👤 Admin user created: admin@niyama.dev / password")
	log.Printf("👤 Regular user created: user@niyama.dev / password")
	log.Printf("📋 Created %d sample policies", len(policies))
	log.Printf("📊 Created %d compliance frameworks", len(frameworks))

	return nil
}

// CleanDatabase removes all data from the database
func (d *Database) CleanDatabase() error {
	if d.DB == nil {
		return fmt.Errorf("database connection not available")
	}

	log.Println("🧹 Cleaning database...")

	// Delete in reverse order of dependencies
	tables := []interface{}{
		&models.PolicyEvaluation{},
		&models.PolicyComplianceMapping{},
		&models.ComplianceReport{},
		&models.ComplianceControl{},
		&models.ComplianceFramework{},
		&models.Policy{},
		&models.PolicyTemplate{},
		&models.User{},
		&models.Organization{},
	}

	for _, table := range tables {
		if err := d.DB.Where("1 = 1").Delete(table).Error; err != nil {
			return fmt.Errorf("failed to clean table: %w", err)
		}
	}

	log.Println("✅ Database cleaned successfully")
	return nil
}