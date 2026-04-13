import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { Footer } from "../components/ui/Footer";
import { MobileDrawer } from "../components/ui/MobileDrawer";
import { MobileMenuButton } from "../components/ui/MobileMenuButton";
import { LogoutButton, AUTH_STATUS, useAuth } from "../features/auth";
import { useAnalysisHistory } from "../features/analysis";
import { ThemeProvider, useTheme } from "../lib/theme";

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
  return (
    <ThemeProvider>
      <AppLayoutContent />
    </ThemeProvider>
  );
}

function AppLayoutContent() {
  const { status, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const history = useAnalysisHistory();
  const sessionLabel = status === AUTH_STATUS.AUTHENTICATED ? user?.email ?? "Sesión activa" : status === AUTH_STATUS.LOADING ? "Verificando acceso" : "Modo público";
  const recentAnalyses = history.analyses.slice(0, 3);

  const mobileDrawerActions =
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

      <div className="relative mx-auto flex min-h-screen w-full flex-col gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <header className="fixed left-0 top-0 z-30 flex h-16 w-full items-center justify-between bg-surface-container-low px-6">
          <div className="flex items-center gap-8">
            <Link className="text-xl font-bold tracking-tight text-on-surface transition-opacity hover:opacity-90" to="/app">
              Nexus Talent
            </Link>
            <div className="hidden items-center gap-6 md:flex" aria-label="App primary navigation">
              {appNavItems.map((item) => (
                <NavLink key={item.to} className={getNavLinkClassName} to={item.to}>
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <MobileMenuButton isOpen={isMobileMenuOpen} onClick={() => setIsMobileMenuOpen((current) => !current)} />
            {status !== AUTH_STATUS.AUTHENTICATED ? (
              <Link className="secondary-button hidden md:inline-flex" to="/auth/sign-in">
                Iniciar sesión
              </Link>
            ) : null}
            <div className="hidden items-center gap-4 md:flex">
              {status === AUTH_STATUS.AUTHENTICATED ? (
                <span className="text-sm font-medium text-on-surface-variant">{user?.email}</span>
              ) : null}
              <button
                aria-label={theme === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
                className="material-symbols-outlined rounded-full p-2 text-on-surface-variant transition-colors hover:text-primary"
                type="button"
                onClick={toggleTheme}
              >
                {theme === "dark" ? "light_mode" : "dark_mode"}
              </button>
            </div>
          </div>
        </header>

        <div className="flex flex-1 gap-6 pt-16">
          <aside className="fixed left-0 top-16 hidden h-[calc(100vh-64px)] w-64 flex-col gap-5 bg-surface-container-lowest p-4 lg:flex">
            <div className="mb-4 px-2">
              <h2 className="mb-1 text-sm font-semibold uppercase tracking-widest text-on-surface opacity-50">Mis Postulaciones</h2>
              <p className="text-[10px] uppercase tracking-[0.28em] text-on-surface/40">Historial Reciente</p>
            </div>

            <Link className="primary-button mb-2 justify-center text-center" to="/app/analysis">
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                add
              </span>
              NUEVO ANÁLISIS
            </Link>

            <div className="custom-scrollbar flex flex-1 flex-col gap-2 overflow-y-auto pr-2">
              {recentAnalyses.length > 0 ? (
                recentAnalyses.map((analysis) => (
                  <div key={analysis.id} className="rounded-lg bg-surface-container-low/40 p-3 text-on-surface-variant transition-colors hover:bg-surface-container">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-sm" aria-hidden="true">
                        history
                      </span>
                      <span className="truncate font-label text-xs">{analysis.jobDescription.split(/\r?\n/).find(Boolean) ?? "Vacante sin título"}</span>
                    </div>
                    <p className="ml-7 mt-1 text-[10px] text-on-surface/40">{new Date(analysis.createdAt).toLocaleDateString("es-AR", { day: "2-digit", month: "short" })}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-lg bg-surface-container-low/40 p-3 text-sm leading-6 text-on-surface-variant">
                  Aún no hay análisis guardados.
                </div>
              )}
            </div>

            <div className="mt-auto space-y-1 border-t border-outline-variant/15 pt-4">
              {appNavItems.map((item) => (
                <NavLink key={item.to} className={getNavLinkClassName} to={item.to}>
                  {item.label}
                </NavLink>
              ))}
            </div>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col gap-6 lg:ml-64">
            <Outlet />
          </div>
        </div>

        <Footer />
      </div>

      <MobileDrawer actions={mobileDrawerActions} heading="Nexus Talent" isOpen={isMobileMenuOpen} items={appNavItems} onClose={() => setIsMobileMenuOpen(false)} />
    </main>
  );
}
