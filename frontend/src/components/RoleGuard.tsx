import React from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useQuery } from 'react-query';
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
  const { isSignedIn, getToken } = useAuth();
  const { user } = useUser();

  if (!isSignedIn || !user) {
    return <>{fallback}</>;
  }

  // Check roles using Clerk's public metadata
  if (roles.length > 0) {
    const userRole = user.publicMetadata?.role as string || 'user';
    const hasRequiredRole = requireAll
      ? roles.every(role => userRole === role)
      : roles.includes(userRole);

    if (!hasRequiredRole) {
      return <>{fallback}</>;
    }
  }

  // Fetch and check permissions
  const { data: userPermissions, isLoading, error } = useQuery(
    ['userPermissions', user.id],
    () => {
      return getToken().then(token => {
        return fetch('http://localhost:8000/api/v1/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }).then(res => {
          if (!res.ok) {
            throw new Error('Failed to fetch user permissions');
          }
          return res.json();
        });
      });
    },
    {
      enabled: !!user.id && permissions.length > 0,
      staleTime: 5 * 60 * 1000, // 5 minutes
      onError: (err) => {
        console.error('Failed to load permissions:', err);
      }
    }
  );

  if (permissions.length > 0) {
    if (isLoading) {
      return <>{fallback}</>; // Show fallback while loading
    }
    if (error || !userPermissions || !userPermissions.permissions) {
      return <>{fallback}</>; // Show fallback on error or no permissions
    }

    const hasRequiredPermission = requireAll
      ? permissions.every(perm => userPermissions.permissions.includes(perm as string))
      : permissions.some(perm => userPermissions.permissions.includes(perm as string));

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
