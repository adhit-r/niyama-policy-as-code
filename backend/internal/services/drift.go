package services

import (
	"encoding/json"
	"fmt"
	"niyama-backend/internal/config"
	"niyama-backend/internal/database"
	"time"
)

type DriftService struct {
	db  *database.Database
	cfg *config.Config
}

func NewDriftService(db *database.Database, cfg *config.Config) *DriftService {
	return &DriftService{db: db, cfg: cfg}
}

type DriftDetectionRequest struct {
	Provider     string                 `json:"provider"` // "aws", "azure", "gcp", "kubernetes"
	Regions      []string               `json:"regions,omitempty"`
	ResourceType string                 `json:"resource_type,omitempty"`
	Filters      map[string]interface{} `json:"filters,omitempty"`
	BaselineID   string                 `json:"baseline_id,omitempty"` // Reference scan to compare against
}

type DriftResult struct {
	DriftID     string          `json:"drift_id"`
	Provider    string          `json:"provider"`
	BaselineID  string          `json:"baseline_id"`
	CurrentID   string          `json:"current_id"`
	Drifts      []ResourceDrift `json:"drifts"`
	Summary     DriftSummary    `json:"summary"`
	StartedAt   time.Time       `json:"started_at"`
	CompletedAt time.Time       `json:"completed_at"`
	Duration    int64           `json:"duration_ms"`
}

type ResourceDrift struct {
	ResourceID     string                 `json:"resource_id"`
	ResourceType   string                 `json:"resource_type"`
	ResourceName   string                 `json:"resource_name"`
	Region         string                 `json:"region"`
	DriftType      string                 `json:"drift_type"` // "added", "removed", "modified", "configuration"
	Severity       string                 `json:"severity"`   // "critical", "high", "medium", "low"
	Changes        []PropertyChange       `json:"changes"`
	BaselineState  map[string]interface{} `json:"baseline_state"`
	CurrentState   map[string]interface{} `json:"current_state"`
	DetectedAt     time.Time              `json:"detected_at"`
	Impact         string                 `json:"impact"`
	Recommendation string                 `json:"recommendation"`
}

type PropertyChange struct {
	Path      string      `json:"path"`
	Operation string      `json:"operation"` // "added", "removed", "modified"
	OldValue  interface{} `json:"old_value"`
	NewValue  interface{} `json:"new_value"`
}

type DriftSummary struct {
	TotalDrifts    int            `json:"total_drifts"`
	DriftTypes     map[string]int `json:"drift_types"`
	SeverityCounts map[string]int `json:"severity_counts"`
	ResourceTypes  map[string]int `json:"resource_types"`
	Regions        map[string]int `json:"regions"`
	CriticalDrifts int            `json:"critical_drifts"`
	HighDrifts     int            `json:"high_drifts"`
}

func (s *DriftService) DetectDrift(req *DriftDetectionRequest, userID, orgID uint) (*DriftResult, error) {
	startTime := time.Now()
	driftID := fmt.Sprintf("drift_%d_%d", time.Now().Unix(), userID)

	// Get baseline scan (most recent scan for this provider)
	baseline, err := s.getBaselineScan(req.Provider, req.Regions, userID, orgID)
	if err != nil {
		return nil, fmt.Errorf("failed to get baseline: %w", err)
	}

	// Get current state
	current, err := s.getCurrentState(req, userID, orgID)
	if err != nil {
		return nil, fmt.Errorf("failed to get current state: %w", err)
	}

	// Compare baseline vs current
	drifts := s.compareStates(baseline, current)

	// Build summary
	summary := s.buildDriftSummary(drifts)

	// Save drift results
	s.saveDriftResults(driftID, req.Provider, baseline.ID, current.ID, drifts, userID, orgID)

	completedAt := time.Now()

	return &DriftResult{
		DriftID:     driftID,
		Provider:    req.Provider,
		BaselineID:  baseline.ID,
		CurrentID:   current.ID,
		Drifts:      drifts,
		Summary:     summary,
		StartedAt:   startTime,
		CompletedAt: completedAt,
		Duration:    completedAt.Sub(startTime).Milliseconds(),
	}, nil
}

