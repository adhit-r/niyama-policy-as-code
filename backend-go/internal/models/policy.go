package models

import (
	"time"

	"gorm.io/gorm"
)

type Policy struct {
	ID             uint            `json:"id" gorm:"primaryKey"`
	Name           string          `json:"name" gorm:"not null"`
	Description    string          `json:"description"`
	Content        string          `json:"content" gorm:"type:text"`
	Language       string          `json:"language" gorm:"default:rego"`
	Category       string          `json:"category"`
	Tags           []string        `json:"tags" gorm:"serializer:json"`
	Status         PolicyStatus    `json:"status" gorm:"default:draft"`
	Version        int             `json:"version" gorm:"default:1"`
	AuthorID       uint            `json:"author_id"`
	Author         User            `json:"author" gorm:"foreignKey:AuthorID"`
	OrganizationID uint            `json:"organization_id" gorm:"not null"`
	Organization   Organization    `json:"organization" gorm:"foreignKey:OrganizationID"`
	TemplateID     *uint           `json:"template_id"`
	Template       *PolicyTemplate `json:"template" gorm:"foreignKey:TemplateID"`
	IsActive       bool            `json:"is_active" gorm:"default:true"`
	IsPublic       bool            `json:"is_public" gorm:"default:false"`
	AccessLevel    AccessLevel     `json:"access_level" gorm:"default:private"`
	CreatedAt      time.Time       `json:"created_at"`
	UpdatedAt      time.Time       `json:"updated_at"`
	DeletedAt      gorm.DeletedAt  `json:"-" gorm:"index"`
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

// Organization represents a tenant/organization
type Organization struct {
	ID          uint                   `json:"id" gorm:"primaryKey"`
	Name        string                 `json:"name" gorm:"not null;unique"`
	Description string                 `json:"description"`
	Domain      string                 `json:"domain"`
	Settings    map[string]interface{} `json:"settings" gorm:"serializer:json"`
	IsActive    bool                   `json:"is_active" gorm:"default:true"`
	CreatedAt   time.Time              `json:"created_at"`
	UpdatedAt   time.Time              `json:"updated_at"`
	DeletedAt   gorm.DeletedAt         `json:"-" gorm:"index"`
}

// UserOrganizationRole defines user roles within an organization
type UserOrganizationRole struct {
	ID             uint           `json:"id" gorm:"primaryKey"`
	UserID         uint           `json:"user_id"`
	User           User           `json:"user" gorm:"foreignKey:UserID"`
	OrganizationID uint           `json:"organization_id"`
	Organization   Organization   `json:"organization" gorm:"foreignKey:OrganizationID"`
	Role           Role           `json:"role" gorm:"default:member"`
	Permissions    []string       `json:"permissions" gorm:"serializer:json"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `json:"-" gorm:"index"`
}

// Role defines the type of role
type Role string

const (
	RoleOwner  Role = "owner"
	RoleAdmin  Role = "admin"
	RoleEditor Role = "editor"
	RoleViewer Role = "viewer"
	RoleMember Role = "member"
)

func (r Role) String() string {
	return string(r)
}

func (r Role) IsValid() bool {
	switch r {
	case RoleOwner, RoleAdmin, RoleEditor, RoleViewer, RoleMember:
		return true
	default:
		return false
	}
}
