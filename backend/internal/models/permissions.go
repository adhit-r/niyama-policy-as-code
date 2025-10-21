package models

// Permission defines the type of permission
type Permission string

const (
	PermissionPolicyCreate     Permission = "policy:create"
	PermissionPolicyRead       Permission = "policy:read"
	PermissionPolicyUpdate     Permission = "policy:update"
	PermissionPolicyDelete     Permission = "policy:delete"
	PermissionPolicyExecute    Permission = "policy:execute"
	PermissionUserManage       Permission = "user:manage"
	PermissionOrgManage        Permission = "org:manage"
	PermissionComplianceView   Permission = "compliance:view"
	PermissionComplianceManage Permission = "compliance:manage"
	PermissionAuditView        Permission = "audit:view"
	PermissionAuditManage      Permission = "audit:manage"
)

func (p Permission) String() string {
	return string(p)
}

func (p Permission) IsValid() bool {
	switch p {
	case PermissionPolicyCreate, PermissionPolicyRead, PermissionPolicyUpdate, PermissionPolicyDelete, PermissionPolicyExecute,
		PermissionUserManage, PermissionOrgManage, PermissionComplianceView, PermissionComplianceManage,
		PermissionAuditView, PermissionAuditManage:
		return true
	default:
		return false
	}
}

// GetPermissionsForRole returns the permissions for a given role
func GetPermissionsForRole(role Role) []Permission {
	switch role {
	case RoleOwner:
		return []Permission{
			PermissionPolicyCreate, PermissionPolicyRead, PermissionPolicyUpdate, PermissionPolicyDelete, PermissionPolicyExecute,
			PermissionUserManage, PermissionOrgManage, PermissionComplianceView, PermissionComplianceManage,
			PermissionAuditView, PermissionAuditManage,
		}
	case RoleAdmin:
		return []Permission{
			PermissionPolicyCreate, PermissionPolicyRead, PermissionPolicyUpdate, PermissionPolicyDelete, PermissionPolicyExecute,
			PermissionUserManage, PermissionOrgManage, PermissionComplianceView, PermissionComplianceManage,
			PermissionAuditView, PermissionAuditManage,
		}
	case RoleEditor:
		return []Permission{
			PermissionPolicyCreate, PermissionPolicyRead, PermissionPolicyUpdate, PermissionPolicyExecute,
			PermissionComplianceView, PermissionAuditView,
		}
	case RoleViewer:
		return []Permission{
			PermissionPolicyRead, PermissionComplianceView, PermissionAuditView,
		}
	case RoleMember:
		return []Permission{
			PermissionPolicyRead,
		}
	default:
		return []Permission{}
	}
}

// GetGlobalPermissionsForRole returns the permissions for a global role
func GetGlobalPermissionsForRole(role GlobalUserRole) []Permission {
	switch role {
	case GlobalRoleAdmin:
		return []Permission{
			PermissionPolicyCreate, PermissionPolicyRead, PermissionPolicyUpdate, PermissionPolicyDelete, PermissionPolicyExecute,
			PermissionUserManage, PermissionOrgManage, PermissionComplianceView, PermissionComplianceManage,
			PermissionAuditView, PermissionAuditManage,
		}
	case GlobalRoleCompliance:
		return []Permission{
			PermissionPolicyRead, PermissionPolicyExecute, PermissionComplianceView, PermissionComplianceManage,
			PermissionAuditView,
		}
	case GlobalRoleDeveloper:
		return []Permission{
			PermissionPolicyCreate, PermissionPolicyRead, PermissionPolicyUpdate, PermissionPolicyExecute,
			PermissionComplianceView,
		}
	case GlobalRoleAuditor:
		return []Permission{
			PermissionPolicyRead, PermissionComplianceView, PermissionAuditView, PermissionAuditManage,
		}
	case GlobalRoleUser:
		return []Permission{
			PermissionPolicyRead,
		}
	default:
		return []Permission{}
	}
}