type ScanState struct {
	ID        string
	Resources []CloudResource
	Timestamp time.Time
}

func (s *DriftService) getBaselineScan(provider string, regions []string, userID, orgID uint) (*ScanState, error) {
	if s.db == nil {
		// Return mock baseline for MVP
		return &ScanState{
			ID: "baseline_123",
			Resources: []CloudResource{
				{
					ID:           "i-1234567890abcdef0",
					Type:         "ec2-instance",
					Name:         "web-server-1",
					Region:       "us-east-1",
					Provider:     "aws",
					Status:       "running",
					Tags:         map[string]string{"Environment": "production", "Team": "backend"},
					Properties:   map[string]interface{}{"InstanceType": "t3.medium", "VpcId": "vpc-12345"},
					CreatedAt:    time.Now().AddDate(0, -1, 0),
					LastModified: time.Now().AddDate(0, 0, -7),
				},
			},
			Timestamp: time.Now().AddDate(0, 0, -7),
		}, nil
	}

	// Query database for most recent scan
	var scanData map[string]interface{}
	s.db.DB.Table("cloud_scans").
		Where("provider = ? AND user_id = ? AND org_id = ?", provider, userID, orgID).
		Order("created_at DESC").
		First(&scanData)

	// Get resources for this scan
	var resources []CloudResource
	s.db.DB.Table("cloud_resources").
		Where("scan_id = ?", scanData["scan_id"]).
		Find(&resources)

	return &ScanState{
		ID:        scanData["scan_id"].(string),
		Resources: resources,
		Timestamp: scanData["created_at"].(time.Time),
	}, nil
}

func (s *DriftService) getCurrentState(req *DriftDetectionRequest, userID, orgID uint) (*ScanState, error) {
	// Use the scanner service to get current state
	scanner := NewScannerService(s.db, s.cfg)

	scanReq := &ScanRequest{
		Provider: req.Provider,
		Regions:  req.Regions,
		Filters:  req.Filters,
	}

	result, err := scanner.ScanCloudResources(scanReq, userID, orgID)
	if err != nil {
		return nil, err
	}

	return &ScanState{
		ID:        result.ScanID,
		Resources: result.Resources,
		Timestamp: result.CompletedAt,
	}, nil
}

func (s *DriftService) compareStates(baseline, current *ScanState) []ResourceDrift {
	var drifts []ResourceDrift

	// Create maps for easier lookup
	baselineMap := make(map[string]CloudResource)
	for _, resource := range baseline.Resources {
		baselineMap[resource.ID] = resource
	}

	currentMap := make(map[string]CloudResource)
	for _, resource := range current.Resources {
		currentMap[resource.ID] = resource
	}

	// Check for removed resources
	for id, baselineResource := range baselineMap {
		if _, exists := currentMap[id]; !exists {
			drifts = append(drifts, ResourceDrift{
				ResourceID:     id,
				ResourceType:   baselineResource.Type,
				ResourceName:   baselineResource.Name,
				Region:         baselineResource.Region,
				DriftType:      "removed",
				Severity:       s.determineSeverity("removed", baselineResource),
				BaselineState:  s.resourceToMap(baselineResource),
				CurrentState:   nil,
				DetectedAt:     time.Now(),
				Impact:         "Resource has been deleted or is no longer accessible",
				Recommendation: "Verify if this deletion was intentional. Check backup and recovery procedures.",
			})
		}
	}

	// Check for added resources
	for id, currentResource := range currentMap {
		if _, exists := baselineMap[id]; !exists {
			drifts = append(drifts, ResourceDrift{
				ResourceID:     id,
				ResourceType:   currentResource.Type,
				ResourceName:   currentResource.Name,
				Region:         currentResource.Region,
				DriftType:      "added",
				Severity:       s.determineSeverity("added", currentResource),
				BaselineState:  nil,
				CurrentState:   s.resourceToMap(currentResource),
				DetectedAt:     time.Now(),
				Impact:         "New resource detected",
				Recommendation: "Verify this resource was created through approved channels and follows security policies.",
			})
		}
	}

	// Check for modified resources
	for id, currentResource := range currentMap {
		if baselineResource, exists := baselineMap[id]; exists {
			changes := s.detectChanges(baselineResource, currentResource)
			if len(changes) > 0 {
				drifts = append(drifts, ResourceDrift{
					ResourceID:     id,
					ResourceType:   currentResource.Type,
					ResourceName:   currentResource.Name,
					Region:         currentResource.Region,
					DriftType:      "modified",
					Severity:       s.determineSeverity("modified", currentResource),
					Changes:        changes,
					BaselineState:  s.resourceToMap(baselineResource),
					CurrentState:   s.resourceToMap(currentResource),
					DetectedAt:     time.Now(),
					Impact:         s.assessImpact(changes),
					Recommendation: s.generateRecommendation(changes),
				})
			}
		}
	}

	return drifts
}

