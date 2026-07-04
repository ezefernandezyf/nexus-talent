import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";

// ---------------------------------------------------------------------------
// Copy — Editorial Precision preserves all existing text, adds accentWord
// ---------------------------------------------------------------------------

const AUTH_SHELL_COPY = {
  "sign-in": {
    actionHref: "/auth/sign-up",
    actionLabel: "Crear cuenta",
    actionPrompt: "¿No tenés acceso todavía?",
    eyebrow: "Acceso privado",
    heading: "Volvé al panel seguro y seguí con tu flujo.",
    stats: ["Rutas protegidas", "Sesión con JWT", "Historial sincronizado"],
    title: "Iniciá sesión",
    accentWord: "panel",
  },
  "sign-up": {
    actionHref: "/auth/sign-in",
    actionLabel: "Iniciar sesión",
    actionPrompt: "¿Ya tenés una cuenta?",
    eyebrow: "Nuevo acceso",
    heading: "Creá tu acceso y empezá con sesión segura desde el primer día.",
    stats: ["Email/password", "Sesión con JWT", "Sin migración de historia"],
    title: "Crear cuenta",
    accentWord: "acceso",
  },
} as const;

type AuthShellMode = keyof typeof AUTH_SHELL_COPY;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface AuthShellProps {
  children: ReactNode;
  mode: AuthShellMode;
}

// ---------------------------------------------------------------------------
// AuthShell — Editorial Precision split layout
// ---------------------------------------------------------------------------

export function AuthShell({ children, mode }: AuthShellProps) {
  const copy = AUTH_SHELL_COPY[mode];
  const { errorMessage, isConfigured } = useAuth();

  const parts = copy.heading.split(copy.accentWord);
  const [primaryStat, ...secondaryStats] = copy.stats;

  return (
    <div className="grid min-h-screen bg-[var(--color-surface-base)] lg:grid-cols-12">
      {/* ===== Left panel — Brand statement (5 cols) ===== */}
      <aside className="flex min-h-[40vh] flex-col justify-between bg-[var(--color-surface-elevated-2)] p-6 sm:p-10 lg:col-span-5 lg:min-h-screen lg:p-16">
        {/* Brand */}
        <Link
          to="/"
          className="font-display text-lg font-bold tracking-tight text-[var(--text-primary)] no-underline"
        >
          Nexus Talent
        </Link>

        {/* Editorial statement */}
        <div className="max-w-md">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--color-accent)]">
            {copy.eyebrow}
          </p>

          <h1 className="mt-3 font-display text-xl font-semibold leading-tight tracking-tighter sm:mt-6 sm:text-[clamp(1.75rem,2.5vw+0.5rem,2.5rem)] sm:font-bold lg:text-h1 lg:leading-[1.1]">
            {parts[0]}
            <span className="accent-underline">{copy.accentWord}</span>
            {parts[1]}
          </h1>

          {/* Stat block — desktop only */}
          <div className="mt-10 hidden border-l-2 border-[var(--color-accent)] pl-6 sm:mt-14 sm:block">
            <p className="font-display text-2xl font-black lg:text-3xl">
              {primaryStat}
            </p>
            {secondaryStats.length > 0 && (
              <p className="mt-2 max-w-xs text-sm text-[var(--color-on-surface-variant)]">
                {secondaryStats.join(" · ")}
              </p>
            )}
          </div>
        </div>

        {/* Copyright — desktop only */}
        <p className="hidden text-sm text-[var(--color-on-surface-variant)] sm:block">
          © 2026 Nexus Talent
        </p>
      </aside>

      {/* ===== Right panel — Auth form (7 cols) ===== */}
      <main className="flex items-center justify-center p-6 sm:p-8 lg:col-span-7 lg:p-12">
        <div className="w-full max-w-md">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--color-surface)] p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)] sm:p-10">
            {/* Title */}
            <h2 className="font-display text-h2">{copy.title}</h2>

            {/* Error message */}
            {errorMessage ? (
              <div
                className="mt-6 rounded-lg bg-[var(--color-error)]/10 px-4 py-3 text-sm leading-6 text-[var(--color-error)]"
                role="alert"
              >
                {errorMessage}
              </div>
            ) : null}

            {/* Setup warning */}
            {!isConfigured ? (
              <div
                className="mt-6 rounded-lg bg-[var(--color-warning)]/10 px-4 py-3 text-sm leading-6 text-[var(--color-warning)]"
                role="status"
              >
                Faltan variables de entorno. La app se mantiene en modo público
                hasta que configures Supabase.
              </div>
            ) : null}

            {/* Auth form */}
            <div
              className={
                errorMessage || !isConfigured ? "mt-6 space-y-5" : "mt-8 space-y-5"
              }
            >
              {children}
            </div>

            {/* Action link */}
            <div className="mt-8 border-t border-[var(--border)] pt-6 text-center">
              <p className="text-sm leading-6 text-[var(--color-on-surface-variant)]">
                {copy.actionPrompt}{" "}
                <Link
                  to={copy.actionHref}
                  className="font-medium text-[var(--color-accent)] no-underline hover:underline"
                >
                  {copy.actionLabel}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
