import { QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import axios from "axios";
import { ANALYSIS_HISTORY_STORAGE_KEY } from "@/features/analysis/api/repository";
import { useAuthStatus } from "@/features/auth/store/auth-status";
import { AuthProvider } from "@/features/auth";
import { createTestQueryClient } from "@/test/mocks/query-client";
import { AppRouter } from "./router";

// ---------------------------------------------------------------------------
// Axios mock — hooks now use HTTP repo instead of localStorage
// ---------------------------------------------------------------------------

const mockAxiosInstance = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
  interceptors: {
    request: { use: vi.fn(), eject: vi.fn() },
    response: { use: vi.fn(), eject: vi.fn() },
  },
}));

vi.mock("axios", () => ({
  default: {
    create: vi.fn(() => mockAxiosInstance),
    isAxiosError: vi.fn(() => false),
  },
}));

function renderApp(initialEntry: string, session: { user: { id: string; email: string; displayName: string | null }; isAdmin: boolean } | null = null) {
  const queryClient = createTestQueryClient();

  // Pre-seed the session cache
  queryClient.setQueryData(["auth", "session"], session);
  useAuthStatus.setState({
    status: session ? "authenticated" : "unauthenticated",
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter initialEntries={[initialEntry]}>
          <AppRouter />
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>,
  );
}

describe("AppRouter", () => {
  beforeEach(() => {
    mockAxiosInstance.get.mockReset();
    mockAxiosInstance.post.mockReset();
    mockAxiosInstance.patch.mockReset();
    mockAxiosInstance.delete.mockReset();

    // Default axios mock: empty analysis list for sidebar
    mockAxiosInstance.get.mockResolvedValue({ data: { items: [], total: 0 } });
  });

  it("renders the public landing page at the root path", () => {
    renderApp("/");

    expect(screen.getByRole("heading", { name: /transform job descriptions into actionable insights/i })).toBeInTheDocument();

    const signInLinks = screen.getAllByRole("link", { name: /^sign in$/i });
    expect(signInLinks.length).toBeGreaterThanOrEqual(1);
    signInLinks.forEach((link) => {
      expect(link).toHaveAttribute("href", "/auth/sign-in");
    });

    const ctaLinks = screen.getAllByRole("link", { name: /start analyzing now/i });
    expect(ctaLinks.length).toBeGreaterThanOrEqual(1);
    ctaLinks.forEach((link) => {
      expect(link).toHaveAttribute("href", "/auth/sign-up");
    });
  });

  it("renders the app shell and analysis page for anonymous users", async () => {
    renderApp("/app/analysis");

    await screen.findByRole("heading", { name: /nuevo análisis de reclutamiento/i }, { timeout: 5000 });
    expect(screen.getByRole("link", { name: /iniciar sesión/i })).toHaveAttribute("href", "/auth/sign-in");
  });

  it("returns 404 for removed admin routes", async () => {
    renderApp("/app/admin/settings", {
      user: { id: "550e8400-e29b-41d4-a716-446655440000", email: "ana@empresa.com", displayName: null },
      isAdmin: false,
    });

    await waitFor(() => expect(screen.getByRole("heading", { name: /404/i })).toBeInTheDocument());
  });

  it("keeps public visitors away from the user settings page", async () => {
    renderApp("/app/settings");

    await waitFor(() => expect(screen.getByRole("heading", { name: /iniciá sesión/i })).toBeInTheDocument());
  });

  it("renders the user settings page for authenticated users", async () => {
    renderApp("/app/settings", {
      user: { id: "550e8400-e29b-41d4-a716-446655440000", email: "ana@empresa.com", displayName: null },
      isAdmin: false,
    });

    await waitFor(() => expect(screen.getByRole("heading", { name: /configuración/i })).toBeInTheDocument());
    expect(screen.getByRole("button", { name: /exportar datos/i })).toBeInTheDocument();
  });

  it("renders the public auth sign-in page", async () => {
    renderApp("/auth/sign-in");

    await waitFor(() => expect(screen.getByRole("heading", { name: /iniciá sesión/i })).toBeInTheDocument());
  });

  it("renders the oauth callback error screen when the callback fails", async () => {
    renderApp("/auth/callback?error=access_denied&error_description=No%20se%20pudo%20completar%20el%20acceso");

    await waitFor(() => expect(screen.getByRole("heading", { name: /estamos terminando de validar tu sesión/i })).toBeInTheDocument());
    expect(screen.getByText(/no se pudo completar el acceso/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /volver a ingresar/i })).toHaveAttribute("href", "/auth/sign-in");
  });

  it("redirects authenticated users away from public auth pages", async () => {
    renderApp("/auth/sign-in", {
      user: { id: "550e8400-e29b-41d4-a716-446655440000", email: "ana@empresa.com", displayName: null },
      isAdmin: false,
    });

    await waitFor(() => expect(screen.getByRole("heading", { name: /nuevo análisis de reclutamiento/i })).toBeInTheDocument());
  });

  it("renders the privacy page", () => {
    renderApp("/privacy");

    expect(screen.getByRole("heading", { name: /privacidad/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /volver al inicio/i })).toHaveAttribute("href", "/");
  });

  it("renders the history detail route for a saved analysis", async () => {
    const savedAnalysis = {
      createdAt: "2026-04-05T12:05:00.000Z",
      id: "550e8400-e29b-41d4-a716-446655440000",
      jobDescription: "Frontend Engineer\nBuild robust UI systems",
      outreachMessage: {
        body: "Hola equipo",
        subject: "Interés",
      },
      skillGroups: [
        {
          category: "Core",
          skills: [{ level: "core", name: "React" }],
        },
      ],
      summary: "Análisis guardado para revisar la estrategia frontend y la calidad técnica.",
    };

    localStorage.setItem(ANALYSIS_HISTORY_STORAGE_KEY, JSON.stringify([savedAnalysis]));

    // Configure axios mock by URL to handle StrictMode double-mounting
    mockAxiosInstance.get.mockImplementation((url: string) => {
      if (url === "/analyses") {
        return Promise.resolve({ data: { items: [savedAnalysis], total: 1 } });
      }
      return Promise.resolve({ data: savedAnalysis });
    });

    renderApp(`/app/history/${savedAnalysis.id}`);

    await waitFor(() => expect(screen.getByRole("heading", { name: /detalle del análisis/i })).toBeInTheDocument());
    expect(screen.getByText(/build robust ui systems/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /volver al historial/i })).toHaveAttribute("href", "/app/history");
  });

  it("shows the history not-found fallback when the requested analysis is missing", async () => {
    localStorage.removeItem(ANALYSIS_HISTORY_STORAGE_KEY);

    // Configure axios mock by URL to handle StrictMode double-mounting
    mockAxiosInstance.get.mockImplementation((url: string) => {
      if (url === "/analyses") {
        return Promise.resolve({ data: { items: [], total: 0 } });
      }
      return Promise.reject(new Error("Not found"));
    });

    renderApp("/app/history/missing-analysis-id");

    await waitFor(() => expect(screen.getByRole("heading", { name: /análisis no encontrado/i })).toBeInTheDocument());
    expect(screen.getByRole("link", { name: /volver al historial/i })).toHaveAttribute("href", "/app/history");
  });

  it("renders the 404 page for unknown routes", async () => {
    renderApp("/ruta-inexistente");

    await waitFor(() => expect(screen.getByRole("heading", { name: /404/i })).toBeInTheDocument());
    expect(screen.getByRole("link", { name: /volver al inicio/i })).toHaveAttribute("href", "/");
  });

  it("keeps the same app shell for authenticated users", async () => {
    renderApp("/app/analysis", {
      user: { id: "550e8400-e29b-41d4-a716-446655440000", email: "ana@empresa.com", displayName: null },
      isAdmin: false,
    });

    await waitFor(() => expect(screen.getByRole("heading", { name: /nuevo análisis de reclutamiento/i })).toBeInTheDocument());
    expect(screen.getByText("ana@empresa.com")).toBeInTheDocument();
  });
});
