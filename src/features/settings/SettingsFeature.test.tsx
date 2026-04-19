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

function createDeferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });

  return { promise, resolve, reject };
}

function createAuthClient() {
  let currentSession = {
    access_token: "access-token",
    expires_in: 3600,
    expires_at: 1234567890,
    refresh_token: "refresh-token",
    token_type: "bearer" as const,
    user: {
      app_metadata: { provider: "github" },
      email: "analyst@nexustalent.dev",
      id: "user-1",
      identities: [{ identity_id: "github-identity", provider: "github", user_id: "user-1" }],
      user_metadata: {
        display_name: "Marcus Sterling",
        location: "San Francisco, CA",
      },
    },
  };
  const listeners = new Set<(event: string, session: typeof currentSession | null) => void>();
  const signOut = vi.fn(async () => ({ error: null }));

  return {
    auth: {
      getSession: vi.fn(async () => ({ data: { session: currentSession }, error: null })),
      getUserIdentities: vi.fn(async () => ({ data: { identities: currentSession.user.identities }, error: null })),
      linkIdentity: vi.fn(async ({ provider }) => {
        const identity = {
          id: `${provider}-identity`,
          identity_id: `${provider}-identity`,
          provider,
          user_id: currentSession.user.id,
        };

        currentSession = {
          ...currentSession,
          user: {
            ...currentSession.user,
            identities: [...currentSession.user.identities.filter((item) => item.provider !== provider), identity],
          },
        };

        listeners.forEach((listener) => listener("SIGNED_IN", currentSession));

        return { data: { provider, url: null }, error: null };
      }),
      onAuthStateChange: vi.fn((callback) => {
        listeners.add(callback);

        return { data: { subscription: { unsubscribe: vi.fn(() => listeners.delete(callback)) } } };
      }),
      signInWithPassword: vi.fn(async () => ({ data: { session: null, user: null }, error: null })),
      signInWithOAuth: vi.fn(async () => ({ data: { provider: "github", url: null }, error: null })),
      signOut,
      signUp: vi.fn(async () => ({ data: { session: null, user: null }, error: null })),
      unlinkIdentity: vi.fn(async (identity) => {
        currentSession = {
          ...currentSession,
          user: {
            ...currentSession.user,
            identities: currentSession.user.identities.filter((item) => item.provider !== identity.provider),
          },
        };

        listeners.forEach((listener) => listener("SIGNED_IN", currentSession));

        return { data: {}, error: null };
      }),
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
  it("renders the settings sections with reference-like hierarchy", async () => {
    renderSettingsFeature();

    await waitFor(() => expect(screen.getByText(/información de la cuenta/i)).toBeInTheDocument());

    expect(screen.getByText(/cuentas vinculadas/i)).toBeInTheDocument();
    expect(screen.getByText(/zona de peligro/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toHaveValue("analyst@nexustalent.dev");
    expect(screen.getByLabelText(/nombre visible/i)).toHaveValue("Marcus Sterling");
    expect(screen.getByText(/san francisco, ca/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /guardar cambios/i })).toBeInTheDocument();
    expect(screen.queryByText("GitHub")).not.toBeInTheDocument();
    expect(within(screen.getByText("Google").closest("article") as HTMLElement).getByText(/no conectado/i)).toBeInTheDocument();
    expect(within(screen.getByText("Google").closest("article") as HTMLElement).getByRole("button", { name: /vincular/i })).toBeEnabled();
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

    await waitFor(() => expect(screen.getByRole("button", { name: /guardar cambios/i })).toBeEnabled());

    await user.clear(screen.getByLabelText(/nombre visible/i));
    await user.type(screen.getByLabelText(/nombre visible/i), "M. Sterling");
    await user.click(screen.getByRole("button", { name: /guardar cambios/i }));

    await waitFor(() => expect(screen.getByText(/supabase is temporarily unavailable/i)).toBeInTheDocument());
    expect(screen.getByRole("button", { name: /guardar cambios/i })).toBeEnabled();
  });

  it("persists the profile display name through the settings flow", async () => {
    const user = userEvent.setup();
    const repository = {
      get: vi.fn(async () => ({
        created_at: "2026-04-05T12:00:00.000Z",
        display_name: "Marcus Sterling",
        email: "analyst@nexustalent.dev",
        id: "user-1",
        updated_at: "2026-04-05T12:00:00.000Z",
      })),
      save: vi.fn(async () => ({
        created_at: "2026-04-05T12:00:00.000Z",
        display_name: "M. Sterling",
        email: "analyst@nexustalent.dev",
        id: "user-1",
        updated_at: "2026-04-05T12:00:00.000Z",
      })),
    };

    renderSettingsFeature(repository as never);

    await waitFor(() => expect(screen.getByRole("button", { name: /guardar cambios/i })).toBeEnabled());

    await user.clear(screen.getByLabelText(/nombre visible/i));
    await user.type(screen.getByLabelText(/nombre visible/i), "M. Sterling");
    await user.click(screen.getByRole("button", { name: /guardar cambios/i }));

    await waitFor(() => expect(screen.getByText(/perfil guardado correctamente/i)).toBeInTheDocument());
    expect(screen.getByLabelText(/nombre visible/i)).toHaveValue("M. Sterling");
    expect(repository.save).toHaveBeenCalledWith({
      displayName: "M. Sterling",
      email: "analyst@nexustalent.dev",
      userId: "user-1",
    });
  });

  it("keeps the delete account flow interactive", async () => {
    renderSettingsFeature();

    await waitFor(() => expect(screen.getByRole("button", { name: /eliminar cuenta/i })).toBeInTheDocument());
    expect(screen.getByRole("button", { name: /eliminar cuenta/i })).toBeEnabled();
  });

  it("shows linked accounts as interactive", async () => {
    renderSettingsFeature();

    await waitFor(() => expect(screen.getByText(/cuentas vinculadas/i)).toBeInTheDocument());
    const googleCard = screen.getByText("Google").closest("article") as HTMLElement;
    expect(within(googleCard).getByRole("button", { name: /vincular/i })).toBeEnabled();
    expect(within(googleCard).getByText(/no conectado/i)).toBeInTheDocument();
  });

  it("reflects the shared theme state in the account summary", async () => {
    renderSettingsFeature();

    await waitFor(() => expect(screen.getByText(/tema oscuro/i)).toBeInTheDocument());
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });
});
