import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute, PublicAuthRoute } from "../features/auth";
import { LandingPage } from "../features/landing/pages/LandingPage";
import PrivacyPage from "../features/landing/pages/PrivacyPage";
import NotFoundPage from "../shared/pages/NotFoundPage";

const AppLayout = lazy(() => import("../shared/layouts/AppLayout").then((module) => ({ default: module.AppLayout })));
const AnalysisPage = lazy(() => import("../features/analysis/pages/AnalysisPage").then((module) => ({ default: module.AnalysisPage })));
const HistoryDetailPage = lazy(() => import("../features/history/pages/HistoryDetailPage").then((module) => ({ default: module.HistoryDetailPage })));
const HistoryPage = lazy(() => import("../features/history/pages/HistoryPage").then((module) => ({ default: module.HistoryPage })));
const SettingsPage = lazy(() => import("../features/settings/pages/SettingsPage").then((module) => ({ default: module.SettingsPage })));
const AuthCallbackPage = lazy(() => import("../features/auth/pages/AuthCallbackPage"));
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
          <Route path="callback" element={<AuthCallbackPage />} />
          <Route path="sign-in" element={<LoginPage />} />
          <Route path="sign-up" element={<SignupPage />} />
        </Route>
        <Route element={<AppLayout />} path="/app">
          <Route index element={<Navigate replace to="analysis" />} />
          <Route path="analysis" element={<AnalysisPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="history/:analysisId" element={<HistoryDetailPage />} />
          <Route element={<ProtectedRoute />} path="settings">
            <Route index element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate replace to="/404" />} />
        </Route>
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="/login" element={<Navigate replace to="/auth/sign-in" />} />
        <Route path="/signup" element={<Navigate replace to="/auth/sign-up" />} />
        <Route path="*" element={<Navigate replace to="/404" />} />
      </Routes>
    </Suspense>
  );
}
