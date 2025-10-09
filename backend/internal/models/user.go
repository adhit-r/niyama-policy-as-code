package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID           uint           `json:"id" gorm:"primaryKey"`
	Email        string         `json:"email" gorm:"uniqueIndex;not null"`
	Username     string         `json:"username" gorm:"uniqueIndex;not null"`
	Password     string         `json:"-" gorm:"not null"`
	FirstName    string         `json:"first_name"`
	LastName     string         `json:"last_name"`
	Role         GlobalUserRole `json:"role" gorm:"default:user"`
	IsActive     bool           `json:"is_active" gorm:"default:true"`
	LastLogin    *time.Time     `json:"last_login"`
	DefaultOrgID *uint          `json:"default_org_id"`
	DefaultOrg   *Organization  `json:"default_org" gorm:"foreignKey:DefaultOrgID"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `json:"-" gorm:"index"`
}

type GlobalUserRole string

const (
	GlobalRoleAdmin      GlobalUserRole = "admin"
	GlobalRoleCompliance GlobalUserRole = "compliance"
	GlobalRoleDeveloper  GlobalUserRole = "developer"
	GlobalRoleAuditor    GlobalUserRole = "auditor"
	GlobalRoleUser       GlobalUserRole = "user"
)

func (r GlobalUserRole) String() string {
	return string(r)
}

func (r GlobalUserRole) IsValid() bool {
	switch r {
	case GlobalRoleAdmin, GlobalRoleCompliance, GlobalRoleDeveloper, GlobalRoleAuditor, GlobalRoleUser:
		return true
	default:
		return false
	}
}

func (r GlobalUserRole) HasPermission(permission Permission) bool {
	permissions := GetGlobalPermissionsForRole(r)
	for _, p := range permissions {
		if p == permission {
			return true
		}
	}
	return false
}
