import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Permission } from '../types';

interface RoleGuardProps {
  children: React.ReactNode;
  permissions?: Permission[];
  roles?: string[];
  fallback?: React.ReactNode;
  requireAll?: boolean;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  permissions = [],
  roles = [],
  fallback = null,
  requireAll = false,
}) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <>{fallback}</>;
  }

  // Check roles
  if (roles.length > 0) {
    const hasRequiredRole = requireAll
      ? roles.every(role => user.role === role)
      : roles.includes(user.role);

    if (!hasRequiredRole) {
      return <>{fallback}</>;
    }
  }

  // Check permissions (if implemented in backend)
  if (permissions.length > 0) {
    // This would need to be implemented based on your permission system
    // For now, we'll assume all authenticated users have basic permissions
    const hasRequiredPermission = requireAll
      ? permissions.every(permission => true) // TODO: Implement actual permission check
      : permissions.some(permission => true); // TODO: Implement actual permission check

    if (!hasRequiredPermission) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
};

// Convenience components for common role checks
export const AdminOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback = null,
}) => (
  <RoleGuard roles={['admin']} fallback={fallback}>
    {children}
  </RoleGuard>
);

export const ComplianceOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback = null,
}) => (
  <RoleGuard roles={['compliance', 'admin']} fallback={fallback}>
    {children}
  </RoleGuard>
);

export const DeveloperOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback = null,
}) => (
  <RoleGuard roles={['developer', 'admin']} fallback={fallback}>
    {children}
  </RoleGuard>
);

