import { BACKEND_URL } from "@/config/api";
import { Cluster, Country, Program, Technology, Topic } from "@/types/catalog";
import { apiClient as fetch } from "./client";

const DEFAULT_COUNTRIES: Country[] = [
  { id: 1, isoCode: "IN", name: "India", defaultLocal: "en-IN", timezone: "Asia/Kolkata", currencyCode: "INR", isActive: true },
  { id: 2, isoCode: "US", name: "United States", defaultLocal: "en-US", timezone: "America/New_York", currencyCode: "USD", isActive: true },
  { id: 3, isoCode: "GB", name: "United Kingdom", defaultLocal: "en-GB", timezone: "Europe/London", currencyCode: "GBP", isActive: true },
  { id: 4, isoCode: "AE", name: "UAE", defaultLocal: "ar-AE", timezone: "Asia/Dubai", currencyCode: "AED", isActive: true },
];

/**
 * Fetch all active countries from backend system countries module (GET /countries)
 */
export async function getCountries(): Promise<Country[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/countries`, {
      cache: "no-store",
    });

    if (!res.ok) {
      console.warn(`GET /countries returned status ${res.status}. Using default countries list.`);
      return DEFAULT_COUNTRIES;
    }

    const data = await res.json();
    return Array.isArray(data) && data.length > 0 ? data : DEFAULT_COUNTRIES;
  } catch (error) {
    console.warn("API getCountries network error. Using default countries list:", error);
    return DEFAULT_COUNTRIES;
  }
}

/**
 * Fetch all programs from backend with optional filters
 */
export async function getPrograms(params?: {
  countryId?: number;
  topicId?: number;
  technologyId?: number;
  status?: string;
}): Promise<Program[]> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.countryId) searchParams.append("countryId", String(params.countryId));
    if (params?.topicId) searchParams.append("topicId", String(params.topicId));
    if (params?.technologyId) searchParams.append("technologyId", String(params.technologyId));
    if (params?.status) searchParams.append("status", params.status);

    const res = await fetch(`${BACKEND_URL}/catalog/programs?${searchParams.toString()}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      console.warn(`GET /catalog/programs returned status ${res.status}.`);
      return [];
    }

    return await res.json();
  } catch (error) {
    console.warn("API getPrograms error:", error);
    return [];
  }
}

/**
 * Fetch single program by ID or Slug
 */
export async function getProgramByIdOrSlug(idOrSlug: string): Promise<Program | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/catalog/programs/${idOrSlug}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    return await res.json();
  } catch (error) {
    console.warn("API getProgramByIdOrSlug error:", error);
    return null;
  }
}

/**
 * Fetch all clusters with topics
 */
export async function getClusters(): Promise<Cluster[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/catalog/clusters`, {
      cache: "no-store",
    });

    if (!res.ok) {
      console.warn(`GET /catalog/clusters returned status ${res.status}.`);
      return [];
    }

    return await res.json();
  } catch (error) {
    console.warn("API getClusters error:", error);
    return [];
  }
}

/**
 * POST /catalog/clusters
 * Create a new Cluster
 */
export async function createCluster(payload: { name: string; slug: string; description?: string }): Promise<Cluster> {
  const res = await fetch(`${BACKEND_URL}/catalog/clusters`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || "Failed to create cluster");
  }

  return await res.json();
}

/**
 * Fetch all topics
 */
export async function getTopics(): Promise<Topic[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/catalog/topics`, {
      cache: "no-store",
    });

    if (!res.ok) {
      console.warn(`GET /catalog/topics returned status ${res.status}.`);
      return [];
    }

    return await res.json();
  } catch (error) {
    console.warn("API getTopics error:", error);
    return [];
  }
}

/**
 * Fetch all technologies
 */
export async function getTechnologies(): Promise<Technology[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/catalog/technologies`, {
      cache: "no-store",
    });

    if (!res.ok) {
      console.warn(`GET /catalog/technologies returned status ${res.status}.`);
      return [];
    }

    return await res.json();
  } catch (error) {
    console.warn("API getTechnologies error:", error);
    return [];
  }
}

/**
 * POST /catalog/topics
 * Create a new Topic
 */
export async function createTopic(payload: { clusterId: number; name: string; slug: string; isActive?: boolean }): Promise<Topic> {
  const res = await fetch(`${BACKEND_URL}/catalog/topics`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || "Failed to create topic");
  }

  return await res.json();
}

/**
 * POST /catalog/technologies
 * Create a new Technology
 */
export async function createTechnology(payload: { name: string; slug: string; isActive?: boolean }): Promise<Technology> {
  const res = await fetch(`${BACKEND_URL}/catalog/technologies`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || "Failed to create technology");
  }

  return await res.json();
}

function getAuthHeader(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * POST /catalog/programs
 * Create a new catalog program with pricings, topics, and technologies
 */
export async function createProgram(payload: any) {
  const res = await fetch(`${BACKEND_URL}/catalog/programs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || "Failed to create program");
  }

  return await res.json();
}

/**
 * PATCH /catalog/programs/:id
 * Update an existing catalog program with pricings, topics, technologies, projects, etc.
 */
export async function updateProgram(id: number, payload: any) {
  const res = await fetch(`${BACKEND_URL}/catalog/programs/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || "Failed to update program");
  }

  return await res.json();
}

/**
 * DELETE /catalog/programs/:id
 * Delete a catalog program by ID
 */
export async function deleteProgram(id: number) {
  const res = await fetch(`${BACKEND_URL}/catalog/programs/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || "Failed to delete program");
  }

  return await res.json();
}
