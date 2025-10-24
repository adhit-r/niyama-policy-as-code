package services

import (
	"bytes"
	"encoding/csv"
	"fmt"
	"niyama-backend/internal/config"
	"niyama-backend/internal/database"
	"niyama-backend/internal/models"
	"strings"
	"time"
)

type EvidenceService struct {
	db  *database.Database
	cfg *config.Config
}

func NewEvidenceService(db *database.Database, cfg *config.Config) *EvidenceService {
	return &EvidenceService{db: db, cfg: cfg}
}

type EvidenceRequest struct {
	Framework  string    `json:"framework"` // "SOC2", "HIPAA", "GDPR"
	StartDate  time.Time `json:"start_date"`
	EndDate    time.Time `json:"end_date"`
	ControlIDs []string  `json:"control_ids,omitempty"`
}

type EvidencePackage struct {
	Framework   string            `json:"framework"`
	GeneratedAt time.Time         `json:"generated_at"`
	Period      string            `json:"period"`
	Controls    []ControlEvidence `json:"controls"`
	Summary     EvidenceSummary   `json:"summary"`
}

type ControlEvidence struct {
	ControlID   string                    `json:"control_id"`
	Name        string                    `json:"name"`
	Description string                    `json:"description"`
	Status      string                    `json:"status"` // "compliant", "non-compliant", "partial"
	Policies    []string                  `json:"policies"`
	Evaluations []models.PolicyEvaluation `json:"evaluations"`
	Violations  int                       `json:"violations"`
}

type EvidenceSummary struct {
	TotalControls     int     `json:"total_controls"`
	CompliantControls int     `json:"compliant_controls"`
	TotalEvaluations  int     `json:"total_evaluations"`
	PassedEvaluations int     `json:"passed_evaluations"`
	FailedEvaluations int     `json:"failed_evaluations"`
	ComplianceScore   float64 `json:"compliance_score"`
}

func (s *EvidenceService) CollectEvidence(req *EvidenceRequest) (*EvidencePackage, error) {
	// Get control mappings for framework
	controls := s.getControlsForFramework(req.Framework)

	var controlEvidences []ControlEvidence
	totalEvals := 0
	passedEvals := 0

	for _, control := range controls {
		// Skip if specific controls requested and this isn't one
		if len(req.ControlIDs) > 0 && !contains(req.ControlIDs, control.ID) {
			continue
		}

		// Get policy evaluations for this control's policies
		evaluations := s.getEvaluationsForControl(control, req.StartDate, req.EndDate)

		passed := 0
		for _, eval := range evaluations {
			if eval.Decision == "allow" {
				passed++
			}
		}

		status := "compliant"
		if passed < len(evaluations) {
			if passed == 0 {
				status = "non-compliant"
			} else {
				status = "partial"
			}
		}

		controlEvidences = append(controlEvidences, ControlEvidence{
			ControlID:   control.ID,
			Name:        control.Name,
			Description: control.Description,
			Status:      status,
			Policies:    control.PolicyNames,
			Evaluations: evaluations,
			Violations:  len(evaluations) - passed,
		})

		totalEvals += len(evaluations)
		passedEvals += passed
	}

	// Calculate summary
	compliant := 0
	for _, ce := range controlEvidences {
		if ce.Status == "compliant" {
			compliant++
		}
	}

	complianceScore := 0.0
	if totalEvals > 0 {
		complianceScore = float64(passedEvals) / float64(totalEvals) * 100
	}

	return &EvidencePackage{
		Framework:   req.Framework,
		GeneratedAt: time.Now(),
		Period:      fmt.Sprintf("%s to %s", req.StartDate.Format("2006-01-02"), req.EndDate.Format("2006-01-02")),
		Controls:    controlEvidences,
		Summary: EvidenceSummary{
			TotalControls:     len(controlEvidences),
			CompliantControls: compliant,
			TotalEvaluations:  totalEvals,
			PassedEvaluations: passedEvals,
			FailedEvaluations: totalEvals - passedEvals,
			ComplianceScore:   complianceScore,
		},
	}, nil
}

type ComplianceControl struct {
	ID          string
	Name        string
	Description string
	PolicyNames []string
	PolicyIDs   []uint
}

func (s *EvidenceService) getControlsForFramework(framework string) []ComplianceControl {
	// Hardcoded for MVP - would come from database in production
	switch framework {
	case "SOC2":
		return []ComplianceControl{
			{
				ID:          "CC6.1",
				Name:        "Logical and Physical Access Controls",
				Description: "The entity implements logical access security software, infrastructure, and architectures",
				PolicyNames: []string{"Kubernetes Security Policy", "Resource Limits Policy"},
				PolicyIDs:   []uint{1, 2},
			},
			{
				ID:          "CC7.2",
				Name:        "System Monitoring",
				Description: "The entity monitors system components and alerts for potential security events",
				PolicyNames: []string{"Monitoring Policy"},
				PolicyIDs:   []uint{3},
			},
		}
	case "HIPAA":
		return []ComplianceControl{
			{
				ID:          "164.308(a)(4)",
				Name:        "Information Access Management",
				Description: "Implement policies and procedures for authorizing access to ePHI",
				PolicyNames: []string{"Access Control Policy"},
				PolicyIDs:   []uint{1},
			},
		}
	default:
		return []ComplianceControl{}
	}
}

func (s *EvidenceService) getEvaluationsForControl(control ComplianceControl, start, end time.Time) []models.PolicyEvaluation {
	if s.db == nil {
		// Return mock data for MVP
		return []models.PolicyEvaluation{
			{ID: 1, PolicyID: control.PolicyIDs[0], Decision: "allow", Duration: 120, CreatedAt: time.Now()},
			{ID: 2, PolicyID: control.PolicyIDs[0], Decision: "allow", Duration: 150, CreatedAt: time.Now()},
		}
	}

	var evaluations []models.PolicyEvaluation
	s.db.DB.Where("policy_id IN ? AND created_at BETWEEN ? AND ?", control.PolicyIDs, start, end).
		Find(&evaluations)
	return evaluations
}

func contains(slice []string, item string) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
}

// ExportCSV exports evidence as CSV
func (s *EvidenceService) ExportCSV(evidence *EvidencePackage) ([]byte, error) {
	var buf bytes.Buffer
	writer := csv.NewWriter(&buf)

	// Header
	writer.Write([]string{"Control ID", "Control Name", "Status", "Policies", "Violations", "Evaluations"})

	// Data rows
	for _, control := range evidence.Controls {
		writer.Write([]string{
			control.ControlID,
			control.Name,
			control.Status,
			strings.Join(control.Policies, "; "),
			fmt.Sprintf("%d", control.Violations),
			fmt.Sprintf("%d", len(control.Evaluations)),
		})
	}

	writer.Flush()
	return buf.Bytes(), nil
}
