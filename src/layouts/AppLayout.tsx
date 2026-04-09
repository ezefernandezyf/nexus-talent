import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { Footer } from "../components/ui/Footer";
import { MobileDrawer } from "../components/ui/MobileDrawer";
import { MobileMenuButton } from "../components/ui/MobileMenuButton";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const sessionLabel = status === AUTH_STATUS.AUTHENTICATED ? user?.email ?? "Sesión activa" : status === AUTH_STATUS.LOADING ? "Verificando acceso" : "Modo público";

  const mobileActions =
    status === AUTH_STATUS.AUTHENTICATED ? (
      <div className="space-y-3">
        <div className="rounded-2xl bg-surface-container-lowest/50 px-4 py-3 text-sm leading-6 text-on-surface-variant">{sessionLabel}</div>
        <div onClick={() => setIsMobileMenuOpen(false)}>
          <LogoutButton className="w-full justify-center" />
        </div>
      </div>
    ) : status === AUTH_STATUS.LOADING ? (
      <div className="rounded-2xl bg-surface-container-lowest/50 px-4 py-3 text-sm leading-6 text-on-surface-variant">Verificando acceso</div>
    ) : (
      <div className="space-y-3">
        <Link className="secondary-button w-full justify-center" to="/auth/sign-in" onClick={() => setIsMobileMenuOpen(false)}>
          Iniciar sesión
        </Link>
        <div className="rounded-2xl bg-surface-container-lowest/50 px-4 py-3 text-sm leading-6 text-on-surface-variant">Modo público activo</div>
      </div>
    );

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
        <header className="surface-panel fixed left-4 right-4 top-4 z-30 flex items-center justify-between gap-4 px-5 py-4 sm:left-6 sm:right-6 lg:left-8 lg:right-8">
          <div className="flex min-w-0 items-center gap-4">
            <Link className="text-xl font-semibold tracking-[-0.03em] text-white transition-opacity hover:opacity-90 sm:text-2xl" to="/app/analysis">
              Nexus Talent
            </Link>
            <div className="hidden items-center gap-8 md:flex" aria-label="App primary navigation">
              {appNavItems.map((item) => (
                <NavLink key={item.to} className={getNavLinkClassName} to={item.to}>
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <MobileMenuButton isOpen={isMobileMenuOpen} onClick={() => setIsMobileMenuOpen((current) => !current)} />
            <div className="hidden items-center gap-3 lg:flex">
              <span className="rounded-full bg-surface-container-high px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-on-surface-variant">{sessionLabel}</span>
              {status === AUTH_STATUS.AUTHENTICATED ? (
                <LogoutButton />
              ) : (
                <Link className="secondary-button" to="/auth/sign-in">
                  Iniciar sesión
                </Link>
              )}
            </div>
          </div>
        </header>

        <div className="flex flex-1 gap-6 pt-24 lg:pt-28">
          <aside className="surface-panel sticky top-24 hidden h-[calc(100vh-7rem)] w-64 flex-col gap-5 p-5 lg:flex">
            <div className="space-y-1 px-2">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-white/80">Mis Postulaciones</h2>
              <p className="text-[10px] uppercase tracking-[0.28em] text-on-surface-variant">Historial reciente</p>
            </div>

            <Link className="primary-button justify-center text-center" to="/app/analysis">
              Nuevo análisis
            </Link>

            <div className="flex flex-1 flex-col gap-2 overflow-y-auto pr-1">
              {appNavItems.map((item, index) => (
                <NavLink key={item.to} className={getNavLinkClassName} to={item.to}>
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container-lowest text-xs font-semibold text-primary">
                    {index + 1}
                  </span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>

            <div className="mt-auto rounded-2xl bg-surface-container-lowest/50 px-4 py-3 text-sm leading-6 text-on-surface-variant">
              {status === AUTH_STATUS.AUTHENTICATED ? "Historial local habilitado" : "Modo público activo"}
            </div>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col gap-6">
            <Outlet />
          </div>
        </div>

        <Footer />
      </div>

      <MobileDrawer actions={mobileActions} heading="Nexus Talent" isOpen={isMobileMenuOpen} items={appNavItems} onClose={() => setIsMobileMenuOpen(false)} />
    </main>
  );
}
