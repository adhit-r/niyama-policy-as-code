package services

import (
	"encoding/json"
	"fmt"
	"niyama-backend/internal/config"
	"niyama-backend/internal/database"
	"time"
)

type SchedulerService struct {
	db  *database.Database
	cfg *config.Config
}

func NewSchedulerService(db *database.Database, cfg *config.Config) *SchedulerService {
	return &SchedulerService{db: db, cfg: cfg}
}

type ScanSchedule struct {
	ID        string                 `json:"id"`
	Name      string                 `json:"name"`
	Provider  string                 `json:"provider"`
	Regions   []string               `json:"regions"`
	Filters   map[string]interface{} `json:"filters"`
	Schedule  string                 `json:"schedule"` // Cron expression
	Enabled   bool                   `json:"enabled"`
	LastRun   *time.Time             `json:"last_run"`
	NextRun   *time.Time             `json:"next_run"`
	CreatedAt time.Time              `json:"created_at"`
	UpdatedAt time.Time              `json:"updated_at"`
}

type CronJob struct {
	ID        string                 `json:"id"`
	Name      string                 `json:"name"`
	Schedule  string                 `json:"schedule"`
	Provider  string                 `json:"provider"`
	Regions   []string               `json:"regions"`
	Filters   map[string]interface{} `json:"filters"`
	Enabled   bool                   `json:"enabled"`
	LastRun   *time.Time             `json:"last_run"`
	NextRun   *time.Time             `json:"next_run"`
	Status    string                 `json:"status"` // "active", "paused", "failed"
	CreatedAt time.Time              `json:"created_at"`
	UpdatedAt time.Time              `json:"updated_at"`
}

type ScanTrigger struct {
	Type        string                 `json:"type"` // "scheduled", "event", "manual"
	Provider    string                 `json:"provider"`
	Regions     []string               `json:"regions"`
	Filters     map[string]interface{} `json:"filters"`
	TriggeredBy string                 `json:"triggered_by"`
	TriggeredAt time.Time              `json:"triggered_at"`
}

func (s *SchedulerService) CreateScanSchedule(schedule *ScanSchedule, userID, orgID uint) (*ScanSchedule, error) {
	schedule.ID = fmt.Sprintf("schedule_%d_%d", time.Now().Unix(), userID)
	schedule.CreatedAt = time.Now()
	schedule.UpdatedAt = time.Now()

	// Calculate next run time
	nextRun, err := s.calculateNextRun(schedule.Schedule)
	if err != nil {
		return nil, fmt.Errorf("invalid schedule format: %w", err)
	}
	schedule.NextRun = &nextRun

	// Save to database
	if s.db != nil {
		scheduleData := map[string]interface{}{
			"id":         schedule.ID,
			"name":       schedule.Name,
			"provider":   schedule.Provider,
			"regions":    schedulerToJSON(schedule.Regions),
			"filters":    schedulerToJSON(schedule.Filters),
			"schedule":   schedule.Schedule,
			"enabled":    schedule.Enabled,
			"user_id":    userID,
			"org_id":     orgID,
			"created_at": schedule.CreatedAt,
			"updated_at": schedule.UpdatedAt,
		}
		s.db.DB.Table("scan_schedules").Create(scheduleData)
	}

	return schedule, nil
}

func (s *SchedulerService) UpdateScanSchedule(scheduleID string, updates *ScanSchedule, userID, orgID uint) (*ScanSchedule, error) {
	// Get existing schedule
	schedule, err := s.GetScanSchedule(scheduleID, userID, orgID)
	if err != nil {
		return nil, err
	}

	// Update fields
	if updates.Name != "" {
		schedule.Name = updates.Name
	}
	if updates.Provider != "" {
		schedule.Provider = updates.Provider
	}
	if len(updates.Regions) > 0 {
		schedule.Regions = updates.Regions
	}
	if updates.Filters != nil {
		schedule.Filters = updates.Filters
	}
	if updates.Schedule != "" {
		schedule.Schedule = updates.Schedule
		// Recalculate next run
		nextRun, err := s.calculateNextRun(schedule.Schedule)
		if err != nil {
			return nil, fmt.Errorf("invalid schedule format: %w", err)
		}
		schedule.NextRun = &nextRun
	}
	schedule.Enabled = updates.Enabled
	schedule.UpdatedAt = time.Now()

	// Save to database
	if s.db != nil {
		updateData := map[string]interface{}{
			"name":       schedule.Name,
			"provider":   schedule.Provider,
			"regions":    schedulerToJSON(schedule.Regions),
			"filters":    schedulerToJSON(schedule.Filters),
			"schedule":   schedule.Schedule,
			"enabled":    schedule.Enabled,
			"updated_at": schedule.UpdatedAt,
		}
		s.db.DB.Table("scan_schedules").Where("id = ?", scheduleID).Updates(updateData)
	}

	return schedule, nil
}

