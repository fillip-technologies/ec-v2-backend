import { BACKEND_URL } from '@/config/api';

export interface LoginPayload {
  email: string;
  password: string;
  role?: string;
}

export interface StudentRegisterPayload {
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
  phoneNo?: string;
  countryId?: number;
  collegeId?: number | null;
  customCollegeName?: string;
  college_name?: string;
  usn?: string;
  branch?: string;
  graduationYear?: number;
}

export interface PublicCollegeItem {
  id: number;
  name: string;
  address?: string;
}

export interface CollegeRegisterPayload {
  email: string;
  password: string;
  phoneNo?: string;
  countryId?: number;
  collegeName: string;
  address?: string;
}

export interface AuthResponse {
  accessToken?: string;
  refreshToken?: string;
  user?: any;
  message?: string;
}

/**
 * POST /auth/login
 * Authenticate user with email, password, and optional role
 */
export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const res = await fetch(`${BACKEND_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || 'Invalid email or password');
  }

  return data;
}

/**
 * POST /auth/register/student
 * Self-registration for student accounts
 */
export async function registerStudent(payload: StudentRegisterPayload): Promise<AuthResponse> {
  const res = await fetch(`${BACKEND_URL}/auth/register/student`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg = Array.isArray(data.message)
      ? data.message.join(', ')
      : data.message || 'Registration failed';
    throw new Error(errorMsg);
  }

  return data;
}

/**
 * POST /auth/register/college
 * Institutional registration for college administrators
 */
export async function registerCollege(payload: CollegeRegisterPayload): Promise<AuthResponse> {
  const res = await fetch(`${BACKEND_URL}/auth/register/college`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg = Array.isArray(data.message)
      ? data.message.join(', ')
      : data.message || 'Registration failed';
    throw new Error(errorMsg);
  }

  return data;
}

/**
 * GET /auth/colleges
 * Public list of approved colleges for registration dropdown
 */
export async function getPublicColleges(): Promise<PublicCollegeItem[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/auth/colleges`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    return [];
  }
}

/**
 * POST /auth/logout
 * Revoke refresh token and invalidate active session
 */
export async function logout(refreshToken?: string | null): Promise<void> {
  try {
    await fetch(`${BACKEND_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ refreshToken }),
    });
  } catch (e) {
    console.warn('[API logout] network error during logout request:', e);
  }
}

/**
 * POST /auth/refresh
 * Refresh active access token using valid refresh token
 */
export async function refreshSession(refreshToken: string): Promise<AuthResponse> {
  const res = await fetch(`${BACKEND_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ refreshToken }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || 'Session refresh failed');
  }

  return data;
}

import { apiClient } from './client';

/**
 * GET /auth/profile
 * Fetch full profile for logged in user
 */
export async function getAuthProfile(): Promise<any> {
  const res = await apiClient(`${BACKEND_URL}/auth/profile`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Failed to fetch user profile');
  }

  return await res.json();
}

/**
 * PATCH /auth/profile
 * Update profile details for logged in user
 */
export async function updateAuthProfile(payload: any): Promise<any> {
  const res = await apiClient(`${BACKEND_URL}/auth/profile`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || 'Failed to update user profile');
  }

  return data;
}

/**
 * POST /auth/change-password
 * Change password for logged in user
 */
export async function changeAuthPassword(payload: { currentPassword: string; newPassword: string }): Promise<any> {
  const res = await apiClient(`${BACKEND_URL}/auth/change-password`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || 'Failed to update password');
  }

  return data;
}
