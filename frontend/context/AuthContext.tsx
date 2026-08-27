'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient, refreshTokenSilently } from '@/lib/api/client';
import { logout as apiLogout } from '@/lib/api/auth';

export interface UserPermissions {
  id: number;
  email: string;
  role: string | { id: number; name: string };
  firstName?: string;
  lastName?: string;
  permissions?: string[];
  [key: string]: any;
}

export function getUserRoleName(role: any): string {
  if (!role) return 'guest';
  if (typeof role === 'string') return role.toLowerCase();
  if (typeof role === 'object' && role.name) return String(role.name).toLowerCase();
  return 'guest';
}

interface AuthContextType {
  user: UserPermissions | null;
  setUser: React.Dispatch<React.SetStateAction<UserPermissions | null>>;
  hasPermission: (permissionSlug: string) => boolean;
  hasRole: (roles: string | string[]) => boolean;
  roleName: string;
  refreshSession: () => Promise<string | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserPermissions | null>(null);

  // Sync state from storage
  const syncLocalSession = useCallback(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
      } catch {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, []);

  // Validate session against backend and silently refresh if token is expired
  const validateSession = useCallback(async () => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token && !storedUser) return;

    try {
      const res = await apiClient('/auth/profile');
      if (res.ok) {
        const profile = await res.json();
        setUser(profile);
        localStorage.setItem('user', JSON.stringify(profile));
      } else {
        console.warn('[AUTH-CONTEXT] ⚠️ Session validation returned status:', res.status);
      }
    } catch (err) {
      console.warn('[AUTH-CONTEXT] Session validation error:', err);
    }
  }, []);

  useEffect(() => {
    syncLocalSession();
    validateSession();

    // Listen to token refresh and logout events dispatched from apiClient
    const handleTokenRefreshed = (e: any) => {
      if (e.detail?.user) {
        setUser(e.detail.user);
      } else {
        syncLocalSession();
      }
    };

    const handleLogoutEvent = () => {
      setUser(null);
    };

    window.addEventListener('auth:token_refreshed', handleTokenRefreshed);
    window.addEventListener('auth:logout', handleLogoutEvent);

    // Proactive refresh timer: refresh every 10 minutes (before 15m access token expires)
    const interval = setInterval(() => {
      if (localStorage.getItem('token')) {
        refreshTokenSilently();
      }
    }, 10 * 60 * 1000);

    return () => {
      window.removeEventListener('auth:token_refreshed', handleTokenRefreshed);
      window.removeEventListener('auth:logout', handleLogoutEvent);
      clearInterval(interval);
    };
  }, [syncLocalSession, validateSession]);

  const roleName = getUserRoleName(user?.role);

  const hasPermission = (permissionSlug: string): boolean => {
    if (!user) return false;
    if (roleName === 'super_admin') return true;
    return user.permissions?.includes(permissionSlug) ?? false;
  };

  const hasRole = (roles: string | string[]): boolean => {
    if (!user) return false;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    return allowedRoles.map((r) => r.toLowerCase()).includes(roleName);
  };

  const logout = async () => {
    try {
      const storedRefreshToken = localStorage.getItem('refreshToken');
      await apiLogout(storedRefreshToken);
    } catch (e) {
      console.warn('[AuthContext] Logout request failed:', e);
    }

    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('activeRole');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        hasPermission,
        hasRole,
        roleName,
        refreshSession: refreshTokenSilently,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
