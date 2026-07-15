import { Navigate, useLocation } from "react-router-dom";
import { getRole } from "./session";

// Wraps a route element and only renders it if the logged-in user's role
// matches. Otherwise redirects to /login, remembering where the user was
// headed so Login can send them back after signing in.
export default function ProtectedRoute({ role, children }) {
  const location = useLocation();
  const currentRole = getRole();

  if (!currentRole) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (currentRole !== role) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
