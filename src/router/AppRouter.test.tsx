import { QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import type { Session, User } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import { ANALYSIS_HISTORY_STORAGE_KEY } from "../lib/repositories";
import { AuthProvider } from "../features/auth";
import { createTestQueryClient } from "../test/mocks/query-client";
import { AppRouter } from "./AppRouter";

function createUser(email: string): User {
  const now = new Date("2026-04-05T12:00:00.000Z").toISOString();

  return {
    aud: "authenticated",
    app_metadata: {},
    created_at: now,
    email,
    email_confirmed_at: now,
    id: "550e8400-e29b-41d4-a716-446655440000",
    identities: [],
    is_anonymous: false,
    last_sign_in_at: now,
    phone: "",
    role: "authenticated",
    updated_at: now,
    user_metadata: {},
  } as User;
}

function createSession(email: string): Session {
  const user = createUser(email);

  return {
    access_token: "session-token",
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    expires_in: 3600,
    provider_refresh_token: null,
    provider_token: null,
    refresh_token: "refresh-token",
    token_type: "bearer",
    user,
  } as Session;
}

function createAuthClient(session: Session | null) {
  return {
    auth: {
      getSession: vi.fn(async () => ({ data: { session }, error: null })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      signInWithPassword: vi.fn(async () => ({ data: { session, user: session?.user ?? null }, error: null })),
      signInWithOAuth: vi.fn(async () => ({ data: { provider: "github", url: null }, error: null })),
      signOut: vi.fn(async () => ({ error: null })),
      signUp: vi.fn(async () => ({ data: { session, user: session?.user ?? null }, error: null })),
    },
  };
}

function renderApp(initialEntry: string, session: Session | null = null) {
  const queryClient = createTestQueryClient();
  const client = createAuthClient(session);

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider client={client}>
        <MemoryRouter initialEntries={[initialEntry]}>
          <AppRouter />
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>,
  );
}

describe("AppRouter", () => {
  it("renders the public landing page at the root path", () => {
    renderApp("/");

    expect(screen.getByRole("heading", { name: /de job description a postulación ganadora en segundos\./i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^ingresar$/i })).toHaveAttribute("href", "/auth/sign-in");
    const createAccountLinks = screen.getAllByRole("link", { name: /crear cuenta/i });
    createAccountLinks.forEach((link) => {
      expect(link).toHaveAttribute("href", "/auth/sign-up");
    });
  });

  it("renders the app shell and analysis page for anonymous users", async () => {
    renderApp("/app/analysis");

    await screen.findByRole("heading", { name: /nuevo análisis de reclutamiento/i }, { timeout: 5000 });
    expect(screen.getByRole("link", { name: /iniciar sesión/i })).toHaveAttribute("href", "/auth/sign-in");
  });

  it("redirects authenticated legacy settings routes to the user settings page", async () => {
    renderApp("/app/admin/settings", createSession("ana@empresa.com"));

    await waitFor(() => expect(screen.getByRole("heading", { name: /configuración/i })).toBeInTheDocument());
  });

  it("keeps public visitors away from the user settings page", async () => {
    renderApp("/app/settings");

    await waitFor(() => expect(screen.getByRole("heading", { name: /iniciá sesión/i })).toBeInTheDocument());
  });

  it("renders the user settings page for authenticated users", async () => {
    renderApp("/app/settings", createSession("ana@empresa.com"));

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
    renderApp("/auth/sign-in", createSession("ana@empresa.com"));

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

    renderApp(`/app/history/${savedAnalysis.id}`);

    await waitFor(() => expect(screen.getByRole("heading", { name: /detalle del análisis/i })).toBeInTheDocument());
    expect(screen.getByText(/build robust ui systems/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /volver al historial/i })).toHaveAttribute("href", "/app/history");
  });

  it("shows the history not-found fallback when the requested analysis is missing", async () => {
    localStorage.removeItem(ANALYSIS_HISTORY_STORAGE_KEY);

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
    renderApp("/app/analysis", createSession("ana@empresa.com"));

    await waitFor(() => expect(screen.getByRole("heading", { name: /nuevo análisis de reclutamiento/i })).toBeInTheDocument());
    expect(screen.getByText("ana@empresa.com")).toBeInTheDocument();
  });
});
