import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { cn } from "@/shared/utils/cn";
import { Footer } from "@/shared/components/Footer";
import { MobileDrawer } from "@/shared/components/MobileDrawer";
import { MobileMenuButton } from "@/shared/components/MobileMenuButton";
import { LogoutButton, AUTH_STATUS, useAuth } from "@/features/auth";
import { ThemeProvider, useTheme } from "@/core/theme";

type AppNavItem = {
  label: string;
  requiresAuth?: boolean;
  to: string;
};

const appNavItems: AppNavItem[] = [
  { label: "Análisis", to: "/app/analysis" },
  { label: "Historial", to: "/app/history" },
  { label: "CV", to: "/app/cv", requiresAuth: true },
  { label: "Settings", to: "/app/settings", requiresAuth: true },
];

function getNavLinkClassName({ isActive }: { isActive: boolean }) {
  return cn(
    "rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200",
    isActive
      ? "bg-accent-muted text-accent"
      : "text-text-secondary hover:text-text-primary hover:bg-surface-muted",
  );
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
  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const isAuthenticated = status === AUTH_STATUS.AUTHENTICATED;
  const visibleNavItems = appNavItems.filter((item) => !item.requiresAuth || isAuthenticated);

  return (
    <div className="relative min-h-screen bg-background text-text-primary">
      <header className="sticky top-0 z-50 border-b border-border bg-surface/85 backdrop-blur-sm">
        <div className="container-editorial flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              className="font-display text-xl font-bold tracking-tight text-text-primary transition-opacity hover:opacity-90"
              to="/"
            >
              Nexus Talent
            </Link>
            <nav className="hidden items-center gap-1 md:flex" aria-label="App primary navigation">
              {visibleNavItems.map((item) => (
                <NavLink key={item.to} className={getNavLinkClassName} to={item.to}>
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-md font-medium select-none",
                "transition-all duration-200",
                "bg-[var(--accent)] text-white hover:opacity-90 active:scale-[0.98]",
                "h-9 px-4 text-sm",
                "hidden md:inline-flex",
              )}
              to="/app/analysis"
            >
              Nuevo análisis
            </Link>

            <MobileMenuButton isOpen={isMobileMenuOpen} onClick={() => setIsMobileMenuOpen((current) => !current)} />

            {!isAuthenticated ? (
              <Link
                className={cn(
                  "hidden rounded-md px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary hover:bg-surface-muted md:inline-flex",
                )}
                to="/auth/sign-in"
              >
                Iniciar sesión
              </Link>
            ) : (
              <div className="relative hidden md:block">
                <button
                  aria-controls="desktop-account-menu"
                  aria-expanded={isDesktopMenuOpen}
                  aria-haspopup="menu"
                  aria-label={isDesktopMenuOpen ? "Cerrar acciones de cuenta" : "Abrir acciones de cuenta"}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary hover:bg-surface-muted"
                  type="button"
                  onClick={() => setIsDesktopMenuOpen((current) => !current)}
                >
                  <span className="max-w-32 truncate">{user?.email ?? "Cuenta"}</span>
                  <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                    expand_more
                  </span>
                </button>

                {isDesktopMenuOpen ? (
                  <div
                    aria-label="Acciones de cuenta"
                    className="absolute right-0 top-full mt-2 w-64 rounded-lg border border-border bg-surface p-2 shadow-lg [z-index:var(--z-dropdown)]"
                    id="desktop-account-menu"
                  >
                    <div className="rounded-md px-3 py-2 text-sm leading-6 text-text-secondary">
                      {user?.email ?? "Sesión activa"}
                    </div>
                    <div className="mt-1 space-y-1">
                      <Link
                        className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary hover:bg-surface-muted"
                        to="/app/settings"
                        onClick={() => setIsDesktopMenuOpen(false)}
                      >
                        Settings
                      </Link>
                      <div onClick={() => setIsDesktopMenuOpen(false)}>
                        <LogoutButton className="w-full justify-center" />
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            <button
              aria-label={theme === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
              className="hidden rounded-md p-2 text-text-secondary transition-colors hover:text-text-primary hover:bg-surface-muted md:inline-flex"
              type="button"
              onClick={toggleTheme}
            >
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                {theme === "dark" ? "light_mode" : "dark_mode"}
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="container-editorial py-12 md:py-16">
        <Outlet />
      </main>

      <Footer />

      <MobileDrawer
        actions={
          isAuthenticated ? (
            <div className="space-y-3">
              <div className="rounded-md px-4 py-3 text-sm leading-6 text-text-secondary">
                {user?.email ?? "Sesión activa"}
              </div>
              <div onClick={() => setIsMobileMenuOpen(false)}>
                <LogoutButton className="w-full justify-center" />
              </div>
            </div>
          ) : status === AUTH_STATUS.LOADING ? (
            <div className="rounded-md px-4 py-3 text-sm leading-6 text-text-secondary">
              Verificando acceso
            </div>
          ) : (
            <div className="space-y-3">
              <Link
                className="flex w-full items-center justify-center rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                to="/auth/sign-in"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Iniciar sesión
              </Link>
              <div className="rounded-md px-4 py-3 text-sm leading-6 text-text-secondary">
                Modo público activo
              </div>
            </div>
          )
        }
        heading="Nexus Talent"
        isOpen={isMobileMenuOpen}
        items={visibleNavItems}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </div>
  );
}
