import { QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { renderHook, waitFor } from "@testing-library/react";
import type { Session, User } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import { AuthProvider } from "../../auth";
import { ThemeProvider } from "../../../lib/theme";
import { createTestQueryClient } from "../../../test/mocks/query-client";
import { useSettings } from "./useSettings";

function createUser(email: string): User {
  const now = new Date("2026-04-05T12:00:00.000Z").toISOString();

  return {
    aud: "authenticated",
    app_metadata: {},
    created_at: now,
    email,
    email_confirmed_at: now,
    id: "user-1",
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

function createAuthClient(options: { session: Session | null }) {
  let currentSession = options.session;
  const listeners = new Set<(event: string, session: Session | null) => void>();

  return {
    auth: {
      getSession: vi.fn(async () => ({ data: { session: currentSession }, error: null })),
      getUserIdentities: vi.fn(async () => ({
        data: {
          identities: currentSession?.user.identities ?? [],
        },
        error: null,
      })),
      linkIdentity: vi.fn(async ({ provider }) => {
        if (currentSession?.user) {
          const identityId = `${provider}-identity`;
          const nextIdentities = [
            ...(currentSession.user.identities ?? []),
            { id: identityId, identity_id: identityId, provider, user_id: currentSession.user.id },
          ];

          currentSession = {
            ...currentSession,
            user: {
              ...currentSession.user,
              identities: nextIdentities,
            },
          };

          listeners.forEach((listener) => listener("SIGNED_IN", currentSession));
        }

        return { data: { provider, url: null }, error: null };
      }),
      onAuthStateChange: vi.fn((callback) => {
        listeners.add(callback);

        return {
          data: {
            subscription: {
              unsubscribe: () => {
                listeners.delete(callback);
              },
            },
          },
        };
      }),
      signInWithPassword: vi.fn(async () => ({ data: { session: currentSession, user: currentSession?.user ?? null }, error: null })),
      signInWithOAuth: vi.fn(async () => ({ data: { provider: "github", url: null }, error: null })),
      signOut: vi.fn(async () => ({ error: null })),
      signUp: vi.fn(async () => ({ data: { session: currentSession, user: currentSession?.user ?? null }, error: null })),
      unlinkIdentity: vi.fn(async (identity) => {
        if (currentSession?.user) {
          const nextIdentities = (currentSession.user.identities ?? []).filter((item) => item.provider !== identity.provider);

          currentSession = {
            ...currentSession,
            user: {
              ...currentSession.user,
              identities: nextIdentities,
            },
          };

          listeners.forEach((listener) => listener("SIGNED_IN", currentSession));
        }

        return { data: {}, error: null };
      }),
    },
  };
}

describe("useSettings", () => {
  it("saves the profile through the repository and keeps the cache in sync", async () => {
    const queryClient = createTestQueryClient();
    const repository = {
      delete: vi.fn(async () => undefined),
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
    const client = createAuthClient({ session: createSession("analyst@nexustalent.dev") });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider client={client as never}>
            <MemoryRouter>{children}</MemoryRouter>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    );

    const { result } = renderHook(() => useSettings({ repository: repository as never }), { wrapper });

    await waitFor(() => expect(result.current.status).toBe("authenticated"));

    await result.current.saveProfile({
      displayName: "M. Sterling",
      email: "analyst@nexustalent.dev",
      userId: "user-1",
    });

    expect(repository.save).toHaveBeenCalledWith({
      displayName: "M. Sterling",
      email: "analyst@nexustalent.dev",
      userId: "user-1",
    });
    await waitFor(() => expect(result.current.saveProfileSuccess).toBe(true));
  });

  it("deletes the profile and signs out the active session", async () => {
    const queryClient = createTestQueryClient();
    const signOut = vi.fn(async () => ({ error: null }));
    const repository = {
      delete: vi.fn(async () => undefined),
      get: vi.fn(async () => null),
      save: vi.fn(async () => {
        throw new Error("not used");
      }),
    };
    const client = createAuthClient({ session: createSession("analyst@nexustalent.dev") });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider
            client={{
              auth: {
                ...client.auth,
                signOut,
              },
            } as never}
          >
            <MemoryRouter>{children}</MemoryRouter>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    );

    const { result } = renderHook(() => useSettings({ repository: repository as never }), { wrapper });

    await waitFor(() => expect(result.current.status).toBe("authenticated"));

    await expect(result.current.deleteAccount()).resolves.toBeUndefined();

    expect(repository.delete).toHaveBeenCalledWith("user-1");
    expect(signOut).toHaveBeenCalled();
  });

  it("links and unlinks platform identities through auth helpers", async () => {
    const queryClient = createTestQueryClient();
    const client = createAuthClient({
      session: createSession("analyst@nexustalent.dev"),
    });
    const repository = {
      delete: vi.fn(async () => undefined),
      get: vi.fn(async () => null),
      save: vi.fn(async () => {
        throw new Error("not used");
      }),
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider client={client as never}>
            <MemoryRouter>{children}</MemoryRouter>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    );

    const { result } = renderHook(() => useSettings({ repository: repository as never }), { wrapper });

    await waitFor(() => expect(result.current.status).toBe("authenticated"));

    expect(result.current.identityLinkingAvailable).toBe(true);

    await expect(result.current.connectAccount("google")).resolves.toMatchObject({
      message: expect.stringMatching(/vinculando google/i),
    });
    expect(result.current.accountActionError).toBeNull();
    expect(client.auth.linkIdentity).toHaveBeenCalledWith(expect.objectContaining({ provider: "google" }));

    await expect(result.current.disconnectAccount("google")).resolves.toMatchObject({
      message: expect.stringMatching(/google desvinculada\./i),
    });
    expect(result.current.accountActionError).toBeNull();
    expect(client.auth.unlinkIdentity).toHaveBeenCalledWith(expect.objectContaining({ provider: "google" }));
  });
});