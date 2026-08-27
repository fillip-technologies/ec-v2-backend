import { BACKEND_URL } from "@/config/api";

// In-flight refresh promise to coordinate concurrent requests (Mutex Queue)
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

// Multi-tab coordination channel
let authChannel: BroadcastChannel | null = null;
if (typeof window !== "undefined" && "BroadcastChannel" in window) {
  try {
    authChannel = new BroadcastChannel("engineers_clinic_auth_sync");
    authChannel.onmessage = (event) => {
      if (event.data?.type === "TOKEN_REFRESHED" && event.data?.token) {
        localStorage.setItem("token", event.data.token);
        if (event.data.refreshToken) {
          localStorage.setItem("refreshToken", event.data.refreshToken);
        }
        if (event.data.user) {
          localStorage.setItem("user", JSON.stringify(event.data.user));
        }
        window.dispatchEvent(
          new CustomEvent("auth:token_refreshed", {
            detail: { token: event.data.token, user: event.data.user },
          })
        );
      } else if (event.data?.type === "LOGOUT") {
        handleAutomaticLogout("Multi-tab logout event received", false);
      }
    };
  } catch (e) {
    console.warn("[FRONTEND-AUTH-MIDDLEWARE] BroadcastChannel not supported or failed to initialize:", e);
  }
}

/**
 * Base64URL safe JWT decoder
 */
export function decodeJwtPayload(token: string | null): any {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }
    const binaryStr = atob(base64);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    const decoded = new TextDecoder().decode(bytes);
    return JSON.parse(decoded);
  } catch (e) {
    console.warn("[FRONTEND-AUTH-MIDDLEWARE] ⚠️ Failed to decode JWT payload:", e);
    return null;
  }
}

/**
 * Checks if a JWT token is expired or about to expire within bufferSeconds.
 */
export function isTokenExpired(token: string | null, bufferSeconds = 30): boolean {
  if (!token) return true;
  const payload = decodeJwtPayload(token);
  if (!payload || !payload.exp) {
    return false;
  }
  const currentTime = Math.floor(Date.now() / 1000);
  const remainingSeconds = payload.exp - currentTime;
  const isExp = remainingSeconds <= bufferSeconds;
  return isExp;
}

/**
 * Mutexed token refresh function
 */
export async function getOrRefreshToken(force = false): Promise<string | null> {
  if (typeof window === "undefined") return null;

  const currentToken = localStorage.getItem("token");

  // If token is still fresh and not forcing refresh, return current token
  if (!force && currentToken && !isTokenExpired(currentToken, 30)) {
    return currentToken;
  }

  // If another request is currently refreshing the token, wait for it
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;

  refreshPromise = (async () => {
    try {
      const storedRefreshToken = localStorage.getItem("refreshToken");

      const res = await fetch(`${BACKEND_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Forward HttpOnly refreshToken cookie
        body: JSON.stringify({ refreshToken: storedRefreshToken }),
      });


      if (res.status === 401) {
        console.error("[FRONTEND-AUTH-MIDDLEWARE] ❌ Server rejected refresh token with 401 Unauthorized!");
        handleAutomaticLogout("POST /auth/refresh returned 401 Unauthorized");
        return null;
      }

      if (!res.ok) {
        return null;
      }

      const data = await res.json();
      const newAccessToken = data.accessToken;

      if (newAccessToken) {
        localStorage.setItem("token", newAccessToken);
        if (data.refreshToken) {
          localStorage.setItem("refreshToken", data.refreshToken);
        }
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }

        // Broadcast to other tabs
        if (authChannel) {
          authChannel.postMessage({
            type: "TOKEN_REFRESHED",
            token: newAccessToken,
            refreshToken: data.refreshToken,
            user: data.user,
          });
        }

        // Dispatch local event
        window.dispatchEvent(
          new CustomEvent("auth:token_refreshed", {
            detail: { token: newAccessToken, user: data.user },
          })
        );

        return newAccessToken;
      } else {
        handleAutomaticLogout("No accessToken in refresh response");
        return null;
      }
    } catch (err) {
      console.warn("[FRONTEND-AUTH-MIDDLEWARE] ⚠️ Network error during token refresh (transient):", err);
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export const refreshTokenSilently = () => getOrRefreshToken(true);

/**
 * Universal Request Interceptor & Middleware:
 * 1. Pre-flight check: If access token is expired or about to expire, pauses the request,
 *    refreshes the token first, and attaches the new token.
 * 2. Post-flight check: If the server responds with 401, pauses, force-refreshes the token,
 *    and retries the original request seamlessly.
 */
export async function apiClient(path: string, options: RequestInit = {}): Promise<Response> {
  const url = path.startsWith("http") ? path : `${BACKEND_URL}${path}`;
  const isAuthEndpoint = path.includes("/auth/login") || path.includes("/auth/register") || path.includes("/auth/refresh");

  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  // --- PRE-FLIGHT INTERCEPTOR ---
  if (!isAuthEndpoint && typeof window !== "undefined") {
    let token = localStorage.getItem("token");
    const hasRefreshToken = !!localStorage.getItem("refreshToken");


    // If access token is expired (or close to expiring in 30s) and a session exists, refresh before sending
    if ((hasRefreshToken || token) && isTokenExpired(token, 30)) {
      const freshToken = await getOrRefreshToken();
      if (freshToken) {
        token = freshToken;
      }
    }

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const fetchOptions: RequestInit = {
    ...options,
    headers,
    credentials: "include",
  };

  // --- EXECUTE REQUEST ---
  let response = await fetch(url, fetchOptions);

  // --- POST-FLIGHT 401 INTERCEPTOR ---
  if (response.status === 401 && !isAuthEndpoint && typeof window !== "undefined") {
    console.warn(`[FRONTEND-AUTH-MIDDLEWARE] ⚠️ Got 401 from ${path}. Executing post-flight forced token refresh...`);
    const freshToken = await getOrRefreshToken(true);

    if (freshToken) {
      const retryHeaders = new Headers(options.headers || {});
      if (!retryHeaders.has("Content-Type")) {
        retryHeaders.set("Content-Type", "application/json");
      }
      retryHeaders.set("Authorization", `Bearer ${freshToken}`);

      response = await fetch(url, {
        ...options,
        headers: retryHeaders,
        credentials: "include",
      });
    }
  }

  return response;
}

export function handleAutomaticLogout(reason = "Unknown", broadcast = true) {
  console.error(`[FRONTEND-AUTH-MIDDLEWARE] 🚪 handleAutomaticLogout triggered! Reason: "${reason}"`);
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("activeRole");

    if (broadcast && authChannel) {
      authChannel.postMessage({ type: "LOGOUT" });
    }

    window.dispatchEvent(new CustomEvent("auth:logout"));

    if (window.location.pathname !== "/login" && !window.location.pathname.startsWith("/signup")) {
      console.warn(`[FRONTEND-AUTH-MIDDLEWARE] Redirecting to /login?session_expired=true due to logout.`);
      window.location.href = "/login?session_expired=true";
    }
  }
}
