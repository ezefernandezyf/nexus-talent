import { QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AuthProvider } from "../auth";
import { createProfileRepository } from "../../lib/repositories";
import { ThemeProvider } from "../../lib/theme";
import { createTestQueryClient } from "../../test/mocks/query-client";
import { mockDownloadApis } from "../../test/mocks/browser";
import { SettingsFeature } from "./SettingsFeature";

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

function renderSettingsFeature(repository = createProfileRepository(null)) {
  const queryClient = createTestQueryClient();

  localStorage.setItem("nexus-talent:theme:v1", "dark");

  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider client={createAuthClient() as never}>
          <MemoryRouter>
              <SettingsFeature repository={repository} />
          </MemoryRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>,
  );
}

describe("SettingsFeature", () => {
  it("renders the three section shell with linked-account status", async () => {
    renderSettingsFeature();

    await waitFor(() => expect(screen.getByText(/account information/i)).toBeInTheDocument());

    expect(screen.getByText(/linked accounts/i)).toBeInTheDocument();
    expect(screen.getByText(/danger zone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toHaveValue("analyst@nexustalent.dev");
    expect(screen.getByLabelText(/nombre visible/i)).toHaveValue("Marcus Sterling");
    expect(within(screen.getByText("GitHub").closest("article") as HTMLElement).getByText(/conectado/i)).toBeInTheDocument();
    expect(within(screen.getByText("Google").closest("article") as HTMLElement).getByText(/no conectado/i)).toBeInTheDocument();
  });

  it("keeps the profile form editable after a save failure", async () => {
    const user = userEvent.setup();
    const repository = {
      get: vi.fn(async () => ({
        created_at: "2026-04-05T12:00:00.000Z",
        display_name: "Marcus Sterling",
        email: "analyst@nexustalent.dev",
        id: "user-1",
        updated_at: "2026-04-05T12:00:00.000Z",
      })),
      save: vi.fn(async () => {
        throw new Error("Supabase is temporarily unavailable");
      }),
    };

    renderSettingsFeature(repository as never);

    await waitFor(() => expect(screen.getByRole("button", { name: /guardar perfil/i })).toBeEnabled());

    await user.clear(screen.getByLabelText(/nombre visible/i));
    await user.type(screen.getByLabelText(/nombre visible/i), "M. Sterling");
    await user.click(screen.getByRole("button", { name: /guardar perfil/i }));

    await waitFor(() => expect(screen.getByText(/supabase is temporarily unavailable/i)).toBeInTheDocument());
    expect(screen.getByRole("button", { name: /guardar perfil/i })).toBeEnabled();
  });

  it("persists the profile display name through the settings flow", async () => {
    const user = userEvent.setup();

    renderSettingsFeature();

    await waitFor(() => expect(screen.getByRole("button", { name: /guardar perfil/i })).toBeEnabled());

    await user.clear(screen.getByLabelText(/nombre visible/i));
    await user.type(screen.getByLabelText(/nombre visible/i), "M. Sterling");
    await user.click(screen.getByRole("button", { name: /guardar perfil/i }));

    await waitFor(() => expect(screen.getByText(/perfil guardado correctamente/i)).toBeInTheDocument());
    expect(screen.getByLabelText(/nombre visible/i)).toHaveValue("M. Sterling");
  });

  it("opens and closes the delete confirmation flow", async () => {
    const user = userEvent.setup();

    renderSettingsFeature();

    await waitFor(() => expect(screen.getByRole("button", { name: /eliminar cuenta/i })).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /eliminar cuenta/i }));

    expect(screen.getByRole("button", { name: /confirmar eliminación/i })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /cancelar/i }));

    expect(screen.getByRole("button", { name: /eliminar cuenta/i })).toBeInTheDocument();
  });

  it("reflects the shared theme state in the account summary", async () => {
    renderSettingsFeature();

    await waitFor(() => expect(screen.getByText(/tema oscuro/i)).toBeInTheDocument());
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });
});
