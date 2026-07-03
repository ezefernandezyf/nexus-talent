import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/shared/components/Card";
import { Footer } from "@/shared/components/Footer";
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
      {/* Ambient brand gradient — full canvas */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 deep-space-shell" />

      {/* Geometric diagonal pattern — replaces old dots grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-15"
        style={{
          backgroundImage: [
            "linear-gradient(135deg, var(--color-brand) 1px, transparent 1px)",
            "linear-gradient(45deg, var(--color-brand) 1px, transparent 1px)",
          ].join(", "),
          backgroundSize: "64px 64px",
          maskImage:
            "linear-gradient(180deg, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.18) 48%, transparent)",
        }}
      />

      {/* Header — back-to-home link */}
      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 sm:px-8">
        <Link
          className="text-xl font-bold tracking-tighter text-brand font-display"
          to="/"
        >
          Nexus Talent
        </Link>
      </header>

      {/* ===== Split layout ===== */}
      <div className="relative z-10 flex flex-1 flex-col lg:flex-row">

        {/* ---- Left panel — Visual identity ---- */}
        <aside className="relative flex flex-col justify-center overflow-hidden px-6 sm:px-8 lg:w-5/12 lg:px-12 lg:py-16">
          {/* Deeper brand gradient overlay — only visible on desktop */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 hidden lg:block"
            style={{
              background: [
                "radial-gradient(ellipse at 30% 20%, color-mix(in oklch, var(--color-brand) 35%, transparent) 0%, transparent 60%)",
                "radial-gradient(ellipse at 70% 80%, color-mix(in oklch, var(--color-brand) 20%, transparent) 0%, transparent 50%)",
              ].join(", "),
            }}
          />

          {/* Left-panel geometric overlay */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 hidden opacity-[0.06] lg:block"
            style={{
              backgroundImage:
                "linear-gradient(135deg, var(--color-brand) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />

          {/* Mobile — compact brand block */}
          <div className="mb-6 mt-4 lg:hidden">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-accent">
              {copy.eyebrow}
            </p>
            <h2 className="mt-2 text-xl font-semibold text-on-surface font-display">
              {copy.heading}
            </h2>
          </div>

          {/* Desktop — full visual panel */}
          <div className="hidden lg:block">
            {/* Eyebrow */}
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-accent">
              {copy.eyebrow}
            </p>

            {/* Hero heading — fluid via style to avoid Tailwind arbitrary-value parse issues */}
            <h1
              className="mt-4 font-bold leading-[1.1] tracking-tighter text-on-surface font-display"
              style={{ fontSize: "clamp(2.25rem, 3vw + 1rem, 3.5rem)" }}
            >
              {copy.heading}
            </h1>

            {/* Stats / value props — with check circles */}
            <ul className="mt-10 space-y-4">
              {copy.stats.map((stat) => (
                <li key={stat} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/15">
                    <svg
                      className="h-3 w-3 text-brand"
                      viewBox="0 0 12 12"
                      fill="none"
                      aria-hidden
                    >
                      <path
                        d="M2.5 6l2.5 2.5 4.5-5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span className="text-sm font-medium leading-snug text-on-surface-variant">
                    {stat}
                  </span>
                </li>
              ))}
            </ul>

            {/* Abstract geometric illustration — faceted apex diamond */}
            <div aria-hidden="true" className="mt-16 flex items-center justify-center">
              <div className="relative h-44 w-44">
                {/* Outer diamond — brand-to-accent gradient */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--color-brand) 0%, var(--color-accent) 100%)",
                    clipPath:
                      "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
                    opacity: 0.1,
                  }}
                />
                {/* Mid diamond — brand light */}
                <div
                  className="absolute inset-3"
                  style={{
                    background:
                      "linear-gradient(225deg, var(--color-brand) 0%, transparent 100%)",
                    clipPath:
                      "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
                    opacity: 0.18,
                  }}
                />
                {/* Inner apex — accent hint */}
                <div
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={{
                    width: "36px",
                    height: "36px",
                    background:
                      "linear-gradient(135deg, var(--color-accent) 0%, transparent 100%)",
                    clipPath:
                      "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
                    opacity: 0.35,
                  }}
                />
              </div>
            </div>
          </div>
        </aside>

        {/* ---- Right panel — Auth form ---- */}
        <div className="flex items-center justify-center px-6 pb-24 pt-2 sm:px-8 lg:w-7/12 lg:pt-4">
          <div className="w-full max-w-md">
            <Card variant="elevated" className="p-8 sm:p-10">
              {/* Title */}
              <div className="mb-10 text-center">
                <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-on-surface font-display">
                  {copy.title}
                </h1>
              </div>

              <div className="space-y-6">
                {/* Error message */}
                {errorMessage ? (
                  <div
                    className="rounded-2xl bg-error/10 px-4 py-3 text-sm leading-6 text-error"
                    role="alert"
                  >
                    {errorMessage}
                  </div>
                ) : null}

                {/* Setup warning */}
                {!isConfigured ? (
                  <div
                    className="rounded-2xl bg-warning/10 px-4 py-3 text-sm leading-6 text-warning"
                    role="status"
                  >
                    Faltan variables de entorno. La app se mantiene en modo
                    público hasta que configures Supabase.
                  </div>
                ) : null}

                {/* Auth form (SignInForm / SignUpForm) */}
                <div>{children}</div>

                {/* Action link */}
                <div className="pt-2 text-center">
                  <p className="text-sm leading-6 text-on-surface-variant">
                    {copy.actionPrompt}{" "}
                    <Link className="text-brand hover:underline" to={copy.actionHref}>
                      {copy.actionLabel}
                    </Link>
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <Footer variant="app" />
    </main>
  );
}
