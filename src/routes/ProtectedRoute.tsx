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

  const role = user?.role || 'operador';

  // Verificar restricciones por ruta para Operador y Guest
  const path = location.pathname.toLowerCase();
  if ((path.includes('/usuarios') || path.includes('/configuracion')) && role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // Restricciones para rol Guest (Solo lectura de Panel, Activos y Proyectos)
  if (role === 'guest') {
    if (path.includes('/activos/nuevo') || path.includes('/editar')) {
      return <Navigate to="/" replace />;
    }

    const isAllowedForGuest =
      path === '/' ||
      path === '/activos' ||
      path.startsWith('/activos/') ||
      path === '/proyectos' ||
      path.startsWith('/proyectos/');

    if (!isAllowedForGuest) {
      return <Navigate to="/" replace />;
    }
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
