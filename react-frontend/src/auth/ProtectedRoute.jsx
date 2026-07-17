import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated, getRole, homeForRole } from "./session";

/**
 * Guards a route.
 * - Not logged in  -> redirect to /login (remembering where they wanted to go).
 * - Wrong role     -> redirect to their own dashboard.
 * - Otherwise      -> render the page.
 *
 * @param {string}  [role]    Required role for this route ("ADMIN" | "USER").
 * @param {ReactNode} children The page to protect.
 */
export default function ProtectedRoute({ role, children }) {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (role && getRole() !== role) {
    return <Navigate to={homeForRole(getRole())} replace />;
  }

  return children;
}
