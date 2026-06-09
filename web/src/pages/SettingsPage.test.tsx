import { QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AuthProvider } from "../features/auth";
import { ThemeProvider } from "../lib/theme";
import { createTestQueryClient } from "../test/mocks/query-client";
import { SettingsPage } from "./SettingsPage";

function createAuthClient() {
  return {
    auth: {
      getSession: vi.fn(async () => ({
        data: {
          session: {
            access_token: "access-token",
            expires_in: 3600,
            expires_at: 1234567890,
            refresh_token: "refresh-token",
            token_type: "bearer" as const,
            user: {
              app_metadata: { provider: "github" },
              email: "analyst@nexustalent.dev",
              id: "user-1",
              identities: [{ provider: "github" }],
              user_metadata: {
                display_name: "Marcus Sterling",
                location: "San Francisco, CA",
              },
            },
          },
        },
        error: null,
      })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      signInWithPassword: vi.fn(async () => ({ data: { session: null, user: null }, error: null })),
      signInWithOAuth: vi.fn(async () => ({ data: { provider: "github", url: null }, error: null })),
      signOut: vi.fn(async () => ({ error: null })),
      signUp: vi.fn(async () => ({ data: { session: null, user: null }, error: null })),
    },
  };
}

describe("SettingsPage", () => {
  it("renders the user-facing settings shell and top-level actions", async () => {
    const queryClient = createTestQueryClient();

    localStorage.setItem("nexus-talent:theme:v1", "dark");

    render(
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider client={createAuthClient() as never}>
            <MemoryRouter>
              <SettingsPage />
            </MemoryRouter>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>,
    );

    await waitFor(() => expect(screen.getByRole("heading", { name: "Configuración" })).toBeInTheDocument());
    expect(screen.getByRole("button", { name: /tema claro/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /exportar datos/i })).toBeInTheDocument();
    expect(screen.getByText(/información de la cuenta/i)).toBeInTheDocument();
    expect(screen.getByText(/cuentas vinculadas/i)).toBeInTheDocument();
    expect(screen.getByText(/zona de peligro/i)).toBeInTheDocument();
  });
});