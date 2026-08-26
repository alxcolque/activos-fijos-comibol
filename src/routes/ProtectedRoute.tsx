import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export interface ProtectedRouteProps {
  children?: React.ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, token, checkAuth, user } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    if (token && !isAuthenticated) {
      checkAuth();
    }
  }, [token, isAuthenticated, checkAuth]);

  if (!token || !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const role = user?.role || 'admin';

  // Verificar restricciones por ruta
  const path = location.pathname.toLowerCase();
  if (path.includes('/usuarios') && role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  if (path.includes('/configuracion') && role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  if ((path.includes('/categorias') || path.includes('/estados') || path.includes('/ubicaciones')) && role === 'guest') {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
