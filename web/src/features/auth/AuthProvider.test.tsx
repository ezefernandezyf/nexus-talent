import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AuthProvider } from "./AuthProvider";
import { useAuth } from "./hooks/useAuth";
import { useAuthStore } from "../../auth/auth-store";

function AuthProbe() {
  const { isAdmin, signIn, signInWithOAuth, signOut, signUp, status, user } = useAuth();

  return (
    <div>
      <p data-testid="status">{status}</p>
      <p data-testid="admin">{isAdmin ? "admin" : "user"}</p>
      <p data-testid="email">{user?.email ?? "no-user"}</p>
      <button type="button" onClick={() => signIn("ana@empresa.com", "secure-password")}>
        Iniciar sesión
      </button>
      <button type="button" onClick={() => signUp("sofia@empresa.com", "secure-password")}>
        Crear cuenta
      </button>
      <button type="button" onClick={() => signInWithOAuth("google")}>
        Google OAuth
      </button>
      <button type="button" onClick={() => signOut()}>
        Cerrar sesión
      </button>
    </div>
  );
}

function createAuthClient(options: {
  session?: { user: { id: string; email: string; displayName?: string | null; user_metadata?: Record<string, unknown> } };
  signInSession?: { user: { id: string; email: string; displayName?: string | null } };
  signUpSession?: { user: { id: string; email: string; displayName?: string | null } };
  oauthErrorMessage?: string | null;
} = {}) {
  let currentSession = options.session ?? null;
  const listeners = new Set<(event: string, session: Record<string, unknown> | null) => void>();

  return {
    auth: {
      getSession: vi.fn(async () => ({
        data: { session: currentSession as Record<string, unknown> | null },
        error: null,
      })),
      onAuthStateChange: vi.fn((callback: (event: string, session: Record<string, unknown> | null) => void) => {
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
      signInWithPassword: vi.fn(async () => {
        return {
          data: { session: options.signInSession ?? currentSession },
          error: null,
        };
      }),
      signInWithOAuth: vi.fn(async ({ provider }) => ({
        data: { provider, url: null },
        error: options.oauthErrorMessage ? { message: options.oauthErrorMessage } : null,
      })),
      signOut: vi.fn(async () => {
        currentSession = null;
        listeners.forEach((listener) => listener("SIGNED_OUT", null));
        return { error: null };
      }),
      signUp: vi.fn(async () => {
        return {
          data: { session: options.signUpSession ?? currentSession },
          error: null,
        };
      }),
    },
  };
}

describe("AuthProvider", () => {
  afterEach(() => {
    useAuthStore.setState({ user: null, status: "unknown", isAdmin: false });
  });

  it("boots the session and persists authenticated users after reload", async () => {
    const client = createAuthClient({
      session: { user: { id: "550e8400-e29b-41d4-a716-446655440000", email: "ana@empresa.com" } },
    });

    render(
      <AuthProvider client={client}>
        <AuthProbe />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("authenticated"));
    expect(screen.getByTestId("admin")).toHaveTextContent("user");
    expect(screen.getByTestId("email")).toHaveTextContent("ana@empresa.com");
  });

  it("syncs password sign-in, sign-up, and sign-out through the shared auth context", async () => {
    const user = userEvent.setup();
    const client = createAuthClient({
      signInSession: { user: { id: "550e8400-e29b-41d4-a716-446655440000", email: "ana@empresa.com" } },
      signUpSession: { user: { id: "550e8400-e29b-41d4-a716-446655440001", email: "sofia@empresa.com" } },
    });

    render(
      <AuthProvider client={client}>
        <AuthProbe />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("unauthenticated"));

    await user.click(screen.getByRole("button", { name: /iniciar sesión/i }));
    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("authenticated"));
    expect(screen.getByTestId("email")).toHaveTextContent("ana@empresa.com");

    await user.click(screen.getByRole("button", { name: /cerrar sesión/i }));
    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("unauthenticated"));
    expect(screen.getByTestId("email")).toHaveTextContent("no-user");

    await user.click(screen.getByRole("button", { name: /crear cuenta/i }));
    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("authenticated"));
    expect(screen.getByTestId("email")).toHaveTextContent("sofia@empresa.com");

    expect(client.auth.signInWithPassword).toHaveBeenCalledTimes(1);
    expect(client.auth.signOut).toHaveBeenCalledTimes(1);
    expect(client.auth.signUp).toHaveBeenCalledTimes(1);
  });

  it("starts the oauth flow and surfaces provider errors", async () => {
    const user = userEvent.setup();
    const client = createAuthClient({ oauthErrorMessage: "Google is temporarily unavailable" });

    render(
      <AuthProvider client={client}>
        <AuthProbe />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("unauthenticated"));

    await user.click(screen.getByRole("button", { name: /google oauth/i }));

    await waitFor(() =>
      expect(client.auth.signInWithOAuth).toHaveBeenCalledWith({
        options: { redirectTo: `${window.location.origin}/auth/callback` },
        provider: "google",
      }),
    );

    expect(screen.getByTestId("status")).toHaveTextContent("unauthenticated");
  });

  it("starts the oauth flow successfully when the provider is available", async () => {
    const user = userEvent.setup();
    const client = createAuthClient();

    render(
      <AuthProvider client={client}>
        <AuthProbe />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("unauthenticated"));

    await user.click(screen.getByRole("button", { name: /google oauth/i }));

    await waitFor(() =>
      expect(client.auth.signInWithOAuth).toHaveBeenCalledWith({
        options: { redirectTo: `${window.location.origin}/auth/callback` },
        provider: "google",
      }),
    );
  });
});
