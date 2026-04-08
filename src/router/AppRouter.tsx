import { Navigate, Route, Routes } from "react-router-dom";
import { AuthShell, PublicAuthRoute, SignInForm, SignUpForm } from "../features/auth";
import { AdminRoute } from "../features/auth/components/AdminRoute";
import { AppLayout } from "../layouts/AppLayout";
import { LandingPage } from "../pages/LandingPage";
import { AnalysisPage } from "../pages/AnalysisPage";
import { HistoryPage } from "../pages/HistoryPage";
import { SettingsPage } from "../pages/SettingsPage";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
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
      <Route element={<AppLayout />} path="/app">
        <Route index element={<Navigate replace to="analysis" />} />
        <Route path="analysis" element={<AnalysisPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route element={<AdminRoute />} path="admin">
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate replace to="analysis" />} />
      </Route>
      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  );
}
