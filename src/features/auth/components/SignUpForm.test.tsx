import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Session, User } from "@supabase/supabase-js";
import { MemoryRouter, Navigate, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { AuthProvider } from "../AuthProvider";
import { ProtectedRoute } from "../ProtectedRoute";
import { PublicAuthRoute } from "../PublicAuthRoute";
import { SignUpForm } from "./SignUpForm";
import type { AuthClientLike } from "../../../lib/supabase";

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

function createAuthClient(signUpErrorMessage: string | null): AuthClientLike {
  return {
    auth: {
      getSession: vi.fn(async () => ({ data: { session: null }, error: null })),
      onAuthStateChange: vi.fn(() => ({
        data: {
          subscription: {
            unsubscribe: () => undefined,
          },
        },
      })),
      signInWithPassword: vi.fn(async () => ({ data: { session: null, user: null }, error: null })),
      signInWithOAuth: vi.fn(async ({ provider }) => ({
        data: { provider, url: null },
        error: signUpErrorMessage ? { message: signUpErrorMessage } : null,
      })),
      signOut: vi.fn(async () => ({ error: null })),
      signUp: vi.fn(async () => {
        if (signUpErrorMessage) {
          return {
            data: { session: null, user: null },
            error: { message: signUpErrorMessage },
          };
        }

        const session = createSession("ana@empresa.com");
        return {
          data: { session, user: session.user },
          error: null,
        };
      }),
    },
  };
}

describe("SignUpForm", () => {
  it("shows validation errors for empty submit", async () => {
    const user = userEvent.setup();
    const client = createAuthClient(null);

    render(
      <AuthProvider client={client}>
        <SignUpForm />
      </AuthProvider>,
    );

    await user.click(screen.getByRole("button", { name: /crear cuenta/i }));

    await waitFor(() => expect(screen.getByText(/el email debe ser válido/i)).toBeInTheDocument());
    expect(screen.getByText(/la contraseña debe tener al menos 6 caracteres/i)).toBeInTheDocument();
  });

  it("surfaces existing-email signup errors", async () => {
    const user = userEvent.setup();
    const client = createAuthClient("User already registered");

    render(
      <AuthProvider client={client}>
        <SignUpForm />
      </AuthProvider>,
    );

    await user.type(screen.getByLabelText(/email/i), "ana@empresa.com");
    await user.type(screen.getByLabelText(/contraseña/i), "secure-password");
    await user.click(screen.getByRole("button", { name: /crear cuenta/i }));

    await waitFor(() => expect(screen.getByText(/user already registered/i)).toBeInTheDocument());
  });

  it("starts google oauth from the sign-up entry point", async () => {
    const user = userEvent.setup();
    const client = createAuthClient(null);

    render(
      <AuthProvider client={client}>
        <SignUpForm />
      </AuthProvider>,
    );

    await user.click(screen.getByRole("button", { name: /continuar con google/i }));

    await waitFor(() =>
      expect(client.auth.signInWithOAuth).toHaveBeenCalledWith({
        options: { redirectTo: `${window.location.origin}/auth/callback` },
        provider: "google",
      }),
    );
  });

  it("redirects into the private shell after a successful signup", async () => {
    const user = userEvent.setup();
    const client = createAuthClient(null);

    render(
      <MemoryRouter initialEntries={["/auth/sign-up"]}>
        <AuthProvider client={client}>
          <Routes>
            <Route element={<PublicAuthRoute />} path="/auth">
              <Route path="sign-up" element={<SignUpForm />} />
            </Route>
            <Route element={<ProtectedRoute />} path="/app">
              <Route index element={<div>Private Shell</div>} />
            </Route>
            <Route path="*" element={<Navigate replace to="/" />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );

    await screen.findByLabelText(/email/i);

    await user.type(screen.getByLabelText(/email/i), "ana@empresa.com");
    await user.type(screen.getByLabelText(/contraseña/i), "secure-password");
    await user.click(screen.getByRole("button", { name: /crear cuenta/i }));

    await waitFor(() => expect(screen.getByText("Private Shell")).toBeInTheDocument());
  });
});
