package services

import (
	"context"
	"encoding/json"
	"fmt"
	"niyama-backend/internal/config"
	"niyama-backend/internal/database"
	"time"
)

type ScannerService struct {
	db  *database.Database
	cfg *config.Config
}

func NewScannerService(db *database.Database, cfg *config.Config) *ScannerService {
	return &ScannerService{db: db, cfg: cfg}
}

type CloudProvider interface {
	ScanResources(ctx context.Context, filters map[string]interface{}) ([]CloudResource, error)
	GetName() string
	GetRegions() []string
}

type CloudResource struct {
	ID           string                 `json:"id"`
	Type         string                 `json:"type"`
	Name         string                 `json:"name"`
	Region       string                 `json:"region"`
	Provider     string                 `json:"provider"`
	Status       string                 `json:"status"`
	Tags         map[string]string      `json:"tags"`
	Properties   map[string]interface{} `json:"properties"`
	CreatedAt    time.Time              `json:"created_at"`
	LastModified time.Time              `json:"last_modified"`
}

type ScanRequest struct {
	Provider string                 `json:"provider"` // "aws", "azure", "gcp", "kubernetes"
	Regions  []string               `json:"regions,omitempty"`
	Filters  map[string]interface{} `json:"filters,omitempty"`
	Tags     map[string]string      `json:"tags,omitempty"`
}

type ScanResult struct {
	ScanID      string          `json:"scan_id"`
	Provider    string          `json:"provider"`
	Resources   []CloudResource `json:"resources"`
	Summary     ScanSummary     `json:"summary"`
	StartedAt   time.Time       `json:"started_at"`
	CompletedAt time.Time       `json:"completed_at"`
	Duration    int64           `json:"duration_ms"`
}

type ScanSummary struct {
	TotalResources int            `json:"total_resources"`
	ResourceTypes  map[string]int `json:"resource_types"`
	Regions        map[string]int `json:"regions"`
	StatusCounts   map[string]int `json:"status_counts"`
	TagCounts      map[string]int `json:"tag_counts"`
}

func (s *ScannerService) ScanCloudResources(req *ScanRequest, userID, orgID uint) (*ScanResult, error) {
	startTime := time.Now()
	scanID := fmt.Sprintf("scan_%d_%d", time.Now().Unix(), userID)

	// Get the appropriate provider scanner
	provider, err := s.getProvider(req.Provider)
	if err != nil {
		return nil, err
	}

	// Perform the scan
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
	defer cancel()

	resources, err := provider.ScanResources(ctx, req.Filters)
	if err != nil {
		return nil, fmt.Errorf("scan failed: %w", err)
	}

	// Filter by regions if specified
	if len(req.Regions) > 0 {
		resources = s.filterByRegions(resources, req.Regions)
	}

	// Filter by tags if specified
	if len(req.Tags) > 0 {
		resources = s.filterByTags(resources, req.Tags)
	}

	// Build summary
	summary := s.buildSummary(resources)

	// Save scan results
	s.saveScanResults(scanID, req.Provider, resources, userID, orgID)

	completedAt := time.Now()

	return &ScanResult{
		ScanID:      scanID,
		Provider:    req.Provider,
		Resources:   resources,
		Summary:     summary,
		StartedAt:   startTime,
		CompletedAt: completedAt,
		Duration:    completedAt.Sub(startTime).Milliseconds(),
	}, nil
}

func (s *ScannerService) getProvider(providerName string) (CloudProvider, error) {
	switch providerName {
	case "aws":
		return &AWSProvider{}, nil
	case "azure":
		return &AzureProvider{}, nil
	case "gcp":
		return &GCPProvider{}, nil
	case "kubernetes":
		return &KubernetesProvider{}, nil
	default:
		return nil, fmt.Errorf("unsupported provider: %s", providerName)
	}
}

func (s *ScannerService) filterByRegions(resources []CloudResource, regions []string) []CloudResource {
	var filtered []CloudResource
	regionMap := make(map[string]bool)
	for _, region := range regions {
		regionMap[region] = true
	}

	for _, resource := range resources {
		if regionMap[resource.Region] {
			filtered = append(filtered, resource)
		}
	}
	return filtered
}

func (s *ScannerService) filterByTags(resources []CloudResource, tags map[string]string) []CloudResource {
	var filtered []CloudResource

	for _, resource := range resources {
		matches := true
		for key, value := range tags {
			if resource.Tags[key] != value {
				matches = false
				break
			}
		}
		if matches {
			filtered = append(filtered, resource)
		}
	}
	return filtered
}

func (s *ScannerService) buildSummary(resources []CloudResource) ScanSummary {
	summary := ScanSummary{
		TotalResources: len(resources),
		ResourceTypes:  make(map[string]int),
		Regions:        make(map[string]int),
		StatusCounts:   make(map[string]int),
		TagCounts:      make(map[string]int),
	}

	for _, resource := range resources {
		summary.ResourceTypes[resource.Type]++
		summary.Regions[resource.Region]++
		summary.StatusCounts[resource.Status]++

		for tagKey := range resource.Tags {
			summary.TagCounts[tagKey]++
		}
	}

	return summary
}

