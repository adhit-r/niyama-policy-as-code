package services

import (
	"encoding/json"
	"fmt"
	"niyama-backend/internal/config"
	"niyama-backend/internal/database"
	"niyama-backend/internal/models"
	"niyama-backend/pkg/opa"
	"strings"
	"time"
)

type PolicyService struct {
	db        *database.Database
	cfg       *config.Config
	opaClient *opa.Client
}

func NewPolicyService(db *database.Database, cfg *config.Config) *PolicyService {
	return &PolicyService{
		db:        db,
		cfg:       cfg,
		opaClient: opa.NewClient(cfg.OPA.URL),
	}
}

// CreatePolicy creates a new policy with organization and RBAC support
func (s *PolicyService) CreatePolicy(policy *models.Policy, userID, orgID uint) error {
	if s.db == nil {
		return fmt.Errorf("database not available")
	}

	// Set organization and author
	policy.OrganizationID = orgID
	policy.AuthorID = userID
	policy.CreatedAt = time.Now()
	policy.UpdatedAt = time.Now()

	// Validate access level
	if !policy.AccessLevel.IsValid() {
		policy.AccessLevel = models.AccessPrivate
	}

	// Validate status
	if !policy.Status.IsValid() {
		policy.Status = models.StatusDraft
	}

	return s.db.DB.Create(policy).Error
}

// GetPolicies retrieves policies based on user permissions and organization
func (s *PolicyService) GetPolicies(userID, orgID uint, userRole models.Role) ([]models.Policy, error) {
	if s.db == nil {
		// Return mock data for development
		return s.getMockPolicies(), nil
	}

	var policies []models.Policy
	query := s.db.DB.Preload("Author").Preload("Organization")

	// Apply RBAC filters
	switch userRole {
	case models.RoleOwner, models.RoleAdmin:
		// Can see all policies in organization
		query = query.Where("organization_id = ?", orgID)
	case models.RoleEditor, models.RoleViewer:
		// Can see org and public policies
		query = query.Where("organization_id = ? OR access_level = ?", orgID, models.AccessPublic)
	case models.RoleMember:
		// Can only see public policies
		query = query.Where("access_level = ?", models.AccessPublic)
	default:
		// Default: only public policies
		query = query.Where("access_level = ?", models.AccessPublic)
	}

	err := query.Find(&policies).Error
	return policies, err
}

// GetPolicy retrieves a specific policy with permission check
func (s *PolicyService) GetPolicy(policyID, userID, orgID uint, userRole models.Role) (*models.Policy, error) {
	if s.db == nil {
		// Return mock data for development
		return s.getMockPolicy(policyID), nil
	}

	var policy models.Policy
	err := s.db.DB.Preload("Author").Preload("Organization").First(&policy, policyID).Error
	if err != nil {
		return nil, err
	}

	// Check permissions
	if !s.canAccessPolicy(&policy, userID, orgID, userRole) {
		return nil, fmt.Errorf("access denied")
	}

	return &policy, nil
}

// UpdatePolicy updates a policy with permission check
func (s *PolicyService) UpdatePolicy(policyID uint, updates *models.Policy, userID, orgID uint, userRole models.Role) error {
	if s.db == nil {
		return fmt.Errorf("database not available")
	}

	// Get existing policy
	policy, err := s.GetPolicy(policyID, userID, orgID, userRole)
	if err != nil {
		return err
	}

	// Check if user can edit
	if !s.canEditPolicy(policy, userID, userRole) {
		return fmt.Errorf("insufficient permissions to edit policy")
	}

	// Update fields
	updates.UpdatedAt = time.Now()
	return s.db.DB.Model(policy).Updates(updates).Error
}

// DeletePolicy deletes a policy with permission check
func (s *PolicyService) DeletePolicy(policyID, userID, orgID uint, userRole models.Role) error {
	if s.db == nil {
		return fmt.Errorf("database not available")
	}

	// Get existing policy
	policy, err := s.GetPolicy(policyID, userID, orgID, userRole)
	if err != nil {
		return err
	}

	// Check if user can delete
	if !s.canDeletePolicy(policy, userID, userRole) {
		return fmt.Errorf("insufficient permissions to delete policy")
	}

	return s.db.DB.Delete(policy).Error
}

// TestPolicy evaluates a policy against test input
func (s *PolicyService) TestPolicy(policyID uint, testInput map[string]interface{}, userID, orgID uint, userRole models.Role) (*models.PolicyEvaluation, error) {
	// Get the policy
	policy, err := s.GetPolicy(policyID, userID, orgID, userRole)
	if err != nil {
		return nil, err
	}

	// Extract package name from policy content (parse "package xyz")
	packageName := extractPackageName(policy.Content)

	// Call OPA
	startTime := time.Now()
	result, err := s.opaClient.EvaluatePolicy(policy.Content, packageName, testInput)
	duration := time.Since(startTime).Milliseconds()

	if err != nil {
		return nil, fmt.Errorf("OPA evaluation failed: %w", err)
	}

	// Determine decision (allow/deny based on result)
	decision := "deny"
	if isAllowed(result.Result) {
		decision = "allow"
	}

	// Save evaluation to database
	evaluation := &models.PolicyEvaluation{
		PolicyID:  policyID,
		Input:     toJSON(testInput),
		Output:    toJSON(result.Result),
		Decision:  decision,
		Duration:  duration,
		UserID:    userID,
		CreatedAt: time.Now(),
	}

	if s.db != nil {
		s.db.DB.Create(evaluation)
	}

	return evaluation, nil
}

