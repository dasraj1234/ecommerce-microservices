import { apiRequest } from "./client";

// auth-user-service @ :8081, via Vite proxy.

// POST /auth/login
//   request : { username, password }
//   response: { token, username, role }
export function login({ username, password }) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: { username, password },
  });
}

// POST /users/register
//   request : { username, email, password }
//   response: created User { id, username, email, role, createdAt }
export function register({ username, email, password }) {
  return apiRequest("/users/register", {
    method: "POST",
    body: { username, email, password },
  });
}
