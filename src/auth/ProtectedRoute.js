// src/auth/ProtectedRoute.js
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

/**
 * Guardia de rutas:
 * - Si se usa como wrapper con rutas anidadas -> renderiza <Outlet/>
 * - Si se usa envolviendo un elemento directamente -> renderiza {children}
 */
export default function ProtectedRoute({
  children,
  roles,
  redirectTo = "/authentication/sign-in",
}) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  console.log("[ProtectedRoute] path:", location.pathname, "isAuth:", isAuthenticated);

  // Evita parpadeo mientras se intenta restaurar sesión
  if (loading) return null;

  // Sin sesión => login
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  // Restricción por roles (opcional)
  if (Array.isArray(roles) && roles.length > 0) {
    const ok = user && roles.includes(Number(user.rolId));
    if (!ok) return <Navigate to="/unauthorized" replace />;
  }

  // Uso flexible: children directo o rutas anidadas con Outlet
  return children ? <>{children}</> : <Outlet />;
}
