import { Navigate, Outlet } from "react-router-dom";
import { AuthStatusScreen } from "./components";
import { AUTH_STATUS, useAuth } from "./hooks/useAuth";

export function PublicAuthRoute() {
  const { status } = useAuth();

  if (status === AUTH_STATUS.LOADING) {
    return <AuthStatusScreen message="Estamos preparando el acceso seguro y validando la sesión existente." title="Preparando acceso" />;
  }

  if (status === AUTH_STATUS.AUTHENTICATED) {
    return <Navigate replace to="/app" />;
  }

  return <Outlet />;
}