func (s *DriftService) detectChanges(baseline, current CloudResource) []PropertyChange {
	var changes []PropertyChange

	// Compare status
	if baseline.Status != current.Status {
		changes = append(changes, PropertyChange{
			Path:      "status",
			Operation: "modified",
			OldValue:  baseline.Status,
			NewValue:  current.Status,
		})
	}

	// Compare tags
	baselineTags := make(map[string]interface{})
	for k, v := range baseline.Tags {
		baselineTags[k] = v
	}
	currentTags := make(map[string]interface{})
	for k, v := range current.Tags {
		currentTags[k] = v
	}
	changes = append(changes, s.compareMaps(baselineTags, currentTags, "tags")...)

	// Compare properties
	changes = append(changes, s.compareMaps(baseline.Properties, current.Properties, "properties")...)

	return changes
}

func (s *DriftService) compareMaps(baseline, current map[string]interface{}, pathPrefix string) []PropertyChange {
	var changes []PropertyChange

	// Check for removed keys
	for key, value := range baseline {
		if _, exists := current[key]; !exists {
			changes = append(changes, PropertyChange{
				Path:      fmt.Sprintf("%s.%s", pathPrefix, key),
				Operation: "removed",
				OldValue:  value,
				NewValue:  nil,
			})
		}
	}

	// Check for added keys
	for key, value := range current {
		if _, exists := baseline[key]; !exists {
			changes = append(changes, PropertyChange{
				Path:      fmt.Sprintf("%s.%s", pathPrefix, key),
				Operation: "added",
				OldValue:  nil,
				NewValue:  value,
			})
		}
	}

	// Check for modified values
	for key, currentValue := range current {
		if baselineValue, exists := baseline[key]; exists {
			if !s.valuesEqual(baselineValue, currentValue) {
				changes = append(changes, PropertyChange{
					Path:      fmt.Sprintf("%s.%s", pathPrefix, key),
					Operation: "modified",
					OldValue:  baselineValue,
					NewValue:  currentValue,
				})
			}
		}
	}

	return changes
}

func (s *DriftService) valuesEqual(a, b interface{}) bool {
	// Simple equality check - in production, use a proper deep equality library
	return fmt.Sprintf("%v", a) == fmt.Sprintf("%v", b)
}

func (s *DriftService) determineSeverity(driftType string, resource CloudResource) string {
	switch driftType {
	case "removed":
		// Critical if it's a security-related resource
		if resource.Type == "security-group" || resource.Type == "iam-role" {
			return "critical"
		}
		return "high"
	case "added":
		// Medium for most additions
		return "medium"
	case "modified":
		// High if security-related changes
		if resource.Type == "security-group" || resource.Type == "iam-role" {
			return "high"
		}
		return "medium"
	default:
		return "low"
	}
}

func (s *DriftService) assessImpact(changes []PropertyChange) string {
	criticalChanges := 0
	securityChanges := 0

	for _, change := range changes {
		if s.isCriticalProperty(change.Path) {
			criticalChanges++
		}
		if s.isSecurityProperty(change.Path) {
			securityChanges++
		}
	}

	if securityChanges > 0 {
		return "Security-related changes detected. Review immediately."
	}
	if criticalChanges > 0 {
		return "Critical infrastructure changes detected. Verify changes are authorized."
	}
	return "Configuration changes detected. Review for compliance."
}

