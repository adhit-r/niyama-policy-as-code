package models

import (
	"time"

	"gorm.io/gorm"
)

type Policy struct {
	ID             uint                   `json:"id" gorm:"primaryKey"`
	Name           string                 `json:"name" gorm:"not null"`
	Description    string                 `json:"description"`
	Content        string                 `json:"content" gorm:"type:text"`
	Language       string                 `json:"language" gorm:"default:rego"`
	Category       string                 `json:"category"`
	AccessLevel    AccessLevel            `json:"access_level" gorm:"default:private"`
	Status         PolicyStatus           `json:"status" gorm:"default:draft"`
	AuthorID       uint                   `json:"author_id"`
	Author         User                   `json:"author" gorm:"foreignKey:AuthorID"`
	OrganizationID uint                   `json:"organization_id"`
	Organization   Organization           `json:"organization" gorm:"foreignKey:OrganizationID"`
	Tags           []string               `json:"tags" gorm:"serializer:json"`
	Metadata       map[string]interface{} `json:"metadata" gorm:"serializer:json"`
	CreatedAt      time.Time              `json:"created_at"`
	UpdatedAt      time.Time              `json:"updated_at"`
	DeletedAt      gorm.DeletedAt         `json:"-" gorm:"index"`
}

type PolicyStatus string

const (
	StatusDraft    PolicyStatus = "draft"
	StatusActive   PolicyStatus = "active"
	StatusInactive PolicyStatus = "inactive"
	StatusArchived PolicyStatus = "archived"
)

func (s PolicyStatus) String() string {
	return string(s)
}

func (s PolicyStatus) IsValid() bool {
	switch s {
	case StatusDraft, StatusActive, StatusInactive, StatusArchived:
		return true
	default:
		return false
	}
}

type PolicyTemplate struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	Name        string         `json:"name" gorm:"not null"`
	Description string         `json:"description"`
	Content     string         `json:"content" gorm:"type:text"`
	Language    string         `json:"language" gorm:"default:rego"`
	Category    string         `json:"category"`
	Tags        []string       `json:"tags" gorm:"serializer:json"`
	IsPublic    bool           `json:"is_public" gorm:"default:true"`
	Downloads   int            `json:"downloads" gorm:"default:0"`
	Rating      float64        `json:"rating" gorm:"default:0"`
	AuthorID    uint           `json:"author_id"`
	Author      User           `json:"author" gorm:"foreignKey:AuthorID"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}

type PolicyEvaluation struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	PolicyID  uint           `json:"policy_id"`
	Policy    Policy         `json:"policy" gorm:"foreignKey:PolicyID"`
	Input     string         `json:"input" gorm:"type:text"`
	Output    string         `json:"output" gorm:"type:text"`
	Decision  string         `json:"decision"`
	Duration  int64          `json:"duration"` // in milliseconds
	UserID    uint           `json:"user_id"`
	User      User           `json:"user" gorm:"foreignKey:UserID"`
	CreatedAt time.Time      `json:"created_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

// AccessLevel defines who can access a policy
type AccessLevel string

const (
	AccessPrivate AccessLevel = "private" // Only author
	AccessOrg     AccessLevel = "org"     // Organization members
	AccessPublic  AccessLevel = "public"  // Everyone
)

func (a AccessLevel) String() string {
	return string(a)
}

func (a AccessLevel) IsValid() bool {
	switch a {
	case AccessPrivate, AccessOrg, AccessPublic:
		return true
	default:
		return false
	}
}

func (r Role) HasPermission(permission Permission) bool {
	permissions := GetPermissionsForRole(r)
	for _, p := range permissions {
		if p == permission {
			return true
		}
	}
	return false
}
