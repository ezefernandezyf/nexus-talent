import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Navigate, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "../AuthProvider";
import { ProtectedRoute } from "../ProtectedRoute";
import { PublicAuthRoute } from "../PublicAuthRoute";
import { SignInForm } from "./SignInForm";
import { useAuthStore } from "../../../auth/auth-store";

type ClientAuth = {
  getSession: ReturnType<typeof vi.fn>;
  onAuthStateChange: ReturnType<typeof vi.fn>;
  signInWithPassword: ReturnType<typeof vi.fn>;
  signInWithOAuth: ReturnType<typeof vi.fn>;
  signOut: ReturnType<typeof vi.fn>;
  signUp: ReturnType<typeof vi.fn>;
};

function createAuthClient(signInErrorMessage: string | null): {
  auth: ClientAuth;
} {
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
      signInWithPassword: vi.fn(async () => {
        if (signInErrorMessage) {
          return {
            data: { session: null, user: null },
            error: { message: signInErrorMessage },
          };
        }

        return {
          data: {
            session: {
              user: { id: "550e8400-e29b-41d4-a716-446655440000", email: "ana@empresa.com" },
            },
          },
          error: null,
        };
      }),
      signInWithOAuth: vi.fn(async ({ provider }) => ({
        data: { provider, url: null },
        error: signInErrorMessage ? { message: signInErrorMessage } : null,
      })),
      signOut: vi.fn(async () => ({ error: null })),
      signUp: vi.fn(async () => ({ data: { session: null, user: null }, error: null })),
    },
  };
}

describe("SignInForm", () => {
  afterEach(() => {
    useAuthStore.setState({ user: null, status: "unknown", isAdmin: false });
  });

  it("shows validation errors for empty submit", async () => {
    const user = userEvent.setup();
    const client = createAuthClient(null);

    render(
      <AuthProvider client={client}>
        <SignInForm />
      </AuthProvider>,
    );

    await user.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    await waitFor(() => expect(screen.getByText(/el email debe ser válido/i)).toBeInTheDocument());
    expect(screen.getByText(/la contraseña debe tener al menos 6 caracteres/i)).toBeInTheDocument();
  });

  it("surfaces invalid login errors", async () => {
    const user = userEvent.setup();
    const client = createAuthClient("Invalid login credentials");

    render(
      <AuthProvider client={client}>
        <SignInForm />
      </AuthProvider>,
    );

    await user.type(screen.getByLabelText(/email/i), "ana@empresa.com");
    await user.type(screen.getByLabelText(/contraseña/i), "wrong-password");
    await user.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    await waitFor(() => expect(screen.getByText(/invalid login credentials/i)).toBeInTheDocument());
  });

  it("starts google oauth from the sign-in entry point", async () => {
    const user = userEvent.setup();
    const client = createAuthClient(null);

    render(
      <AuthProvider client={client}>
        <SignInForm />
      </AuthProvider>,
    );

    await user.click(screen.getByRole("button", { name: /ingresar con google/i }));

    await waitFor(() =>
      expect(client.auth.signInWithOAuth).toHaveBeenCalledWith({
        options: { redirectTo: `${window.location.origin}/auth/callback` },
        provider: "google",
      }),
    );
  });

  it("surfaces oauth errors without breaking the password form", async () => {
    const user = userEvent.setup();
    const client = createAuthClient("Google is temporarily unavailable");

    render(
      <AuthProvider client={client}>
        <SignInForm />
      </AuthProvider>,
    );

    await user.click(screen.getByRole("button", { name: /ingresar con google/i }));

    await waitFor(() => expect(screen.getByText(/google is temporarily unavailable/i)).toBeInTheDocument());
    expect(screen.getByRole("button", { name: /iniciar sesión/i })).toBeEnabled();
  });

  it("redirects into the private shell after a successful login", async () => {
    const user = userEvent.setup();
    const client = createAuthClient(null);

    render(
      <MemoryRouter initialEntries={["/auth/sign-in"]}>
        <AuthProvider client={client}>
          <Routes>
            <Route element={<PublicAuthRoute />} path="/auth">
              <Route path="sign-in" element={<SignInForm />} />
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
    await user.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    await waitFor(() => expect(screen.getByText("Private Shell")).toBeInTheDocument());
  });
});
