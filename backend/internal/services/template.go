package services

import (
	"niyama-backend/internal/config"
	"niyama-backend/internal/database"
)

type Template struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Framework   string `json:"framework"`
	Language    string `json:"language"`
	Content     string `json:"content"`
}

type TemplateService struct {
	db  *database.Database
	cfg *config.Config
}

func NewTemplateService(db *database.Database, cfg *config.Config) *TemplateService {
	return &TemplateService{
		db:  db,
		cfg: cfg,
	}
}

// GetTemplates returns mock templates for development
func (s *TemplateService) GetTemplates() ([]Template, error) {
	// Return mock templates when database is not available
	templates := []Template{
		{
			ID:          "1",
			Name:        "Container Security Policy",
			Description: "Ensures containers run securely by enforcing best practices like non-root users and immutable file systems.",
			Framework:   "SOC 2",
			Language:    "Rego",
			Content: `package policy.container_security

import rego.v1

# Deny containers running as root
deny contains msg if {
    input.kind == "Pod"
    some i in input.spec.containers
    i.securityContext.runAsUser == 0
    msg := "Container '{{i.name}}' must not run as root user"
}

# Deny containers with privileged escalation
deny contains msg if {
    input.kind == "Pod"
    some i in input.spec.containers
    i.securityContext.allowPrivilegeEscalation == true
    msg := "Container '{{i.name}}' must not allow privilege escalation"
}

# Require read-only root filesystem
deny contains msg if {
    input.kind == "Pod"
    some i in input.spec.containers
    not i.securityContext.readOnlyRootFilesystem == true
    msg := "Container '{{i.name}}' must have a read-only root filesystem"
}`,
		},
		{
			ID:          "2",
			Name:        "Network Policy",
			Description: "Requires network policies for all namespaces to control ingress and egress traffic.",
			Framework:   "CIS",
			Language:    "Rego",
			Content: `package policy.network_policy

import rego.v1

# Deny namespaces without a NetworkPolicy
deny contains msg if {
    input.kind == "Namespace"
    not has_network_policy(input.metadata.name)
    msg := "Namespace '{{input.metadata.name}}' must have a NetworkPolicy"
}

has_network_policy(namespace) if {
    some i in data.kubernetes.networkpolicies
    i.metadata.namespace == namespace
}`,
		},
		{
			ID:          "3",
			Name:        "Resource Limits Policy",
			Description: "Enforces resource limits and requests for all containers to prevent resource exhaustion.",
			Framework:   "HIPAA",
			Language:    "Rego",
			Content: `package policy.resource_limits

import rego.v1

# Deny containers without resource limits
deny contains msg if {
    input.kind == "Pod"
    some i in input.spec.containers
    not has_resource_limits(i)
    msg := "Container '{{i.name}}' must have resource limits defined"
}

has_resource_limits(container) if {
    container.resources.limits.cpu
    container.resources.limits.memory
    container.resources.requests.cpu
    container.resources.requests.memory
}`,
		},
	}

	return templates, nil
}

// GetTemplate returns a specific template by ID
func (s *TemplateService) GetTemplate(id string) (*Template, error) {
	templates, err := s.GetTemplates()
	if err != nil {
		return nil, err
	}

	for _, template := range templates {
		if template.ID == id {
			return &template, nil
		}
	}

	return nil, nil // Template not found
}
