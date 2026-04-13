import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { PublicAuthRoute } from "../features/auth";
import { AdminRoute } from "../features/auth/components/AdminRoute";
import { LandingPage } from "../pages/LandingPage";

const AppLayout = lazy(() => import("../layouts/AppLayout").then((module) => ({ default: module.AppLayout })));
const AnalysisPage = lazy(() => import("../pages/AnalysisPage").then((module) => ({ default: module.AnalysisPage })));
const HistoryPage = lazy(() => import("../pages/HistoryPage").then((module) => ({ default: module.HistoryPage })));
const SettingsPage = lazy(() => import("../pages/SettingsPage").then((module) => ({ default: module.SettingsPage })));
const LoginPage = lazy(() => import("../features/auth/pages/LoginPage"));
const SignupPage = lazy(() => import("../features/auth/pages/SignupPage"));

function RouteLoadingFallback() {
  return (
    <div aria-busy="true" aria-live="polite" className="min-h-screen bg-surface-container-lowest text-on-surface">
      <span className="sr-only">Cargando pantalla</span>
    </div>
  );
}

export function AppRouter() {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route element={<PublicAuthRoute />} path="/auth">
          <Route index element={<Navigate replace to="sign-in" />} />
          <Route path="sign-in" element={<LoginPage />} />
          <Route path="sign-up" element={<SignupPage />} />
        </Route>
        <Route element={<AppLayout />} path="/app">
          <Route index element={<Navigate replace to="analysis" />} />
          <Route path="analysis" element={<AnalysisPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route element={<AdminRoute />} path="admin">
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate replace to="analysis" />} />
        </Route>
        <Route path="/login" element={<Navigate replace to="/auth/sign-in" />} />
        <Route path="/signup" element={<Navigate replace to="/auth/sign-up" />} />
        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>
    </Suspense>
  );
}
