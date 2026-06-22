import { Navigate, Outlet } from "react-router-dom";
import { AuthStatusScreen } from "./components";
import { AUTH_STATUS } from "./store/auth-status";
import { useAuth } from "./hooks/useAuth";

export function PublicAuthRoute() {
  const { status, user } = useAuth();

  if (status === AUTH_STATUS.LOADING || status === "unknown") {
    return <AuthStatusScreen message="Estamos preparando el acceso seguro y validando la sesión existente." title="Preparando acceso" />;
  }

  if (status === AUTH_STATUS.ERROR) {
    return <AuthStatusScreen message="No pudimos validar tu sesión. Intentalo de nuevo." title="Error de acceso" />;
  }

  if (user) {
    return <Navigate replace to="/app" />;
  }

  return <Outlet />;
}
