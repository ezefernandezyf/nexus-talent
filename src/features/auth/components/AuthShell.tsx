import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Card } from "../../../components/ui/Card";
import { useAuth } from "../hooks/useAuth";

const AUTH_SHELL_COPY = {
  "sign-in": {
    actionHref: "/auth/sign-up",
    actionLabel: "Crear cuenta",
    actionPrompt: "¿No tenés acceso todavía?",
    eyebrow: "Acceso privado",
    heading: "Volvé al panel seguro y seguí con tu flujo.",
    kicker: "Sesión persistente",
    stats: ["Rutas protegidas", "Estado persistente", "Historial local intacto"],
    subtitle:
      "La sesión se valida contra Supabase y el shell privado queda aislado. El historial local no se migra en esta fase.",
    title: "Iniciá sesión",
  },
  "sign-up": {
    actionHref: "/auth/sign-in",
    actionLabel: "Iniciar sesión",
    actionPrompt: "¿Ya tenés una cuenta?",
    eyebrow: "Nuevo acceso",
    heading: "Creá tu acceso y empezá con sesión segura desde el primer día.",
    kicker: "Alta incremental",
    stats: ["Email/password", "RLS mínima", "Sin migración de historia"],
    subtitle:
      "Registrá tu cuenta con Supabase Auth y mantené separado el historial local hasta que la migración esté lista.",
    title: "Crear cuenta",
  },
} as const;

type AuthShellMode = keyof typeof AUTH_SHELL_COPY;

interface AuthShellProps {
  children: ReactNode;
  mode: AuthShellMode;
}

export function AuthShell({ children, mode }: AuthShellProps) {
  const copy = AUTH_SHELL_COPY[mode];
  const { errorMessage, isConfigured } = useAuth();

  return (
    <main className="relative min-h-screen overflow-hidden bg-surface-container-lowest text-on-surface">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 18% 18%, rgba(142, 213, 255, 0.12), transparent 28%), radial-gradient(circle at 82% 14%, rgba(56, 189, 248, 0.1), transparent 22%), radial-gradient(circle at 50% 100%, rgba(99, 102, 241, 0.08), transparent 28%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-35"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px)",
          backgroundSize: "84px 84px",
          maskImage:
            "linear-gradient(180deg, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.18) 58%, transparent)",
        }}
      />

      <div className="relative mx-auto grid min-h-screen w-full max-w-7xl gap-6 px-5 py-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:py-8">
        <Card className="flex flex-col justify-between gap-8 p-7 sm:p-8 lg:p-10">
          <div className="space-y-5">
            <span className="label-chip">{copy.eyebrow}</span>
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-on-surface-variant">{copy.kicker}</p>
              <h1 className="max-w-2xl text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
                {copy.heading}
              </h1>
              <p className="max-w-2xl text-base leading-7 text-on-surface-variant">{copy.subtitle}</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {copy.stats.map((stat) => (
              <div key={stat} className="ghost-frame rounded-2xl bg-surface-container-lowest/80 p-4">
                <p className="text-sm leading-6 text-on-surface-variant">{stat}</p>
              </div>
            ))}
          </div>

          <div className="ghost-frame rounded-3xl bg-surface-container-lowest/80 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-on-surface-variant">{copy.title}</p>
            <p className="mt-3 text-sm leading-7 text-on-surface-variant">
              El acceso queda cerrado por defecto si faltan variables de entorno o si la sesión no está validada.
            </p>
          </div>
        </Card>

        <Card className="flex flex-col gap-5 p-6 sm:p-8 lg:p-10">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <span className="label-chip">{copy.title}</span>
              <h2 className="max-w-lg text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">{copy.title}</h2>
            </div>
            <Link className="tech-chip shrink-0 text-primary" to={copy.actionHref}>
              {copy.actionLabel}
            </Link>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-on-surface-variant">{copy.actionPrompt}</p>
            <p className="text-base leading-7 text-on-surface-variant">
              Autenticación simple, sesión persistente y rutas privadas protegidas desde el primer render.
            </p>
          </div>

          {errorMessage ? (
            <div className="ghost-frame rounded-2xl bg-error/10 px-4 py-3 text-sm leading-6 text-error" role="alert">
              {errorMessage}
            </div>
          ) : null}

          {!isConfigured ? (
            <div className="ghost-frame rounded-2xl bg-warning/10 px-4 py-3 text-sm leading-6 text-warning" role="status">
              Faltan variables de entorno. La app se mantiene en modo público hasta que configures Supabase.
            </div>
          ) : null}

          <div className="flex-1">{children}</div>

          <p className="text-sm leading-6 text-on-surface-variant">
            {copy.actionPrompt} <Link className="text-primary hover:underline" to={copy.actionHref}>{copy.actionLabel}</Link>
          </p>
        </Card>
      </div>
    </main>
  );
}
