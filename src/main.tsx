import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { App } from "./App";
import { AuthProvider } from "./features/auth";
import { queryClient } from "./lib/query-client";
import ErrorBoundary from "./components/ErrorBoundary";
import { initLogger } from "./lib/logger";
import { BrowserRouter } from "react-router-dom";
import "./index.css";

const rootElement = document.getElementById("root");

initLogger({
  environment: import.meta.env.PROD ? "production" : "development",
  telemetryEndpoint: import.meta.env.VITE_TELEMETRY_ENDPOINT,
});

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <AuthProvider>
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <App />
            </BrowserRouter>
          </AuthProvider>
        </ErrorBoundary>
      </QueryClientProvider>
    </StrictMode>,
  );
}