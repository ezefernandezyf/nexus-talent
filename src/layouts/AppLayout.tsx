import { Link, NavLink, Outlet } from "react-router-dom";
import { LogoutButton, AUTH_STATUS, useAuth } from "../features/auth";

const appNavItems = [
  { label: "Análisis", to: "/app/analysis" },
  { label: "Historial", to: "/app/history" },
  { label: "Settings", to: "/app/admin/settings" },
] as const;

function getNavLinkClassName({ isActive }: { isActive: boolean }) {
  return [
    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors",
    isActive ? "bg-surface-container-high text-white" : "text-on-surface-variant hover:bg-surface-container-high/60 hover:text-white",
  ].join(" ");
}

export function AppLayout() {
  const { status, user } = useAuth();
  const sessionLabel = status === AUTH_STATUS.AUTHENTICATED ? user?.email ?? "Sesión activa" : status === AUTH_STATUS.LOADING ? "Verificando acceso" : "Modo público";

  return (
    <main className="deep-space-shell relative min-h-screen overflow-hidden bg-surface-container-lowest text-on-surface">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px)",
          backgroundSize: "96px 96px",
          maskImage: "linear-gradient(180deg, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.15) 60%, transparent)",
        }}
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <header className="surface-panel flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-8">
            <Link className="text-xl font-semibold tracking-[-0.03em] text-white transition-opacity hover:opacity-90 sm:text-2xl" to="/app/analysis">
              Nexus Talent
            </Link>
            <nav className="hidden items-center gap-8 md:flex" aria-label="App primary navigation">
              {appNavItems.map((item) => (
                <NavLink key={item.to} className={getNavLinkClassName} to={item.to}>
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden rounded-full bg-surface-container-high px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-on-surface-variant sm:inline-flex">
              {sessionLabel}
            </span>
            {status === AUTH_STATUS.AUTHENTICATED ? (
              <LogoutButton />
            ) : (
              <Link className="secondary-button" to="/auth/sign-in">
                Iniciar sesión
              </Link>
            )}
          </div>
        </header>

        <div className="grid flex-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="surface-panel flex flex-col gap-5 p-5 sm:p-6">
            <div className="space-y-1">
              <p className="text-2xl font-semibold tracking-[-0.03em] text-white">Nexus Talent</p>
              <p className="text-xs uppercase tracking-[0.28em] text-on-surface-variant">Precision Recruiting</p>
            </div>

            <Link className="primary-button justify-center text-center" to="/app/analysis">
              Nuevo análisis
            </Link>

            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-on-surface-variant">Navegación</p>
                <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">Shell compartido</p>
              </div>

              <nav className="space-y-2 text-sm" aria-label="App secondary navigation">
                {appNavItems.map((item) => (
                  <NavLink key={item.to} className={getNavLinkClassName} to={item.to}>
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </div>

            <div className="mt-auto space-y-3 border-t border-white/5 pt-5">
              <div className="rounded-2xl bg-surface-container-lowest/50 px-4 py-3 text-sm leading-6 text-on-surface-variant">
                El mismo shell funciona para usuarios anónimos y autenticados; la persistencia cambia sólo en los servicios.
              </div>
              <div className="rounded-2xl bg-surface-container-lowest/50 px-4 py-3 text-sm leading-6 text-on-surface-variant">
                {status === AUTH_STATUS.AUTHENTICATED ? "Historial local habilitado" : "Modo público activo"}
              </div>
            </div>
          </aside>

          <div className="flex min-w-0 flex-col gap-6">
            <Outlet />
          </div>
        </div>
      </div>
    </main>
  );
}