// Helper methods for RBAC
func (s *PolicyService) canAccessPolicy(policy *models.Policy, userID, orgID uint, userRole models.Role) bool {
	// Owner and Admin can access all org policies
	if userRole == models.RoleOwner || userRole == models.RoleAdmin {
		return policy.OrganizationID == orgID
	}

	// Check access level
	switch policy.AccessLevel {
	case models.AccessPublic:
		return true
	case models.AccessOrg:
		return policy.OrganizationID == orgID
	case models.AccessPrivate:
		return policy.AuthorID == userID
	default:
		return false
	}
}

func (s *PolicyService) canEditPolicy(policy *models.Policy, userID uint, userRole models.Role) bool {
	// Owner and Admin can edit all org policies
	if userRole == models.RoleOwner || userRole == models.RoleAdmin {
		return true
	}

	// Editor can edit org policies
	if userRole == models.RoleEditor {
		return true
	}

	// Author can edit their own private policies
	return policy.AuthorID == userID && policy.AccessLevel == models.AccessPrivate
}

func (s *PolicyService) canDeletePolicy(policy *models.Policy, userID uint, userRole models.Role) bool {
	// Only Owner and Admin can delete policies
	return userRole == models.RoleOwner || userRole == models.RoleAdmin
}

func (s *PolicyService) canTestPolicy(policy *models.Policy, userID uint, userRole models.Role) bool {
	// Anyone with access can test
	return s.canAccessPolicy(policy, userID, policy.OrganizationID, userRole)
}

// Mock data for development
func (s *PolicyService) getMockPolicies() []models.Policy {
	return []models.Policy{
		{
			ID:             1,
			Name:           "Kubernetes Security Policy",
			Description:    "Ensures all pods have security contexts",
			Content:        `package kubernetes.security\n\ndefault allow = false\n\nallow {\n    input.kind == "Pod"\n    input.spec.securityContext.runAsNonRoot == true\n}`,
			Language:       "rego",
			Category:       "security",
			Tags:           []string{"kubernetes", "security", "pods"},
			Status:         models.StatusActive,
			AuthorID:       1,
			OrganizationID: 1,
			AccessLevel:    models.AccessOrg,
			CreatedAt:      time.Now(),
			UpdatedAt:      time.Now(),
		},
		{
			ID:             2,
			Name:           "Resource Limits Policy",
			Description:    "Enforces resource limits on containers",
			Content:        `package kubernetes.resources\n\ndefault allow = false\n\nallow {\n    input.kind == "Pod"\n    input.spec.containers[_].resources.limits.cpu\n    input.spec.containers[_].resources.limits.memory\n}`,
			Language:       "rego",
			Category:       "resources",
			Tags:           []string{"kubernetes", "resources", "limits"},
			Status:         models.StatusActive,
			AuthorID:       1,
			OrganizationID: 1,
			AccessLevel:    models.AccessPublic,
			CreatedAt:      time.Now(),
			UpdatedAt:      time.Now(),
		},
	}
}

func (s *PolicyService) getMockPolicy(id uint) *models.Policy {
	policies := s.getMockPolicies()
	for _, policy := range policies {
		if policy.ID == id {
			return &policy
		}
	}
	return nil
}

func (s *PolicyService) getMockEvaluation(policyID uint, testInput map[string]interface{}) *models.PolicyEvaluation {
	return &models.PolicyEvaluation{
		ID:        1,
		PolicyID:  policyID,
		Input:     fmt.Sprintf("%v", testInput),
		Output:    `{"decision": "allow", "reason": "Policy evaluation successful", "details": {"resource": "pod", "namespace": "default"}}`,
		Decision:  "allow",
		Duration:  150,
		UserID:    1,
		CreatedAt: time.Now(),
	}
}

func extractPackageName(content string) string {
	// Simple regex to extract "package foo.bar" -> "foo/bar"
	lines := strings.Split(content, "\n")
	for _, line := range lines {
		if strings.HasPrefix(strings.TrimSpace(line), "package ") {
			pkg := strings.TrimPrefix(strings.TrimSpace(line), "package ")
			return strings.ReplaceAll(pkg, ".", "/")
		}
	}
	return "main"
}

func isAllowed(result interface{}) bool {
	// OPA result can be boolean or object with "allow" field
	switch v := result.(type) {
	case bool:
		return v
	case map[string]interface{}:
		if allow, ok := v["allow"].(bool); ok {
			return allow
		}
		// Check for deny array (if empty, allow)
		if deny, ok := v["deny"].([]interface{}); ok {
			return len(deny) == 0
		}
	}
	return false
}

func toJSON(v interface{}) string {
	b, _ := json.Marshal(v)
	return string(b)
}

// GetEvaluationHistory retrieves recent policy evaluations for a user
func (s *PolicyService) GetEvaluationHistory(userID, orgID uint, limit int) ([]models.PolicyEvaluation, error) {
	if s.db == nil {
		// Return mock data for development
		return []models.PolicyEvaluation{
			{
				ID:        1,
				PolicyID:  1,
				Input:     `{"user": "admin", "resource": "database"}`,
				Output:    `{"allow": true}`,
				Decision:  "allow",
				Duration:  45,
				UserID:    userID,
				CreatedAt: time.Now().Add(-1 * time.Hour),
			},
			{
				ID:        2,
				PolicyID:  2,
				Input:     `{"user": "developer", "resource": "api"}`,
				Output:    `{"allow": false, "reason": "insufficient permissions"}`,
				Decision:  "deny",
				Duration:  32,
				UserID:    userID,
				CreatedAt: time.Now().Add(-2 * time.Hour),
			},
		}, nil
	}

	var evaluations []models.PolicyEvaluation
	err := s.db.DB.Where("user_id = ?", userID).
		Order("created_at DESC").
		Limit(limit).
		Find(&evaluations).Error

	return evaluations, err
}
