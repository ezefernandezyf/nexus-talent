import { QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import type { Session, User } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import { AppRouter } from "./AppRouter";
import { AuthProvider } from "../features/auth";
import { createTestQueryClient } from "../test/mocks/query-client";

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
    expect(screen.getByRole("link", { name: /ingresar/i })).toHaveAttribute("href", "/auth/sign-in");
    expect(screen.getByRole("link", { name: /crear cuenta/i })).toHaveAttribute("href", "/auth/sign-up");
  });

  it("renders the app shell and analysis page for anonymous users", async () => {
    renderApp("/app/analysis");

    await screen.findByRole("heading", { name: /nuevo análisis de reclutamiento/i }, { timeout: 5000 });
    expect(screen.getByRole("link", { name: /iniciar sesión/i })).toHaveAttribute("href", "/auth/sign-in");
  });

  it("renders the public auth sign-in page", async () => {
    renderApp("/auth/sign-in");

    await waitFor(() => expect(screen.getByRole("heading", { name: /iniciá sesión/i })).toBeInTheDocument());
  });

  it("redirects authenticated users away from public auth pages", async () => {
    renderApp("/auth/sign-in", createSession("ana@empresa.com"));

    await waitFor(() => expect(screen.getByRole("heading", { name: /nuevo análisis de reclutamiento/i })).toBeInTheDocument());
  });

  it("redirects unknown routes to the public landing page", () => {
    renderApp("/ruta-inexistente");

    expect(screen.getByRole("heading", { name: /de job description a postulación ganadora en segundos\./i })).toBeInTheDocument();
  });

  it("keeps the same app shell for authenticated users", async () => {
    renderApp("/app/analysis", createSession("ana@empresa.com"));

    await waitFor(() => expect(screen.getByRole("heading", { name: /nuevo análisis de reclutamiento/i })).toBeInTheDocument());
    expect(screen.getByText("ana@empresa.com")).toBeInTheDocument();
  });
});