func (s *SchedulerService) GetScanSchedule(scheduleID string, userID, orgID uint) (*ScanSchedule, error) {
	if s.db == nil {
		// Return mock data for MVP
		return &ScanSchedule{
			ID:        scheduleID,
			Name:      "Daily AWS Scan",
			Provider:  "aws",
			Regions:   []string{"us-east-1", "us-west-2"},
			Filters:   map[string]interface{}{"type": "ec2-instance"},
			Schedule:  "0 2 * * *", // Daily at 2 AM
			Enabled:   true,
			CreatedAt: time.Now().AddDate(0, 0, -7),
			UpdatedAt: time.Now().AddDate(0, 0, -1),
		}, nil
	}

	var scheduleData map[string]interface{}
	err := s.db.DB.Table("scan_schedules").
		Where("id = ? AND user_id = ? AND org_id = ?", scheduleID, userID, orgID).
		First(&scheduleData).Error
	if err != nil {
		return nil, err
	}

	// Convert to ScanSchedule
	schedule := &ScanSchedule{
		ID:        scheduleData["id"].(string),
		Name:      scheduleData["name"].(string),
		Provider:  scheduleData["provider"].(string),
		Schedule:  scheduleData["schedule"].(string),
		Enabled:   scheduleData["enabled"].(bool),
		CreatedAt: scheduleData["created_at"].(time.Time),
		UpdatedAt: scheduleData["updated_at"].(time.Time),
	}

	// Parse JSON fields
	json.Unmarshal([]byte(scheduleData["regions"].(string)), &schedule.Regions)
	json.Unmarshal([]byte(scheduleData["filters"].(string)), &schedule.Filters)

	return schedule, nil
}

func (s *SchedulerService) ListScanSchedules(userID, orgID uint) ([]ScanSchedule, error) {
	if s.db == nil {
		// Return mock data for MVP
		return []ScanSchedule{
			{
				ID:        "schedule_1",
				Name:      "Daily AWS Scan",
				Provider:  "aws",
				Regions:   []string{"us-east-1", "us-west-2"},
				Schedule:  "0 2 * * *",
				Enabled:   true,
				LastRun:   &[]time.Time{time.Now().AddDate(0, 0, -1)}[0],
				NextRun:   &[]time.Time{time.Now().AddDate(0, 0, 1)}[0],
				CreatedAt: time.Now().AddDate(0, 0, -7),
				UpdatedAt: time.Now().AddDate(0, 0, -1),
			},
			{
				ID:        "schedule_2",
				Name:      "Weekly Kubernetes Scan",
				Provider:  "kubernetes",
				Regions:   []string{"default"},
				Schedule:  "0 3 * * 0", // Weekly on Sunday at 3 AM
				Enabled:   true,
				LastRun:   &[]time.Time{time.Now().AddDate(0, 0, -7)}[0],
				NextRun:   &[]time.Time{time.Now().AddDate(0, 0, 1)}[0],
				CreatedAt: time.Now().AddDate(0, 0, -14),
				UpdatedAt: time.Now().AddDate(0, 0, -7),
			},
		}, nil
	}

	var schedules []ScanSchedule
	var scheduleData []map[string]interface{}

	s.db.DB.Table("scan_schedules").
		Where("user_id = ? AND org_id = ?", userID, orgID).
		Order("created_at DESC").
		Find(&scheduleData)

	for _, data := range scheduleData {
		schedule := ScanSchedule{
			ID:        data["id"].(string),
			Name:      data["name"].(string),
			Provider:  data["provider"].(string),
			Schedule:  data["schedule"].(string),
			Enabled:   data["enabled"].(bool),
			CreatedAt: data["created_at"].(time.Time),
			UpdatedAt: data["updated_at"].(time.Time),
		}

		// Parse JSON fields
		json.Unmarshal([]byte(data["regions"].(string)), &schedule.Regions)
		json.Unmarshal([]byte(data["filters"].(string)), &schedule.Filters)

		schedules = append(schedules, schedule)
	}

	return schedules, nil
}

