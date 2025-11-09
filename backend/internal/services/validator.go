package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"niyama-backend/internal/config"
	"niyama-backend/internal/database"
	"niyama-backend/internal/models"
	"niyama-backend/pkg/opa"
	"strings"
	"time"

	"gopkg.in/yaml.v3"
)

type ValidatorService struct {
	db            *database.Database
	cfg           *config.Config
	opaClient     *opa.Client
	policyService *PolicyService
}

func NewValidatorService(db *database.Database, cfg *config.Config, policySvc *PolicyService) *ValidatorService {
	return &ValidatorService{
		db:            db,
		cfg:           cfg,
		opaClient:     opa.NewClient(cfg.OPA.URL),
		policyService: policySvc,
	}
}

type ValidationRequest struct {
	Files     []IaCFile `json:"files"`      // IaC files to validate
	PolicyIDs []uint    `json:"policy_ids"` // Policies to check against (optional)
	RepoURL   string    `json:"repo_url"`
	CommitSHA string    `json:"commit_sha"`
}

type IaCFile struct {
	Path    string `json:"path"`
	Content string `json:"content"`
	Type    string `json:"type"` // "kubernetes", "terraform", "cloudformation"
}

type ValidationResult struct {
	Status     string            `json:"status"` // "pass", "fail", "warning"
	Violations []PolicyViolation `json:"violations"`
	Summary    ValidationSummary `json:"summary"`
	ScanID     string            `json:"scan_id"`
}

type PolicyViolation struct {
	PolicyID     uint   `json:"policy_id"`
	PolicyName   string `json:"policy_name"`
	File         string `json:"file"`
	ResourceName string `json:"resource_name"`
	Severity     string `json:"severity"` // "critical", "high", "medium", "low"
	Message      string `json:"message"`
	Remediation  string `json:"remediation"`
	Line         int    `json:"line,omitempty"`
}

type ValidationSummary struct {
	TotalFiles      int `json:"total_files"`
	TotalViolations int `json:"total_violations"`
	Critical        int `json:"critical"`
	High            int `json:"high"`
	Medium          int `json:"medium"`
	Low             int `json:"low"`
}

func (s *ValidatorService) ValidateIaC(req *ValidationRequest, userID, orgID uint) (*ValidationResult, error) {
	var allViolations []PolicyViolation

	// Get policies to validate against
	policies, err := s.getPoliciesForValidation(req.PolicyIDs, userID, orgID)
	if err != nil {
		return nil, err
	}

	// Validate each file against each policy
	for _, file := range req.Files {
		// Parse file based on type
		resources, err := s.parseIaCFile(file)
		if err != nil {
			continue // Skip unparseable files
		}

		// Evaluate each resource against policies
		for _, resource := range resources {
			for _, policy := range policies {
				violations := s.evaluateResource(resource, policy, file.Path)
				allViolations = append(allViolations, violations...)
			}
		}
	}

	// Build summary
	summary := s.buildSummary(req.Files, allViolations)

	// Determine overall status
	status := "pass"
	if summary.Critical > 0 || summary.High > 0 {
		status = "fail"
	} else if summary.Medium > 0 || summary.Low > 0 {
		status = "warning"
	}

	// Save scan results
	scanID := s.saveScanResults(req, allViolations, status)

	return &ValidationResult{
		Status:     status,
		Violations: allViolations,
		Summary:    summary,
		ScanID:     scanID,
	}, nil
}

func (s *ValidatorService) parseIaCFile(file IaCFile) ([]map[string]interface{}, error) {
	switch file.Type {
	case "kubernetes":
		// Parse K8s YAML (can have multiple resources)
		var k8sResources []map[string]interface{}
		decoder := yaml.NewDecoder(bytes.NewBufferString(file.Content))
		for {
			var resource map[string]interface{}
			if err := decoder.Decode(&resource); err != nil {
				break
			}
			k8sResources = append(k8sResources, resource)
		}
		return k8sResources, nil

	case "terraform":
		// For MVP, parse as JSON/HCL (simplified)
		var tfResource map[string]interface{}
		json.Unmarshal([]byte(file.Content), &tfResource)
		return []map[string]interface{}{tfResource}, nil

	default:
		return nil, fmt.Errorf("unsupported file type: %s", file.Type)
	}
}

