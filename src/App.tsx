import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { AnalysisFeature } from "./features/analysis";
import { HistoryFeature } from "./features/history";
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
import { SettingsFeature } from "./features/settings";

const APP_BACKGROUND =
  "radial-gradient(circle at 12% 12%, rgba(142, 213, 255, 0.14), transparent 30%), radial-gradient(circle at 88% 18%, rgba(56, 189, 248, 0.12), transparent 24%), radial-gradient(circle at 50% 100%, rgba(99, 102, 241, 0.08), transparent 32%)";

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

  return (
    <main className="relative min-h-screen overflow-hidden bg-surface-container-lowest text-on-surface">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: APP_BACKGROUND }} />
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

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <span className="label-chip">Nexus Talent / Acceso privado</span>
            <h1 className="max-w-3xl font-sans text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl lg:text-6xl">
              Convertí una oferta laboral en bruto en un resumen estructurado y un mensaje de contacto que realmente puedas usar.
            </h1>
          </div>

          <div className="flex flex-col items-start gap-3 sm:items-end">
            <span className="label-chip">{user?.email ?? "Sesión activa"}</span>
            <LogoutButton />
          </div>
        </header>

        <Outlet />
      </div>
    </main>
  );
}

function PrivateAppHome() {
  return (
    <>
      <section className="grid flex-1 gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="surface-panel flex flex-col justify-between gap-8 p-7 sm:p-8">
          <div className="space-y-5">
            <span className="label-chip">Ingeniería editorial</span>
            <h2 className="max-w-xl text-2xl font-semibold tracking-[-0.02em] text-white sm:text-3xl">
              Una superficie de análisis enfocada y sin ruido visual.
            </h2>
            <p className="max-w-2xl text-base leading-7 text-on-surface-variant">
              Pegá una descripción del puesto, dejá que el analizador local extraiga las señales relevantes y después editá
              el borrador del mensaje antes de copiarlo. El historial local sigue separado hasta que la migración de auth esté lista.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="ghost-frame rounded-2xl bg-surface-container-lowest/80 p-4">
              <p className="label-chip">Entrada</p>
              <p className="mt-3 text-sm leading-6 text-on-surface-variant">Descripciones validadas con feedback instantáneo en línea.</p>
            </div>
            <div className="ghost-frame rounded-2xl bg-surface-container-lowest/80 p-4">
              <p className="label-chip">Salida</p>
              <p className="mt-3 text-sm leading-6 text-on-surface-variant">Resumen, matriz de habilidades y mensaje de contacto en un solo flujo.</p>
            </div>
            <div className="ghost-frame rounded-2xl bg-surface-container-lowest/80 p-4">
              <p className="label-chip">Copiar</p>
              <p className="mt-3 text-sm leading-6 text-on-surface-variant">Editá el mensaje primero y después copiá el borrador final.</p>
            </div>
          </div>
        </article>

        <AnalysisFeature />
      </section>

      <HistoryFeature />
    </>
  );
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