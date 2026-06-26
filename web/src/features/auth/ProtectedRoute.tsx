import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthStatusScreen } from "./components";
import { AUTH_STATUS } from "./store/auth-status";
import { useAuth } from "./hooks/useAuth";

export function ProtectedRoute() {
  const location = useLocation();
  const { status, user } = useAuth();

  if (status === AUTH_STATUS.LOADING || status === "unknown") {
    return <AuthStatusScreen message="Estamos validando tu sesión segura antes de abrir el panel privado." title="Verificando acceso" />;
  }

  if (status === AUTH_STATUS.ERROR) {
    return <AuthStatusScreen message="No pudimos validar tu sesión. Intentalo de nuevo." title="Error de acceso" />;
  }

  if (!user) {
    return <Navigate replace state={{ from: location.pathname }} to="/auth/sign-in" />;
  }

  return <Outlet />;
}
