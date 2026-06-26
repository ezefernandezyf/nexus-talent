import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/shared/components/Card";
import { useAuth } from "@/features/auth/hooks/useAuth";

const AUTH_SHELL_COPY = {
  "sign-in": {
    actionHref: "/auth/sign-up",
    actionLabel: "Crear cuenta",
    actionPrompt: "¿No tenés acceso todavía?",
    eyebrow: "Acceso privado",
    heading: "Volvé al panel seguro y seguí con tu flujo.",
    stats: ["Rutas protegidas", "Sesión con JWT", "Historial sincronizado"],
    title: "Iniciá sesión",
  },
  "sign-up": {
    actionHref: "/auth/sign-in",
    actionLabel: "Iniciar sesión",
    actionPrompt: "¿Ya tenés una cuenta?",
    eyebrow: "Nuevo acceso",
    heading: "Creá tu acceso y empezá con sesión segura desde el primer día.",
    stats: ["Email/password", "Sesión con JWT", "Sin migración de historia"],
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
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-surface-container-lowest text-on-surface">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 18% 18%, color-mix(in oklch, var(--color-primary) 14%, transparent), transparent 28%), radial-gradient(circle at 82% 14%, color-mix(in oklch, var(--color-accent) 10%, transparent), transparent 22%), radial-gradient(circle at 50% 100%, color-mix(in oklch, var(--color-primary-container) 8%, transparent), transparent 28%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-35"
        style={{
          backgroundImage:
            "linear-gradient(color-mix(in oklch, var(--color-primary) 3%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in oklch, var(--color-primary) 3%, transparent) 1px, transparent 1px)",
          backgroundSize: "84px 84px",
          maskImage:
            "linear-gradient(180deg, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.18) 58%, transparent)",
        }}
      />

      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 sm:px-8">
        <div className="text-xl font-bold tracking-tighter text-on-surface font-headline">Nexus Talent</div>
      </header>

      <div className="relative z-10 flex flex-1 items-center justify-center px-6 pb-24 pt-4 sm:px-8">
        <div className="w-full max-w-md">
          <Card className="glass-panel ghost-border rounded-xl p-8 shadow-2xl sm:p-10">
            <div className="mb-10 text-center">
              <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-on-surface font-headline">{copy.title}</h1>
            </div>

            <div className="space-y-6">
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

              <div>{children}</div>

              <div className="pt-2 text-center">
                <p className="text-sm leading-6 text-on-surface-variant">
                  {copy.actionPrompt}{" "}
                  <Link className="text-primary hover:underline" to={copy.actionHref}>
                    {copy.actionLabel}
                  </Link>
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <footer className="relative z-10 mt-auto flex w-full flex-col items-center justify-between gap-4 border-t border-white/5 px-8 py-6 opacity-60 sm:flex-row">
        <div className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
          © 2026 Nexus Talent. Engineered for Precision.
        </div>
        <div className="flex gap-8">
          <a className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant transition-colors hover:text-primary" href="#">
            Privacy Policy
          </a>
          <a className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant transition-colors hover:text-primary" href="#">
            Terms
          </a>
          <a className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant transition-colors hover:text-primary" href="#">
            Support
          </a>
        </div>
      </footer>
    </main>
  );
}
