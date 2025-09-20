package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	Email     string         `json:"email" gorm:"uniqueIndex;not null"`
	Username  string         `json:"username" gorm:"uniqueIndex;not null"`
	Password  string         `json:"-" gorm:"not null"`
	FirstName string         `json:"first_name"`
	LastName  string         `json:"last_name"`
	Role      UserRole       `json:"role" gorm:"default:user"`
	IsActive  bool           `json:"is_active" gorm:"default:true"`
	LastLogin *time.Time     `json:"last_login"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

type UserRole string

const (
	RoleAdmin       UserRole = "admin"
	RoleCompliance  UserRole = "compliance"
	RoleDeveloper   UserRole = "developer"
	RoleAuditor     UserRole = "auditor"
	RoleUser        UserRole = "user"
)

func (r UserRole) String() string {
	return string(r)
}

func (r UserRole) IsValid() bool {
	switch r {
	case RoleAdmin, RoleCompliance, RoleDeveloper, RoleAuditor, RoleUser:
		return true
	default:
		return false
	}
}

func (r UserRole) HasPermission(permission string) bool {
	switch r {
	case RoleAdmin:
		return true
	case RoleCompliance:
		return permission == "read" || permission == "compliance"
	case RoleDeveloper:
		return permission == "read" || permission == "write" || permission == "policy"
	case RoleAuditor:
		return permission == "read" || permission == "audit"
	case RoleUser:
		return permission == "read"
	default:
		return false
	}
}
