import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthStatusScreen } from "./components";
import { AUTH_STATUS } from "./hooks/useAuth";
import { useAuth } from "./hooks/useAuth";

export function ProtectedRoute() {
  const location = useLocation();
  const { status } = useAuth();

  if (status === AUTH_STATUS.LOADING) {
    return <AuthStatusScreen message="Estamos validando tu sesión segura antes de abrir el panel privado." title="Verificando acceso" />;
  }

  if (status !== AUTH_STATUS.AUTHENTICATED) {
    return <Navigate replace state={{ from: location.pathname }} to="/auth/sign-in" />;
  }

  return <Outlet />;
}
