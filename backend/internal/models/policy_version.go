package models

import (
	"time"

	"gorm.io/gorm"
)

// PolicyVersion represents a version of a policy
type PolicyVersion struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	PolicyID    uint           `json:"policy_id"`
	Policy      Policy         `json:"policy" gorm:"foreignKey:PolicyID"`
	Version     int            `json:"version" gorm:"not null"`
	Content     string         `json:"content" gorm:"type:text"`
	Description string         `json:"description"`
	AuthorID    uint           `json:"author_id"`
	Author      User           `json:"author" gorm:"foreignKey:AuthorID"`
	IsActive    bool           `json:"is_active" gorm:"default:false"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}

// PolicyVersionDiff represents the differences between two policy versions
type PolicyVersionDiff struct {
	Version1      PolicyVersion `json:"version1"`
	Version2      PolicyVersion `json:"version2"`
	AddedLines    []string      `json:"added_lines"`
	RemovedLines  []string      `json:"removed_lines"`
	ModifiedLines []string      `json:"modified_lines"`
	Summary       string        `json:"summary"`
}

// PolicyVersionHistory represents the history of changes to a policy
type PolicyVersionHistory struct {
	PolicyID      uint            `json:"policy_id"`
	Policy        Policy          `json:"policy" gorm:"foreignKey:PolicyID"`
	Versions      []PolicyVersion `json:"versions" gorm:"foreignKey:PolicyID"`
	TotalVersions int             `json:"total_versions"`
	LastModified  time.Time       `json:"last_modified"`
}
