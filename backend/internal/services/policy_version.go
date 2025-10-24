package services

import (
	"fmt"
	"strings"

	"niyama-backend/internal/models"

	"gorm.io/gorm"
)

type PolicyVersionService struct {
	db *gorm.DB
}

func NewPolicyVersionService(db *gorm.DB) *PolicyVersionService {
	return &PolicyVersionService{db: db}
}

// CreateVersion creates a new version of a policy
func (s *PolicyVersionService) CreateVersion(policyID uint, content, description string, authorID uint) (*models.PolicyVersion, error) {
	// Get the current version number
	var maxVersion int
	err := s.db.Model(&models.PolicyVersion{}).
		Where("policy_id = ?", policyID).
		Select("COALESCE(MAX(version), 0)").
		Scan(&maxVersion).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get max version: %w", err)
	}

	// Deactivate all previous versions
	err = s.db.Model(&models.PolicyVersion{}).
		Where("policy_id = ?", policyID).
		Update("is_active", false).Error
	if err != nil {
		return nil, fmt.Errorf("failed to deactivate previous versions: %w", err)
	}

	// Create new version
	version := &models.PolicyVersion{
		PolicyID:    policyID,
		Version:     maxVersion + 1,
		Content:     content,
		Description: description,
		AuthorID:    authorID,
		IsActive:    true,
	}

	err = s.db.Create(version).Error
	if err != nil {
		return nil, fmt.Errorf("failed to create version: %w", err)
	}

	return version, nil
}

// GetVersions returns all versions of a policy
func (s *PolicyVersionService) GetVersions(policyID uint) ([]models.PolicyVersion, error) {
	var versions []models.PolicyVersion
	err := s.db.Where("policy_id = ?", policyID).
		Order("version DESC").
		Find(&versions).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get versions: %w", err)
	}

	return versions, nil
}

// GetVersion returns a specific version of a policy
func (s *PolicyVersionService) GetVersion(policyID uint, version int) (*models.PolicyVersion, error) {
	var policyVersion models.PolicyVersion
	err := s.db.Where("policy_id = ? AND version = ?", policyID, version).
		First(&policyVersion).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get version: %w", err)
	}

	return &policyVersion, nil
}

// RollbackToVersion rolls back a policy to a specific version
func (s *PolicyVersionService) RollbackToVersion(policyID uint, version int, authorID uint) (*models.PolicyVersion, error) {
	// Get the target version
	targetVersion, err := s.GetVersion(policyID, version)
	if err != nil {
		return nil, fmt.Errorf("failed to get target version: %w", err)
	}

	// Create a new version with the target content
	newVersion, err := s.CreateVersion(policyID, targetVersion.Content, fmt.Sprintf("Rollback to version %d", version), authorID)
	if err != nil {
		return nil, fmt.Errorf("failed to create rollback version: %w", err)
	}

	return newVersion, nil
}

// CompareVersions compares two versions of a policy
func (s *PolicyVersionService) CompareVersions(policyID uint, version1, version2 int) (*models.PolicyVersionDiff, error) {
	v1, err := s.GetVersion(policyID, version1)
	if err != nil {
		return nil, fmt.Errorf("failed to get version 1: %w", err)
	}

	v2, err := s.GetVersion(policyID, version2)
	if err != nil {
		return nil, fmt.Errorf("failed to get version 2: %w", err)
	}

	diff := s.calculateDiff(v1.Content, v2.Content)

	return &models.PolicyVersionDiff{
		Version1:      *v1,
		Version2:      *v2,
		AddedLines:    diff.Added,
		RemovedLines:  diff.Removed,
		ModifiedLines: diff.Modified,
		Summary:       diff.Summary,
	}, nil
}

// calculateDiff calculates the differences between two strings
func (s *PolicyVersionService) calculateDiff(content1, content2 string) *DiffResult {
	lines1 := strings.Split(content1, "\n")
	lines2 := strings.Split(content2, "\n")

	var added, removed, modified []string
	var summary string

	// Simple line-by-line comparison
	maxLen := len(lines1)
	if len(lines2) > maxLen {
		maxLen = len(lines2)
	}

	for i := 0; i < maxLen; i++ {
		line1 := ""
		line2 := ""

		if i < len(lines1) {
			line1 = lines1[i]
		}
		if i < len(lines2) {
			line2 = lines2[i]
		}

		if line1 != line2 {
			if line1 == "" {
				added = append(added, fmt.Sprintf("+ %s", line2))
			} else if line2 == "" {
				removed = append(removed, fmt.Sprintf("- %s", line1))
			} else {
				modified = append(modified, fmt.Sprintf("~ %s -> %s", line1, line2))
			}
		}
	}

	summary = fmt.Sprintf("Added: %d lines, Removed: %d lines, Modified: %d lines",
		len(added), len(removed), len(modified))

	return &DiffResult{
		Added:    added,
		Removed:  removed,
		Modified: modified,
		Summary:  summary,
	}
}

type DiffResult struct {
	Added    []string
	Removed  []string
	Modified []string
	Summary  string
}
