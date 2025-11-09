package models

import (
	"time"

	"gorm.io/gorm"
)

// Organization represents a tenant/organization
type Organization struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	Name        string         `json:"name" gorm:"not null"`
	Slug        string         `json:"slug" gorm:"uniqueIndex;not null"`
	Description string         `json:"description"`
	Settings    string         `json:"settings" gorm:"type:text"` // Simplified to string for now
	IsActive    bool           `json:"is_active" gorm:"default:true"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}

// UserOrganizationRole defines user roles within an organization
type UserOrganizationRole struct {
	ID             uint           `json:"id" gorm:"primaryKey"`
	UserID         uint           `json:"user_id"`
	User           User           `json:"user" gorm:"foreignKey:UserID"`
	OrganizationID uint           `json:"organization_id"`
	Organization   Organization   `json:"organization" gorm:"foreignKey:OrganizationID"`
	Role           Role           `json:"role" gorm:"default:member"`
	Permissions    string         `json:"permissions" gorm:"type:text"` // Simplified to string for now
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `json:"-" gorm:"index"`
}

// Role represents a role within an organization
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
