const rawBackendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000";

export const BACKEND_URL = rawBackendUrl.endsWith("/api/v1")
  ? rawBackendUrl
  : `${rawBackendUrl.replace(/\/+$/, "")}/api/v1`;
