// Client-side session/auth helpers.
// The login token is a JWT (HS256) carrying { sub: username, role, userId, iat, exp }.
// We can't (and shouldn't) verify the signature in the browser, but we can
// read `exp` to know if the token is still valid. Real enforcement happens
// server-side: each service validates the JWT on its protected endpoints.

const TOKEN_KEY = "token";
const ROLE_KEY = "role";
const USERNAME_KEY = "username";
// Business id (e.g. USER-1001) the order/payment services key on.
const USER_ID_KEY = "userId";

export function setSession({ token, username, role, userId }) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USERNAME_KEY, username);
  localStorage.setItem(ROLE_KEY, role);
  // Also cached in localStorage as a fallback for tokens issued before the
  // userId claim existed; getUserId() prefers the signed claim when present.
  if (userId) localStorage.setItem(USER_ID_KEY, userId);
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USERNAME_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(USER_ID_KEY);
}

// Alias for clearSession(), kept because the Sidebar imports `logout`.
export function logout() {
  clearSession();
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

// Read the role from the SIGNED token claim, not from the separate `role`
// item (which a user could edit in DevTools). Falls back to the stored value
// only if the token has no role claim.
export function getRole() {
  const claims = decodeToken(getToken());
  if (claims && claims.role) return claims.role;
  return localStorage.getItem(ROLE_KEY);
}

export function getUsername() {
  return localStorage.getItem(USERNAME_KEY);
}

// Business id (USER-1001) used by the order/payment services.
//
// Read from the SIGNED token claim, same as getRole() — a user can't spoof
// it via DevTools. Falls back to the cached localStorage value only for
// older tokens issued before the userId claim existed (e.g. ADMIN accounts,
// which have no business id, never hit this at all).
export function getUserId() {
  const claims = decodeToken(getToken());
  if (claims && claims.userId) return claims.userId;
  return localStorage.getItem(USER_ID_KEY);
}

// Writes the localStorage fallback that getUserId() reads. Note this CANNOT
// override the signed userId claim — when the token carries one, getUserId()
// prefers it and whatever is set here is ignored. So this only has an effect
// for older tokens issued before the claim existed.
export function setUserId(id) {
  if (id) localStorage.setItem(USER_ID_KEY, id);
}

// Decode a JWT's payload (claims) without verifying the signature.
// Signature verification happens server-side; here we only read claims.
function decodeToken(token) {
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

// Returns the token's expiry time in ms (or null if it can't be read).
function getTokenExpiry(token) {
  const claims = decodeToken(token);
  return claims && claims.exp ? claims.exp * 1000 : null;
}

// True only if a non-expired token is present.
export function isAuthenticated() {
  const token = getToken();
  if (!token) return false;

  const expiry = getTokenExpiry(token);
  if (expiry && Date.now() >= expiry) {
    clearSession(); // token expired — clean up
    return false;
  }
  return true;
}

// Default landing page for a given role.
export function homeForRole(role) {
  return role === "ADMIN" ? "/admin/dashboard" : "/customer/home";
}

// Route prefix a given role is allowed to view. Used to decide whether a
// remembered "from" path is appropriate for the user who just logged in.
export function roleAreaPrefix(role) {
  return role === "ADMIN" ? "/admin" : "/customer";
}
