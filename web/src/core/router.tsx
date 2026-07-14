import { lazy, Suspense, useRef } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ProtectedRoute, PublicAuthRoute } from "@/features/auth";
const LandingPage = lazy(() => import("@/features/landing/pages/LandingPage").then((module) => ({ default: module.LandingPage })));
const PrivacyPage = lazy(() => import("@/features/landing/pages/PrivacyPage"));
const NotFoundPage = lazy(() => import("@/shared/pages/NotFoundPage"));
const ServerErrorPage = lazy(() => import("@/shared/pages/ServerErrorPage"));
import { AppLayoutSkeleton } from "@/core/components/AppLayoutSkeleton";
import { RouteErrorFallback } from "@/core/components/RouteErrorFallback";

const AppLayout = lazy(() => import("@/shared/layouts/AppLayout").then((module) => ({ default: module.AppLayout })));
const AnalysisPage = lazy(() => import("@/features/analysis/pages/AnalysisPage").then((module) => ({ default: module.AnalysisPage })));
const HistoryDetailPage = lazy(() => import("@/features/history/pages/HistoryDetailPage").then((module) => ({ default: module.HistoryDetailPage })));
const HistoryPage = lazy(() => import("@/features/history/pages/HistoryPage").then((module) => ({ default: module.HistoryPage })));
const SettingsPage = lazy(() => import("@/features/settings/pages/SettingsPage").then((module) => ({ default: module.SettingsPage })));
const CVPage = lazy(() => import("@/features/cv/pages/CVPage").then((module) => ({ default: module.CVPage })));
const ExperienceManagerPage = lazy(() => import("@/features/cv/pages/ExperienceManagerPage").then((module) => ({ default: module.ExperienceManagerPage })));
const EducationManagerPage = lazy(() => import("@/features/cv/pages/EducationManagerPage").then((module) => ({ default: module.EducationManagerPage })));
const AuthCallbackPage = lazy(() => import("@/features/auth/pages/AuthCallbackPage"));
const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage"));
const SignupPage = lazy(() => import("@/features/auth/pages/SignupPage"));

export function AppRouter() {
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();
  const isFirstRender = useRef(true);

  const pageInitial = isFirstRender.current
    ? false
    : prefersReducedMotion
      ? false
      : { opacity: 0 };

  // eslint-disable-next-line react-compiler/react-hooks-compiler-safe
  isFirstRender.current = false;

  return (
    <Suspense fallback={<AppLayoutSkeleton />}>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={pageInitial}
          animate={{ opacity: 1 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0 }}
        >
          <Routes location={location}>
            <Route path="/" element={<LandingPage />} />
            <Route element={<PublicAuthRoute />} path="/auth">
              <Route index element={<Navigate replace to="sign-in" />} />
              <Route path="callback" element={<AuthCallbackPage />} />
              <Route path="sign-in" element={<LoginPage />} />
              <Route path="sign-up" element={<SignupPage />} />
            </Route>
            <Route element={<AppLayout />} path="/app">
              <Route index element={<Navigate replace to="analysis" />} />
              <Route path="analysis" element={<AnalysisPage />} errorElement={<RouteErrorFallback />} />
              <Route path="history" element={<HistoryPage />} errorElement={<RouteErrorFallback />} />
              <Route path="history/:analysisId" element={<HistoryDetailPage />} errorElement={<RouteErrorFallback />} />
              <Route element={<ProtectedRoute />} path="cv">
                <Route index element={<CVPage />} errorElement={<RouteErrorFallback />} />
                <Route path="experience" element={<ExperienceManagerPage />} errorElement={<RouteErrorFallback />} />
                <Route path="education" element={<EducationManagerPage />} errorElement={<RouteErrorFallback />} />
              </Route>
              <Route element={<ProtectedRoute />} path="settings">
                <Route index element={<SettingsPage />} errorElement={<RouteErrorFallback />} />
              </Route>
              <Route path="*" element={<Navigate replace to="/404" />} />
            </Route>
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/500" element={<ServerErrorPage />} />
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="/login" element={<Navigate replace to="/auth/sign-in" />} />
            <Route path="/signup" element={<Navigate replace to="/auth/sign-up" />} />
            <Route path="*" element={<Navigate replace to="/404" />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </Suspense>
  );
}
