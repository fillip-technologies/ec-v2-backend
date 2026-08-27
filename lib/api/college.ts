import { BACKEND_URL } from "@/config/api";
import { apiClient as fetch } from "./client";

function getAuthHeader(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * GET /college/overview
 * Fetch scoped telemetry metrics for logged-in college institution (e.g. VIT)
 */
export async function getCollegeOverview() {
  try {
    const res = await fetch(`${BACKEND_URL}/college/overview`, {
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
    console.error("API getCollegeOverview error:", error);
    return null;
  }
}

/**
 * GET /college/students
 * Fetch student cohort for this college
 */
export async function getCollegeStudents() {
  try {
    const res = await fetch(`${BACKEND_URL}/college/students`, {
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
    console.error("API getCollegeStudents error:", error);
    return [];
  }
}

/**
 * GET /college/coupons
 * Fetch zero-cost B2B coupon batches for this college
 */
export async function getCollegeCoupons() {
  try {
    const res = await fetch(`${BACKEND_URL}/college/coupons`, {
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
    console.error("API getCollegeCoupons error:", error);
    return [];
  }
}

/**
 * GET /college/reports
 * Fetch completion reports for this college cohort
 */
export async function getCollegeReports() {
  try {
    const res = await fetch(`${BACKEND_URL}/college/reports`, {
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
    console.error("API getCollegeReports error:", error);
    return null;
  }
}
