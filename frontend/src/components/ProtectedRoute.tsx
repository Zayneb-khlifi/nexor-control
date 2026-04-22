// src/components/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

// Routes publiques qui ne nécessitent pas d'authentification
const PUBLIC_ROUTES = ["/login", "/register", "/404", "/500"];

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user } = useAuth();
  const token = localStorage.getItem("token");
  const location = useLocation();

  // Si on est sur une route publique, on laisse passer
  if (PUBLIC_ROUTES.includes(location.pathname)) {
    return <Outlet />;
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};