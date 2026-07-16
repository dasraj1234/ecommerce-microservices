// Thin wrapper around localStorage for the logged-in session.
// Kept framework-free so both ProtectedRoute and the API client can import it
// without creating a circular dependency on React.

const SESSION_KEY = "session";
const USER_ID_KEY = "userId"; // business id, e.g. USER-1001 (see TASK R3 note)

export function setSession({ token, username, role }) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ token, username, role }));
}

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY)) || null;
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function getRole() {
  return getSession()?.role || null;
}

export function getUsername() {
  return getSession()?.username || null;
}

export function getToken() {
  return getSession()?.token || null;
}

// Business-level user id (USER-1001), separate from the auth session,
// since product-order and payment-wallet services key on this rather than
// the auth username until the mapping endpoint exists.
export function getUserId() {
  return localStorage.getItem(USER_ID_KEY) || "";
}

export function setUserId(id) {
  if (id) localStorage.setItem(USER_ID_KEY, id);
}

export function homeForRole(role) {
  return role === "ADMIN" ? "/admin/dashboard" : "/customer/home";
}

export function roleAreaPrefix(role) {
  return role === "ADMIN" ? "/admin" : "/customer";
}

export function logout() {
  clearSession();
}