func (s *ScannerService) saveScanResults(scanID, provider string, resources []CloudResource, userID, orgID uint) {
	if s.db == nil {
		return
	}

	// Save scan metadata
	scanData := map[string]interface{}{
		"scan_id":    scanID,
		"provider":   provider,
		"user_id":    userID,
		"org_id":     orgID,
		"resources":  len(resources),
		"created_at": time.Now(),
	}
	s.db.DB.Table("cloud_scans").Create(scanData)

	// Save individual resources
	for _, resource := range resources {
		resourceData := map[string]interface{}{
			"scan_id":       scanID,
			"resource_id":   resource.ID,
			"type":          resource.Type,
			"name":          resource.Name,
			"region":        resource.Region,
			"provider":      resource.Provider,
			"status":        resource.Status,
			"tags":          scannerToJSON(resource.Tags),
			"properties":    scannerToJSON(resource.Properties),
			"created_at":    resource.CreatedAt,
			"last_modified": resource.LastModified,
		}
		s.db.DB.Table("cloud_resources").Create(resourceData)
	}
}

// AWS Provider Implementation
type AWSProvider struct{}

func (p *AWSProvider) GetName() string {
	return "aws"
}

func (p *AWSProvider) GetRegions() []string {
	return []string{
		"us-east-1", "us-west-2", "eu-west-1", "ap-southeast-1",
		"us-east-2", "us-west-1", "eu-central-1", "ap-northeast-1",
	}
}

func (p *AWSProvider) ScanResources(ctx context.Context, filters map[string]interface{}) ([]CloudResource, error) {
	// Mock implementation for MVP
	// In production, this would use AWS SDK
	return []CloudResource{
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
			LastModified: time.Now().AddDate(0, 0, -1),
		},
		{
			ID:           "sg-12345678",
			Type:         "security-group",
			Name:         "web-sg",
			Region:       "us-east-1",
			Provider:     "aws",
			Status:       "active",
			Tags:         map[string]string{"Environment": "production"},
			Properties:   map[string]interface{}{"VpcId": "vpc-12345", "Rules": 3},
			CreatedAt:    time.Now().AddDate(0, -2, 0),
			LastModified: time.Now().AddDate(0, 0, -5),
		},
	}, nil
}

// Azure Provider Implementation
type AzureProvider struct{}

func (p *AzureProvider) GetName() string {
	return "azure"
}

func (p *AzureProvider) GetRegions() []string {
	return []string{
		"eastus", "westus2", "westeurope", "southeastasia",
		"eastus2", "westus", "northeurope", "eastasia",
	}
}

func (p *AzureProvider) ScanResources(ctx context.Context, filters map[string]interface{}) ([]CloudResource, error) {
	// Mock implementation for MVP
	return []CloudResource{
		{
			ID:           "/subscriptions/123/resourceGroups/rg1/providers/Microsoft.Compute/virtualMachines/vm1",
			Type:         "virtual-machine",
			Name:         "vm1",
			Region:       "eastus",
			Provider:     "azure",
			Status:       "running",
			Tags:         map[string]string{"Environment": "production"},
			Properties:   map[string]interface{}{"Size": "Standard_B2s", "OSType": "Linux"},
			CreatedAt:    time.Now().AddDate(0, -1, 0),
			LastModified: time.Now().AddDate(0, 0, -2),
		},
	}, nil
}

// GCP Provider Implementation
type GCPProvider struct{}

func (p *GCPProvider) GetName() string {
	return "gcp"
}

func (p *GCPProvider) GetRegions() []string {
	return []string{
		"us-central1", "us-east1", "europe-west1", "asia-southeast1",
		"us-west1", "europe-west3", "asia-east1", "australia-southeast1",
	}
}

func (p *GCPProvider) ScanResources(ctx context.Context, filters map[string]interface{}) ([]CloudResource, error) {
	// Mock implementation for MVP
	return []CloudResource{
		{
			ID:           "projects/my-project/zones/us-central1-a/instances/instance-1",
			Type:         "compute-instance",
			Name:         "instance-1",
			Region:       "us-central1",
			Provider:     "gcp",
			Status:       "running",
			Tags:         map[string]string{"environment": "production"},
			Properties:   map[string]interface{}{"MachineType": "n1-standard-1", "Zone": "us-central1-a"},
			CreatedAt:    time.Now().AddDate(0, -1, 0),
			LastModified: time.Now().AddDate(0, 0, -3),
		},
	}, nil
}

// Kubernetes Provider Implementation
type KubernetesProvider struct{}

func (p *KubernetesProvider) GetName() string {
	return "kubernetes"
}

func (p *KubernetesProvider) GetRegions() []string {
	return []string{"default"}
}

func (p *KubernetesProvider) ScanResources(ctx context.Context, filters map[string]interface{}) ([]CloudResource, error) {
	// Mock implementation for MVP
	return []CloudResource{
		{
			ID:           "default/pod-123",
			Type:         "pod",
			Name:         "web-pod",
			Region:       "default",
			Provider:     "kubernetes",
			Status:       "running",
			Tags:         map[string]string{"app": "web", "version": "v1.0"},
			Properties:   map[string]interface{}{"Namespace": "default", "Node": "node-1"},
			CreatedAt:    time.Now().AddDate(0, 0, -1),
			LastModified: time.Now().AddDate(0, 0, -1),
		},
		{
			ID:           "default/deployment-456",
			Type:         "deployment",
			Name:         "web-deployment",
			Region:       "default",
			Provider:     "kubernetes",
			Status:       "active",
			Tags:         map[string]string{"app": "web"},
			Properties:   map[string]interface{}{"Namespace": "default", "Replicas": 3},
			CreatedAt:    time.Now().AddDate(0, 0, -2),
			LastModified: time.Now().AddDate(0, 0, -1),
		},
	}, nil
}

func scannerToJSON(v interface{}) string {
	b, _ := json.Marshal(v)
	return string(b)
}
