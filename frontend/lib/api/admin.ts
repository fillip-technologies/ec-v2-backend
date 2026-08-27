import { BACKEND_URL } from "@/config/api";
import { apiClient as fetch } from "./client";

function getAuthHeader(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  role?: string;
  collegeId?: number;
  gateway?: string;
}

/**
 * GET /admin/overview
 * Fetch high-level platform telemetry metrics
 */
export async function getAdminOverview() {
  try {
    const res = await fetch(`${BACKEND_URL}/admin/overview`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error("API getAdminOverview error:", error);
    return null;
  }
}

/**
 * GET /admin/colleges
 * Fetch list of registered B2B college institutions with optional pagination
 */
export async function getAdminColleges(params?: PaginationParams | string) {
  try {
    const searchParams = new URLSearchParams();
    if (typeof params === "string") {
      if (params) searchParams.append("status", params);
    } else if (params) {
      if (params.status) searchParams.append("status", params.status);
      if (params.search) searchParams.append("search", params.search);
      if (params.page !== undefined) searchParams.append("page", String(params.page));
      if (params.limit !== undefined) searchParams.append("limit", String(params.limit));
    }

    const qs = searchParams.toString();
    const url = qs ? `${BACKEND_URL}/admin/colleges?${qs}` : `${BACKEND_URL}/admin/colleges`;

    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return typeof params === "object" && params?.page !== undefined ? { data: [], meta: null } : [];
    }

    const json = await res.json();
    return json;
  } catch (error) {
    console.error("API getAdminColleges error:", error);
    return typeof params === "object" && params?.page !== undefined ? { data: [], meta: null } : [];
  }
}

/**
 * PATCH /admin/colleges/:id/status
 * Approve or reject a college institution
 */
export async function updateCollegeStatus(id: number, status: string) {
  const res = await fetch(`${BACKEND_URL}/admin/colleges/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || "Failed to update college status");
  }

  return await res.json();
}

/**
 * GET /admin/colleges/:id
 * Fetch 360-degree college dossier, B2B seat orders, coupon batches, and student cohorts
 */
export async function getAdminCollegeDetail(id: number) {
  try {
    const res = await fetch(`${BACKEND_URL}/admin/colleges/${id}`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Failed to fetch college details (HTTP ${res.status})`);
    }

    return await res.json();
  } catch (error: any) {
    console.error("API getAdminCollegeDetail error:", error);
    throw error;
  }
}

/**
 * GET /admin/users
 * Fetch list of platform users with optional pagination
 */
export async function getAdminUsers(params?: PaginationParams | string, status?: string) {
  try {
    const searchParams = new URLSearchParams();
    if (typeof params === "string") {
      if (params) searchParams.append("role", params);
      if (status) searchParams.append("status", status);
    } else if (params) {
      if (params.role) searchParams.append("role", params.role);
      if (params.status) searchParams.append("status", params.status);
      if (params.search) searchParams.append("search", params.search);
      if (params.page !== undefined) searchParams.append("page", String(params.page));
      if (params.limit !== undefined) searchParams.append("limit", String(params.limit));
    }

    const qs = searchParams.toString();
    const url = qs ? `${BACKEND_URL}/admin/users?${qs}` : `${BACKEND_URL}/admin/users`;

    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return typeof params === "object" && params?.page !== undefined ? { data: [], meta: null } : [];
    }

    return await res.json();
  } catch (error) {
    console.error("API getAdminUsers error:", error);
    return typeof params === "object" && params?.page !== undefined ? { data: [], meta: null } : [];
  }
}

/**
 * PATCH /admin/users/:id/status
 * Update user account status
 */
