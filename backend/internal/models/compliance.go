package models

import (
	"time"

	"gorm.io/gorm"
)

type ComplianceFramework struct {
	ID          uint                `json:"id" gorm:"primaryKey"`
	Name        string              `json:"name" gorm:"not null"`
	Description string              `json:"description"`
	Version     string              `json:"version"`
	Type        string              `json:"type"` // SOC2, HIPAA, GDPR, ISO27001, etc.
	Controls    []ComplianceControl `json:"controls" gorm:"foreignKey:FrameworkID"`
	IsActive    bool                `json:"is_active" gorm:"default:true"`
	CreatedAt   time.Time           `json:"created_at"`
	UpdatedAt   time.Time           `json:"updated_at"`
	DeletedAt   gorm.DeletedAt      `json:"-" gorm:"index"`
}

type ComplianceControl struct {
	ID             uint                      `json:"id" gorm:"primaryKey"`
	FrameworkID    uint                      `json:"framework_id"`
	Framework      ComplianceFramework       `json:"framework" gorm:"foreignKey:FrameworkID"`
	Code           string                    `json:"code" gorm:"not null"`
	Title          string                    `json:"title" gorm:"not null"`
	Description    string                    `json:"description"`
	Category       string                    `json:"category"`
	Priority       string                    `json:"priority"` // High, Medium, Low
	PolicyMappings []PolicyComplianceMapping `json:"policy_mappings" gorm:"foreignKey:ControlID"`
	CreatedAt      time.Time                 `json:"created_at"`
	UpdatedAt      time.Time                 `json:"updated_at"`
	DeletedAt      gorm.DeletedAt            `json:"-" gorm:"index"`
}

type PolicyComplianceMapping struct {
	ID        uint              `json:"id" gorm:"primaryKey"`
	PolicyID  uint              `json:"policy_id"`
	Policy    Policy            `json:"policy" gorm:"foreignKey:PolicyID"`
	ControlID uint              `json:"control_id"`
	Control   ComplianceControl `json:"control" gorm:"foreignKey:ControlID"`
	Coverage  float64           `json:"coverage"` // 0.0 to 1.0
	Notes     string            `json:"notes"`
	CreatedAt time.Time         `json:"created_at"`
	UpdatedAt time.Time         `json:"updated_at"`
	DeletedAt gorm.DeletedAt    `json:"-" gorm:"index"`
}

type ComplianceReport struct {
	ID              uint                `json:"id" gorm:"primaryKey"`
	FrameworkID     uint                `json:"framework_id"`
	Framework       ComplianceFramework `json:"framework" gorm:"foreignKey:FrameworkID"`
	Title           string              `json:"title" gorm:"not null"`
	Description     string              `json:"description"`
	Status          ReportStatus        `json:"status" gorm:"default:generating"`
	Score           float64             `json:"score"` // 0.0 to 100.0
	TotalControls   int                 `json:"total_controls"`
	CoveredControls int                 `json:"covered_controls"`
	ReportData      string              `json:"report_data" gorm:"type:text"`
	GeneratedBy     uint                `json:"generated_by"`
	Generator       User                `json:"generator" gorm:"foreignKey:GeneratedBy"`
	CreatedAt       time.Time           `json:"created_at"`
	UpdatedAt       time.Time           `json:"updated_at"`
	DeletedAt       gorm.DeletedAt      `json:"-" gorm:"index"`
}

type ReportStatus string

const (
	ReportStatusGenerating ReportStatus = "generating"
	ReportStatusCompleted  ReportStatus = "completed"
	ReportStatusFailed     ReportStatus = "failed"
)

func (s ReportStatus) String() string {
	return string(s)
}

func (s ReportStatus) IsValid() bool {
	switch s {
	case ReportStatusGenerating, ReportStatusCompleted, ReportStatusFailed:
		return true
	default:
		return false
	}
}
