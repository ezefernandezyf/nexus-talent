import { Link, Navigate, useSearchParams } from "react-router-dom";
import { Card } from "../../../components/ui/Card";
import { AUTH_STATUS } from "../AuthProvider";
import { useAuth } from "../hooks/useAuth";

function getCallbackErrorMessage(searchParams: URLSearchParams, authErrorMessage: string | null) {
  const queryError = searchParams.get("error_description") ?? searchParams.get("error");

  return queryError?.trim() || authErrorMessage || "No pudimos completar el acceso social.";
}

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const { errorMessage, status } = useAuth();

  if (status === AUTH_STATUS.AUTHENTICATED) {
    return <Navigate replace to="/app" />;
  }

  const callbackErrorMessage = getCallbackErrorMessage(searchParams, errorMessage);

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-container-lowest px-5 py-8 text-on-surface">
      <Card className="flex w-full max-w-xl flex-col gap-4 p-6 sm:p-8">
        <span className="label-chip">Acceso social</span>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-[-0.02em] text-white sm:text-3xl">Estamos terminando de validar tu sesión</h1>
          <p className="text-sm leading-7 text-on-surface-variant">{callbackErrorMessage}</p>
        </div>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link className="primary-button" to="/auth/sign-in">
            Volver a ingresar
          </Link>
          <Link className="secondary-button" to="/auth/sign-up">
            Crear cuenta
          </Link>
        </div>
      </Card>
    </main>
  );
}