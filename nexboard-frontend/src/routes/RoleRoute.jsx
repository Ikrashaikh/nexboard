import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ForbiddenPage from '../pages/errors/ForbiddenPage';

/**
 * Renders children if user's role is in allowedRoles, else renders ForbiddenPage or redirects to /login.
 */
export default function RoleRoute({ allowedRoles, children }) {
  const { auth } = useAuth();
  if (!auth) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(auth.role)) {
    return <ForbiddenPage />;
  }
  return children;
}
