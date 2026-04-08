import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { Button } from "./components/ui/Button";
import { Card } from "./components/ui/Card";
import { AnalysisFeature, useAnalysisHistory } from "./features/analysis";
import {
  AUTH_STATUS,
  AdminRoute,
  AuthShell,
  AuthStatusScreen,
  LogoutButton,
  ProtectedRoute,
  PublicAuthRoute,
  SignInForm,
  SignUpForm,
  useAuth,
} from "./features/auth";
import { formatHistoryCardDate, getHistoryCardTitle } from "./features/history/history-formatters";
import { SettingsFeature } from "./features/settings";

function AppLoadingState() {
  return <AuthStatusScreen message="Estamos verificando la sesión para decidir si abrimos el shell privado o la pantalla de acceso." title="Cargando acceso" />;
}

function RootRedirect() {
  const { status } = useAuth();

  if (status === AUTH_STATUS.LOADING) {
    return <AppLoadingState />;
  }

  return <Navigate replace to={status === AUTH_STATUS.AUTHENTICATED ? "/app" : "/auth/sign-in"} />;
}

function PrivateAppShell() {
  const { user } = useAuth();
  const history = useAnalysisHistory();

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
        <header className="flex items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div className="flex items-center gap-8">
            <span className="text-xl font-semibold tracking-[-0.03em] text-white sm:text-2xl">Nexus Talent</span>
            <nav className="hidden items-center gap-8 md:flex">
              <a className="border-b-2 border-primary pb-3 text-sm font-medium text-primary" href="#analysis">
                Análisis
              </a>
              <span className="pb-3 text-sm font-medium text-on-surface-variant">Panel</span>
              <span className="pb-3 text-sm font-medium text-on-surface-variant">Talento</span>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden rounded-full bg-surface-container-high px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-on-surface-variant sm:inline-flex">
              {user?.email ?? "Sesión activa"}
            </span>
            <LogoutButton />
          </div>
        </header>

        <div className="grid flex-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="surface-panel flex flex-col gap-5 p-5 sm:p-6">
            <div className="space-y-1">
              <p className="text-2xl font-semibold tracking-[-0.03em] text-white">Nexus Talent</p>
              <p className="text-xs uppercase tracking-[0.28em] text-on-surface-variant">Precision Recruiting</p>
            </div>

            <Button className="w-full justify-center" type="button" onClick={() => document.getElementById("analysis")?.scrollIntoView({ behavior: "smooth" })}>
              Nuevo análisis
            </Button>

            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-on-surface-variant">Mis postulaciones</p>
                <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">Historial reciente</p>
              </div>

              <div className="space-y-3">
                {history.isPending ? (
                  <div className="rounded-2xl bg-surface-container-lowest/50 p-4 text-sm text-on-surface-variant">Cargando historial...</div>
                ) : history.analyses.length > 0 ? (
                  history.analyses.slice(0, 3).map((analysis, index) => (
                    <div
                      key={analysis.id}
                      className={index === 0 ? "rounded-2xl bg-surface-container-high px-4 py-3" : "rounded-2xl bg-surface-container-lowest/60 px-4 py-3"}
                    >
                      <p className="truncate text-sm font-medium text-white">{getHistoryCardTitle(analysis)}</p>
                      <p className="mt-1 text-xs text-on-surface-variant">{formatHistoryCardDate(analysis.createdAt)}</p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl bg-surface-container-lowest/50 p-4 text-sm leading-6 text-on-surface-variant">
                    Las vacantes analizadas aparecerán acá cuando guardes la primera.
                  </div>
                )}
              </div>
            </div>

            <div className="mt-auto border-t border-white/5 pt-5">
              <nav className="space-y-3 text-sm text-on-surface-variant">
                <div className="flex items-center gap-3 rounded-2xl bg-surface-container-high px-4 py-3 text-on-surface">
                  <span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
                  <span>Análisis</span>
                </div>
                <div className="flex items-center gap-3 px-4 py-3">
                  <span className="h-2 w-2 rounded-full bg-surface-container-highest" aria-hidden="true" />
                  <span>Settings</span>
                </div>
                <div className="flex items-center gap-3 px-4 py-3">
                  <span className="h-2 w-2 rounded-full bg-surface-container-highest" aria-hidden="true" />
                  <span>Help</span>
                </div>
              </nav>
            </div>
          </aside>

          <div className="flex min-w-0 flex-col gap-6">
            <section className="flex flex-col gap-3 pt-2 sm:pt-4">
              <span className="label-chip w-fit">Frontera local de IA</span>
              <h1 className="max-w-4xl text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
                Nuevo Análisis de Reclutamiento
              </h1>
              <p className="max-w-3xl text-base leading-7 text-on-surface-variant sm:text-lg">
                Pegá una vacante completa y dejá que el sistema extraiga el resumen, la matriz de habilidades y el borrador de contacto.
              </p>
            </section>

            <AnalysisFeature />
            <Outlet />
          </div>
        </div>
      </div>
    </main>
  );
}

function PrivateAppHome() {
  return null;
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route element={<PublicAuthRoute />} path="/auth">
        <Route index element={<Navigate replace to="sign-in" />} />
        <Route
          path="sign-in"
          element={
            <AuthShell mode="sign-in">
              <SignInForm />
            </AuthShell>
          }
        />
        <Route
          path="sign-up"
          element={
            <AuthShell mode="sign-up">
              <SignUpForm />
            </AuthShell>
          }
        />
      </Route>
      <Route element={<ProtectedRoute />} path="/app">
        <Route element={<PrivateAppShell />}>
          <Route index element={<PrivateAppHome />} />
          <Route element={<AdminRoute />} path="admin">
            <Route path="settings" element={<SettingsFeature />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  );
}
