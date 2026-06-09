import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthStatusScreen } from "./AuthStatusScreen";
import { AUTH_STATUS, useAuth } from "../hooks/useAuth";

export function AdminRoute() {
  const location = useLocation();
  const { isAdmin, status } = useAuth();

  if (status === AUTH_STATUS.LOADING) {
    return <AuthStatusScreen message="Estamos confirmando tus permisos de administración antes de abrir el panel." title="Verificando permisos" />;
  }

  if (status !== AUTH_STATUS.AUTHENTICATED) {
    return <Navigate replace state={{ from: location.pathname }} to="/auth/sign-in" />;
  }

  if (!isAdmin) {
    return <Navigate replace to="/app" />;
  }

  return <Outlet />;
}