func (s *ValidatorService) evaluateResource(resource map[string]interface{}, policy models.Policy, filePath string) []PolicyViolation {
	packageName := extractPackageName(policy.Content)

	result, err := s.opaClient.EvaluatePolicy(policy.Content, packageName, resource)
	if err != nil {
		return nil
	}

	// Check for deny messages in result
	var violations []PolicyViolation
	if resultMap, ok := result.Result.(map[string]interface{}); ok {
		if denyList, ok := resultMap["deny"].([]interface{}); ok {
			for _, msg := range denyList {
				violations = append(violations, PolicyViolation{
					PolicyID:     policy.ID,
					PolicyName:   policy.Name,
					File:         filePath,
					ResourceName: getResourceName(resource),
					Severity:     determineSeverity(policy),
					Message:      fmt.Sprintf("%v", msg),
					Remediation:  generateRemediation(policy, msg),
				})
			}
		}
	}

	return violations
}

func (s *ValidatorService) getPoliciesForValidation(policyIDs []uint, userID, orgID uint) ([]models.Policy, error) {
	if len(policyIDs) > 0 {
		// Get specific policies
		var policies []models.Policy
		for _, id := range policyIDs {
			policy, err := s.policyService.GetPolicy(id, userID, orgID, models.RoleAdmin)
			if err == nil {
				policies = append(policies, *policy)
			}
		}
		return policies, nil
	}

	// Get all active policies for organization
	return s.policyService.GetPolicies(userID, orgID, models.RoleAdmin)
}

func (s *ValidatorService) saveScanResults(req *ValidationRequest, violations []PolicyViolation, status string) string {
	scanID := fmt.Sprintf("scan_%d", time.Now().Unix())

	// Save to database (create CIScan model if needed)
	if s.db != nil {
		scanData := map[string]interface{}{
			"scan_id":    scanID,
			"repo_url":   req.RepoURL,
			"commit_sha": req.CommitSHA,
			"status":     status,
			"violations": len(violations),
			"created_at": time.Now(),
		}
		// Store in ci_scans table (create migration for this)
		s.db.DB.Table("ci_scans").Create(scanData)
	}

	return scanID
}

func getResourceName(resource map[string]interface{}) string {
	if metadata, ok := resource["metadata"].(map[string]interface{}); ok {
		if name, ok := metadata["name"].(string); ok {
			return name
		}
	}
	return "unknown"
}

func determineSeverity(policy models.Policy) string {
	// Check policy tags/metadata for severity
	for _, tag := range policy.Tags {
		if strings.Contains(strings.ToLower(tag), "critical") {
			return "critical"
		}
	}
	if policy.Category == "security" {
		return "high"
	}
	return "medium"
}

func generateRemediation(policy models.Policy, violation interface{}) string {
	// Simple remediation suggestions
	msgStr := fmt.Sprintf("%v", violation)

	if strings.Contains(msgStr, "root") {
		return "Set securityContext.runAsNonRoot: true and specify a non-root user ID"
	}
	if strings.Contains(msgStr, "privileged") {
		return "Remove securityContext.privileged or set it to false"
	}
	if strings.Contains(msgStr, "resource limits") {
		return "Add resources.limits.cpu and resources.limits.memory to container spec"
	}

	return "Review policy documentation for remediation steps"
}

func (s *ValidatorService) buildSummary(files []IaCFile, violations []PolicyViolation) ValidationSummary {
	summary := ValidationSummary{
		TotalFiles:      len(files),
		TotalViolations: len(violations),
	}

	for _, v := range violations {
		switch v.Severity {
		case "critical":
			summary.Critical++
		case "high":
			summary.High++
		case "medium":
			summary.Medium++
		case "low":
			summary.Low++
		}
	}

	return summary
}
