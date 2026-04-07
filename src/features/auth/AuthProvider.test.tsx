import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Session, User } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import { AuthProvider } from "./AuthProvider";
import { useAuth } from "./hooks/useAuth";
import type { AuthClientLike } from "../../lib/supabase";

function createUser(email: string, role: "admin" | "authenticated" = "authenticated"): User {
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
    user_metadata: { role },
  } as User;
}

function createSession(email: string, role: "admin" | "authenticated" = "authenticated"): Session {
  const now = new Date("2026-04-05T12:00:00.000Z").toISOString();
  const user = createUser(email, role);

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

function createAuthClient(options: {
  session?: Session | null;
} = {}): AuthClientLike {
  let currentSession = options.session ?? null;
  const listeners = new Set<(event: string, session: Session | null) => void>();

  return {
    auth: {
      getSession: vi.fn(async () => ({
        data: { session: currentSession },
        error: null,
      })),
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
      signInWithPassword: vi.fn(async () => ({
        data: { session: currentSession, user: currentSession?.user ?? null },
        error: null,
      })),
      signOut: vi.fn(async () => {
        currentSession = null;
        listeners.forEach((listener) => listener("SIGNED_OUT", null));

        return { error: null };
      }),
      signUp: vi.fn(async () => ({
        data: { session: currentSession, user: currentSession?.user ?? null },
        error: null,
      })),
    },
  };
}

function AuthProbe() {
  const { errorMessage, isAdmin, signOut, session, status, user } = useAuth();

  return (
    <div>
      <p data-testid="status">{status}</p>
      <p data-testid="admin">{isAdmin ? "admin" : "user"}</p>
      <p data-testid="email">{user?.email ?? "no-user"}</p>
      <p data-testid="session">{session?.access_token ?? "no-session"}</p>
      <p data-testid="error">{errorMessage ?? "no-error"}</p>
      <button type="button" onClick={() => signOut()}>
        Cerrar sesión
      </button>
    </div>
  );
}

describe("AuthProvider", () => {
  it("boots the session and persists authenticated users after reload", async () => {
    const client = createAuthClient({ session: createSession("ana@empresa.com") });

    render(
      <AuthProvider client={client}>
        <AuthProbe />
      </AuthProvider>,
    );

    expect(screen.getByTestId("status")).toHaveTextContent("loading");

    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("authenticated"));
    expect(screen.getByTestId("admin")).toHaveTextContent("user");
    expect(screen.getByTestId("email")).toHaveTextContent("ana@empresa.com");
    expect(screen.getByTestId("session")).toHaveTextContent("session-token");
  });

  it("exposes admin users through the auth context", async () => {
    const client = createAuthClient({ session: createSession("admin@empresa.com", "admin") });

    render(
      <AuthProvider client={client}>
        <AuthProbe />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("authenticated"));
    expect(screen.getByTestId("admin")).toHaveTextContent("admin");
  });

  it("signs out and clears the stored session", async () => {
    const user = userEvent.setup();
    const client = createAuthClient({ session: createSession("ana@empresa.com") });

    render(
      <AuthProvider client={client}>
        <AuthProbe />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("authenticated"));
    await user.click(screen.getByRole("button", { name: /cerrar sesión/i }));

    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("unauthenticated"));
    expect(screen.getByTestId("email")).toHaveTextContent("no-user");
    expect(screen.getByTestId("session")).toHaveTextContent("no-session");
  });
});
