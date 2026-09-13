import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import type { UserRole } from '../types';

interface RoleRouteProps {
  roles: UserRole[];
  children: React.ReactNode;
}

/** Protège une route par rôle. Redirige vers connexion si non-authentifié,
 *  ou vers le bon portail si le rôle ne correspond pas. */
export function RoleRoute({ roles, children }: RoleRouteProps) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/connexion" replace />;
  }

  if (!roles.includes(user.role)) {
    // Redirect to the correct portal based on actual role
    if (user.role === 'admin')    return <Navigate to="/admin/tableau-de-bord" replace />;
    if (user.role === 'supplier') return <Navigate to="/fournisseur/tableau-de-bord" replace />;
    return <Navigate to="/app/tableau-de-bord" replace />;
  }

  return <>{children}</>;
}
