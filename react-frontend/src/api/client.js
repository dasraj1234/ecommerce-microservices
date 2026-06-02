// Centralized HTTP client for talking to the backend services.
// Base URL comes from VITE_API_URL (see .env); falls back to the
// auth-user-service dev port so it works out of the box.
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8083";

/**
 * Perform a JSON request against the backend.
 * Throws an Error whose message is the backend's `message` field when present.
 */
export async function apiRequest(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    // Network-level failure (server down, CORS blocked, etc.)
    throw new Error("Cannot reach the server. Is auth-user-service running?");
  }

  // Try to parse a JSON body (may be empty on some responses).
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      (data && data.message) || `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data;
}
