import { isRouteErrorResponse, Link, useRouteError } from "react-router-dom";
import { Button } from "@/shared/components/button/Button";

export interface RouteErrorFallbackProps {
  fallbackRoute?: string;
}

export function RouteErrorFallback({ fallbackRoute = "/" }: RouteErrorFallbackProps) {
  const error = useRouteError();

  let errorMessage = "Ha ocurrido un error inesperado.";
  let errorStatus = "Error";

  if (isRouteErrorResponse(error)) {
    errorStatus = String(error.status);
    errorMessage = error.data?.message ?? error.statusText ?? errorMessage;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div
      role="alert"
      className="flex min-h-[50vh] flex-col items-center justify-center gap-6 p-8 text-center"
    >
      <h2 className="font-display text-5xl font-black tracking-tight text-on-surface">
        {errorStatus}
      </h2>
      <p className="max-w-md text-lg leading-relaxed text-on-surface-variant">
        {errorMessage}
      </p>
      <div className="flex items-center gap-4">
        <Button variant="filled" onClick={handleRetry}>
          Reintentar
        </Button>
        <Link
          to={fallbackRoute}
          className="rounded-full px-6 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:text-on-surface"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