export async function updateUserStatus(id: number, status: string) {
  const res = await fetch(`${BACKEND_URL}/admin/users/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || "Failed to update user status");
  }

  return await res.json();
}

/**
 * GET /admin/submissions
 * Fetch list of student task submissions with optional pagination
 */
export async function getAdminSubmissions(params?: PaginationParams) {
  try {
    const searchParams = new URLSearchParams();
    if (params) {
      if (params.status) searchParams.append("status", params.status);
      if (params.search) searchParams.append("search", params.search);
      if (params.page !== undefined) searchParams.append("page", String(params.page));
      if (params.limit !== undefined) searchParams.append("limit", String(params.limit));
    }

    const qs = searchParams.toString();
    const url = qs ? `${BACKEND_URL}/admin/submissions?${qs}` : `${BACKEND_URL}/admin/submissions`;

    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return params?.page !== undefined ? { data: [], meta: null } : [];
    }

    return await res.json();
  } catch (error) {
    console.error("API getAdminSubmissions error:", error);
    return params?.page !== undefined ? { data: [], meta: null } : [];
  }
}

/**
 * PATCH /admin/submissions/:id/review
 * Approve or reject student task submission
 */
export async function reviewSubmission(id: number, status: "PASSED" | "NEEDS_WORK" | "EVALUATING", score?: number, feedback?: string) {
  const res = await fetch(`${BACKEND_URL}/admin/submissions/${id}/review`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify({ status, score, feedback }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || "Failed to submit review");
  }

  return await res.json();
}

/**
 * GET /orders
 * Fetch all student orders and payment attempts with optional pagination (Admin / Super Admin)
 */
export async function getAdminOrders(params?: PaginationParams) {
  try {
    const searchParams = new URLSearchParams();
    if (params) {
      if (params.status) searchParams.append("status", params.status);
      if (params.gateway) searchParams.append("gateway", params.gateway);
      if (params.search) searchParams.append("search", params.search);
      if (params.page !== undefined) searchParams.append("page", String(params.page));
      if (params.limit !== undefined) searchParams.append("limit", String(params.limit));
    }

    const qs = searchParams.toString();
    const url = qs ? `${BACKEND_URL}/orders?${qs}` : `${BACKEND_URL}/orders`;

    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return params?.page !== undefined ? { data: [], meta: null } : [];
    }

    return await res.json();
  } catch (error) {
    console.error("API getAdminOrders error:", error);
    return params?.page !== undefined ? { data: [], meta: null } : [];
  }
}

/**
 * GET /admin/students
 * Fetch registered student list with optional pagination
 */
export async function getAdminStudents(params?: PaginationParams) {
  try {
    const searchParams = new URLSearchParams();
    if (params) {
      if (params.collegeId !== undefined) searchParams.append("collegeId", String(params.collegeId));
      if (params.search) searchParams.append("search", params.search);
      if (params.page !== undefined) searchParams.append("page", String(params.page));
      if (params.limit !== undefined) searchParams.append("limit", String(params.limit));
    }

    const qs = searchParams.toString();
    const url = qs ? `${BACKEND_URL}/admin/students?${qs}` : `${BACKEND_URL}/admin/students`;

    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return params?.page !== undefined ? { data: [], meta: null } : [];
    }

    return await res.json();
  } catch (error) {
    console.error("API getAdminStudents error:", error);
    return params?.page !== undefined ? { data: [], meta: null } : [];
  }
}

/**
 * GET /admin/students/:id
 * Fetch 360-degree student portfolio dossier
 */
export async function getAdminStudentDetail(id: number) {
  try {
    const res = await fetch(`${BACKEND_URL}/admin/students/${id}`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Failed to fetch student details (HTTP ${res.status})`);
    }

    return await res.json();
  } catch (error: any) {
    console.error("API getAdminStudentDetail error:", error);
    throw error;
  }
}

/**
 * GET /admin/analytics/overview
 * Fetch fast executive KPIs, revenue trends, 4-stage funnel, and score distribution
 */
export async function getAdminAnalyticsOverview() {
  try {
    const res = await fetch(`${BACKEND_URL}/admin/analytics/overview`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error("API getAdminAnalyticsOverview error:", error);
    return null;
  }
}

/**
 * GET /admin/analytics/colleges
 * Fetch paginated and searchable B2B institutional cohort benchmarks
 */
export async function getAdminAnalyticsColleges(params?: { page?: number; limit?: number; search?: string }) {
  try {
    const searchParams = new URLSearchParams();
    if (params?.page !== undefined) searchParams.append("page", String(params.page));
    if (params?.limit !== undefined) searchParams.append("limit", String(params.limit));
    if (params?.search) searchParams.append("search", params.search);

    const qs = searchParams.toString();
    const url = qs ? `${BACKEND_URL}/admin/analytics/colleges?${qs}` : `${BACKEND_URL}/admin/analytics/colleges`;

    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 1, hasNextPage: false, hasPrevPage: false } };
    }

    return await res.json();
  } catch (error) {
    console.error("API getAdminAnalyticsColleges error:", error);
    return { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 1, hasNextPage: false, hasPrevPage: false } };
  }
}

/**
 * GET /admin/analytics/geographic
 * Fetch global student and visitor geographic distribution
 */
export async function getAdminAnalyticsGeographic() {
  try {
    const res = await fetch(`${BACKEND_URL}/admin/analytics/geographic`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return [];
    }

    return await res.json();
  } catch (error) {
    console.error("API getAdminAnalyticsGeographic error:", error);
    return [];
  }
}

/**
 * GET /admin/analytics
 * Fetch full platform telemetry
 */
export async function getAdminAnalytics() {
  try {
    const res = await fetch(`${BACKEND_URL}/admin/analytics`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error("API getAdminAnalytics error:", error);
    return null;
  }
}