func (s *SchedulerService) DeleteScanSchedule(scheduleID string, userID, orgID uint) error {
	if s.db == nil {
		return nil
	}

	return s.db.DB.Table("scan_schedules").
		Where("id = ? AND user_id = ? AND org_id = ?", scheduleID, userID, orgID).
		Delete(&ScanSchedule{}).Error
}

func (s *SchedulerService) TriggerScan(trigger *ScanTrigger, userID, orgID uint) (string, error) {
	// Create scan request
	scanReq := &ScanRequest{
		Provider: trigger.Provider,
		Regions:  trigger.Regions,
		Filters:  trigger.Filters,
	}

	// Use scanner service to perform scan
	scanner := NewScannerService(s.db, s.cfg)
	result, err := scanner.ScanCloudResources(scanReq, userID, orgID)
	if err != nil {
		return "", err
	}

	// Save trigger record
	if s.db != nil {
		triggerData := map[string]interface{}{
			"trigger_id":   fmt.Sprintf("trigger_%d", time.Now().Unix()),
			"type":         trigger.Type,
			"provider":     trigger.Provider,
			"regions":      schedulerToJSON(trigger.Regions),
			"filters":      schedulerToJSON(trigger.Filters),
			"triggered_by": trigger.TriggeredBy,
			"triggered_at": trigger.TriggeredAt,
			"scan_id":      result.ScanID,
			"user_id":      userID,
			"org_id":       orgID,
		}
		s.db.DB.Table("scan_triggers").Create(triggerData)
	}

	return result.ScanID, nil
}

func (s *SchedulerService) GetScheduledScans() ([]ScanSchedule, error) {
	// Get all enabled schedules that are due for execution
	if s.db == nil {
		return []ScanSchedule{}, nil
	}

	var schedules []ScanSchedule
	var scheduleData []map[string]interface{}

	s.db.DB.Table("scan_schedules").
		Where("enabled = ? AND next_run <= ?", true, time.Now()).
		Find(&scheduleData)

	for _, data := range scheduleData {
		schedule := ScanSchedule{
			ID:        data["id"].(string),
			Name:      data["name"].(string),
			Provider:  data["provider"].(string),
			Schedule:  data["schedule"].(string),
			Enabled:   data["enabled"].(bool),
			CreatedAt: data["created_at"].(time.Time),
			UpdatedAt: data["updated_at"].(time.Time),
		}

		// Parse JSON fields
		json.Unmarshal([]byte(data["regions"].(string)), &schedule.Regions)
		json.Unmarshal([]byte(data["filters"].(string)), &schedule.Filters)

		schedules = append(schedules, schedule)
	}

	return schedules, nil
}

func (s *SchedulerService) UpdateScheduleLastRun(scheduleID string, lastRun time.Time) error {
	if s.db == nil {
		return nil
	}

	// Update last run time and calculate next run
	nextRun, err := s.calculateNextRun("0 2 * * *") // Default schedule
	if err != nil {
		return err
	}

	updateData := map[string]interface{}{
		"last_run":   lastRun,
		"next_run":   nextRun,
		"updated_at": time.Now(),
	}

	return s.db.DB.Table("scan_schedules").
		Where("id = ?", scheduleID).
		Updates(updateData).Error
}

func (s *SchedulerService) calculateNextRun(cronExpr string) (time.Time, error) {
	// Simple cron parser for MVP - in production, use a proper cron library
	// This is a simplified version that handles basic patterns

	now := time.Now()

	switch cronExpr {
	case "0 2 * * *": // Daily at 2 AM
		next := now.AddDate(0, 0, 1)
		return time.Date(next.Year(), next.Month(), next.Day(), 2, 0, 0, 0, next.Location()), nil
	case "0 3 * * 0": // Weekly on Sunday at 3 AM
		daysUntilSunday := (7 - int(now.Weekday())) % 7
		if daysUntilSunday == 0 {
			daysUntilSunday = 7
		}
		next := now.AddDate(0, 0, daysUntilSunday)
		return time.Date(next.Year(), next.Month(), next.Day(), 3, 0, 0, 0, next.Location()), nil
	case "0 */6 * * *": // Every 6 hours
		return now.Add(6 * time.Hour), nil
	case "0 0 1 * *": // Monthly on 1st at midnight
		next := now.AddDate(0, 1, 0)
		return time.Date(next.Year(), next.Month(), 1, 0, 0, 0, 0, next.Location()), nil
	default:
		// Default to daily at 2 AM
		next := now.AddDate(0, 0, 1)
		return time.Date(next.Year(), next.Month(), next.Day(), 2, 0, 0, 0, next.Location()), nil
	}
}

