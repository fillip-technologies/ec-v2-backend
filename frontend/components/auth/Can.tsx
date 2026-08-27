'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';

interface CanProps {
  do?: string | string[];
  role?: string | string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const Can: React.FC<CanProps> = ({
  do: permission,
  role,
  children,
  fallback = null,
}) => {
  const { user, hasPermission, hasRole } = useAuth();

  // If no user is logged in, hide content unless fallback provided
  if (!user) {
    return <>{fallback}</>;
  }

  // Role validation
  if (role) {
    const rolesArray = Array.isArray(role) ? role : [role];
    if (!hasRole(rolesArray)) {
      return <>{fallback}</>;
    }
  }

  // Permission validation
  if (permission) {
    const permsArray = Array.isArray(permission) ? permission : [permission];
    const isAllowed = permsArray.some((p) => hasPermission(p));
    if (!isAllowed) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
};
