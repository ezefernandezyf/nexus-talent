import { useEffect } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { Card } from "@/shared/components/Card";
import { AUTH_STATUS } from "@/features/auth/store/auth-status";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useSession } from "@/features/auth/api/useSession";

function getCallbackErrorMessage(searchParams: URLSearchParams) {
  const queryError = searchParams.get("error_description") ?? searchParams.get("error");

  return queryError?.trim() || "No pudimos completar el acceso social.";
}

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const { status } = useAuth();
  const { refetch } = useSession();

  useEffect(() => {
    const hasError = searchParams.get("error_description") ?? searchParams.get("error");

    // Only try to restore session when there's no OAuth error
    if (!hasError) {
      refetch();
    }
  }, [refetch, searchParams]);

  if (status === AUTH_STATUS.AUTHENTICATED) {
    return <Navigate replace to="/app/analysis" />;
  }

  const callbackErrorMessage = getCallbackErrorMessage(searchParams);

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
