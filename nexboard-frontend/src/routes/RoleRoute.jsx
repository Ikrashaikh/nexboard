import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Renders children if user's role is in allowedRoles, else redirects.
 */
export default function RoleRoute({ allowedRoles, children }) {
  const { auth } = useAuth();
  if (!auth) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(auth.role)) {
    return <Navigate to="/403" replace />;
  }
  return children;
}
