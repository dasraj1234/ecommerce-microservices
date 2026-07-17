// Centralized HTTP client for talking to the backend services.
//
// Components call RELATIVE paths only (e.g. "/auth/login", "/orders/create").
// In dev, the Vite proxy (vite.config.js) forwards each prefix to the right
// service port; in prod the gateway/reverse-proxy does the same. So BASE_URL is
// empty (same-origin) by default. Set VITE_API_URL only to bypass the proxy and
// hit a single backend origin directly.
const BASE_URL = import.meta.env.VITE_API_URL || "";

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
    // Network-level failure (server down, CORS blocked, proxy misconfigured…).
    throw new Error("Cannot reach the server. Is the backend running?");
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

/**
 * Normalize a response body across services.
 *
 * Product/Order endpoints wrap their payload in an ApiResponse envelope
 * ({ success, message, data }); Payment and Auth return the raw object/array.
 * `unwrap` returns the inner `data` when the envelope is present, and the body
 * unchanged otherwise — so callers never have to special-case per service.
 *
 * Note: apiRequest already throws on non-2xx, so unwrap only ever sees a
 * successful body.
 */
export function unwrap(body) {
  if (
    body &&
    typeof body === "object" &&
    !Array.isArray(body) &&
    "success" in body &&
    "data" in body
  ) {
    return body.data;
  }
  return body;
}
