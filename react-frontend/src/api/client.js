import { getToken } from "../auth/session";

// VITE_API_URL is left unset in normal dev, so requests use relative paths
// and go through the Vite proxy defined in vite.config.js. Set it only to
// bypass the proxy and hit a single origin (e.g. an API gateway) directly.
const BASE_URL = import.meta.env.VITE_API_URL || "";

export async function apiRequest(path, { method = "GET", body } = {}) {
  const token = getToken();

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    const message = data?.message || data?.error || `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data;
}