func (s *SchedulerService) CreateKubernetesCronJob(schedule *ScanSchedule, userID, orgID uint) (*CronJob, error) {
	cronJob := &CronJob{
		ID:        fmt.Sprintf("cronjob_%d_%d", time.Now().Unix(), userID),
		Name:      schedule.Name,
		Schedule:  schedule.Schedule,
		Provider:  schedule.Provider,
		Regions:   schedule.Regions,
		Filters:   schedule.Filters,
		Enabled:   schedule.Enabled,
		Status:    "active",
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	// Calculate next run
	nextRun, err := s.calculateNextRun(schedule.Schedule)
	if err != nil {
		return nil, err
	}
	cronJob.NextRun = &nextRun

	// Save to database
	if s.db != nil {
		cronJobData := map[string]interface{}{
			"id":         cronJob.ID,
			"name":       cronJob.Name,
			"schedule":   cronJob.Schedule,
			"provider":   cronJob.Provider,
			"regions":    schedulerToJSON(cronJob.Regions),
			"filters":    schedulerToJSON(cronJob.Filters),
			"enabled":    cronJob.Enabled,
			"status":     cronJob.Status,
			"next_run":   cronJob.NextRun,
			"user_id":    userID,
			"org_id":     orgID,
			"created_at": cronJob.CreatedAt,
			"updated_at": cronJob.UpdatedAt,
		}
		s.db.DB.Table("cron_jobs").Create(cronJobData)
	}

	return cronJob, nil
}

func (s *SchedulerService) ListCronJobs(userID, orgID uint) ([]CronJob, error) {
	if s.db == nil {
		// Return mock data for MVP
		return []CronJob{
			{
				ID:        "cronjob_1",
				Name:      "Daily AWS Inventory Scan",
				Schedule:  "0 2 * * *",
				Provider:  "aws",
				Regions:   []string{"us-east-1", "us-west-2"},
				Enabled:   true,
				Status:    "active",
				LastRun:   &[]time.Time{time.Now().AddDate(0, 0, -1)}[0],
				NextRun:   &[]time.Time{time.Now().AddDate(0, 0, 1)}[0],
				CreatedAt: time.Now().AddDate(0, 0, -7),
				UpdatedAt: time.Now().AddDate(0, 0, -1),
			},
			{
				ID:        "cronjob_2",
				Name:      "Weekly Drift Detection",
				Schedule:  "0 3 * * 0",
				Provider:  "aws",
				Regions:   []string{"us-east-1"},
				Enabled:   true,
				Status:    "active",
				LastRun:   &[]time.Time{time.Now().AddDate(0, 0, -7)}[0],
				NextRun:   &[]time.Time{time.Now().AddDate(0, 0, 1)}[0],
				CreatedAt: time.Now().AddDate(0, 0, -14),
				UpdatedAt: time.Now().AddDate(0, 0, -7),
			},
		}, nil
	}

	var cronJobs []CronJob
	var cronJobData []map[string]interface{}

	s.db.DB.Table("cron_jobs").
		Where("user_id = ? AND org_id = ?", userID, orgID).
		Order("created_at DESC").
		Find(&cronJobData)

	for _, data := range cronJobData {
		cronJob := CronJob{
			ID:        data["id"].(string),
			Name:      data["name"].(string),
			Schedule:  data["schedule"].(string),
			Provider:  data["provider"].(string),
			Enabled:   data["enabled"].(bool),
			Status:    data["status"].(string),
			CreatedAt: data["created_at"].(time.Time),
			UpdatedAt: data["updated_at"].(time.Time),
		}

		// Parse JSON fields
		json.Unmarshal([]byte(data["regions"].(string)), &cronJob.Regions)
		json.Unmarshal([]byte(data["filters"].(string)), &cronJob.Filters)

		// Parse time fields
		if data["last_run"] != nil {
			lastRun := data["last_run"].(time.Time)
			cronJob.LastRun = &lastRun
		}
		if data["next_run"] != nil {
			nextRun := data["next_run"].(time.Time)
			cronJob.NextRun = &nextRun
		}

		cronJobs = append(cronJobs, cronJob)
	}

	return cronJobs, nil
}

func schedulerToJSON(v interface{}) string {
	b, _ := json.Marshal(v)
	return string(b)
}
