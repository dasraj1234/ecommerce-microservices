import { apiRequest } from "./client";

// auth-user-service endpoints.

/**
 * POST /auth/login
 * @param {{username: string, password: string}} credentials
 * @returns {Promise<{token: string, username: string, role: string}>}
 */
export function login(credentials) {
  return apiRequest("/auth/login", { method: "POST", body: credentials });
}

/**
 * POST /users/register
 * @param {{username: string, email: string, password: string}} payload
 * @returns created user
 */
export function register(payload) {
  return apiRequest("/users/register", { method: "POST", body: payload });
}