func (s *DriftService) generateRecommendation(changes []PropertyChange) string {
	securityChanges := 0
	configChanges := 0

	for _, change := range changes {
		if s.isSecurityProperty(change.Path) {
			securityChanges++
		} else {
			configChanges++
		}
	}

	if securityChanges > 0 {
		return "Review security changes with security team. Update access policies if needed."
	}
	if configChanges > 0 {
		return "Document configuration changes. Update runbooks and monitoring if needed."
	}
	return "Review changes for compliance with organizational policies."
}

func (s *DriftService) isCriticalProperty(path string) bool {
	criticalPaths := []string{"status", "instance_type", "vpc_id", "subnet_id"}
	for _, critical := range criticalPaths {
		if path == critical || path == "properties."+critical {
			return true
		}
	}
	return false
}

func (s *DriftService) isSecurityProperty(path string) bool {
	securityPaths := []string{"security_groups", "iam_role", "access_key", "permissions"}
	for _, security := range securityPaths {
		if path == security || path == "properties."+security || path == "tags.security" {
			return true
		}
	}
	return false
}

func (s *DriftService) resourceToMap(resource CloudResource) map[string]interface{} {
	return map[string]interface{}{
		"id":            resource.ID,
		"type":          resource.Type,
		"name":          resource.Name,
		"region":        resource.Region,
		"provider":      resource.Provider,
		"status":        resource.Status,
		"tags":          resource.Tags,
		"properties":    resource.Properties,
		"created_at":    resource.CreatedAt,
		"last_modified": resource.LastModified,
	}
}

func (s *DriftService) buildDriftSummary(drifts []ResourceDrift) DriftSummary {
	summary := DriftSummary{
		TotalDrifts:    len(drifts),
		DriftTypes:     make(map[string]int),
		SeverityCounts: make(map[string]int),
		ResourceTypes:  make(map[string]int),
		Regions:        make(map[string]int),
	}

	for _, drift := range drifts {
		summary.DriftTypes[drift.DriftType]++
		summary.SeverityCounts[drift.Severity]++
		summary.ResourceTypes[drift.ResourceType]++
		summary.Regions[drift.Region]++

		if drift.Severity == "critical" {
			summary.CriticalDrifts++
		}
		if drift.Severity == "high" {
			summary.HighDrifts++
		}
	}

	return summary
}

func (s *DriftService) saveDriftResults(driftID, provider, baselineID, currentID string, drifts []ResourceDrift, userID, orgID uint) {
	if s.db == nil {
		return
	}

	// Save drift metadata
	driftData := map[string]interface{}{
		"drift_id":     driftID,
		"provider":     provider,
		"baseline_id":  baselineID,
		"current_id":   currentID,
		"user_id":      userID,
		"org_id":       orgID,
		"total_drifts": len(drifts),
		"created_at":   time.Now(),
	}
	s.db.DB.Table("drift_detections").Create(driftData)

	// Save individual drifts
	for _, drift := range drifts {
		driftResourceData := map[string]interface{}{
			"drift_id":       driftID,
			"resource_id":    drift.ResourceID,
			"resource_type":  drift.ResourceType,
			"resource_name":  drift.ResourceName,
			"region":         drift.Region,
			"drift_type":     drift.DriftType,
			"severity":       drift.Severity,
			"changes":        driftToJSON(drift.Changes),
			"baseline_state": driftToJSON(drift.BaselineState),
			"current_state":  driftToJSON(drift.CurrentState),
			"impact":         drift.Impact,
			"recommendation": drift.Recommendation,
			"detected_at":    drift.DetectedAt,
		}
		s.db.DB.Table("drift_resources").Create(driftResourceData)
	}
}

func driftToJSON(v interface{}) string {
	b, _ := json.Marshal(v)
	return string(b)
}
