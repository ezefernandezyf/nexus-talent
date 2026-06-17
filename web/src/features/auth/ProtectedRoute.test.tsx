import { MemoryRouter, Navigate, Route, Routes } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AuthProvider } from "./AuthProvider";
import { ProtectedRoute } from "./ProtectedRoute";
import { PublicAuthRoute } from "./PublicAuthRoute";
import { useAuthStore } from "../../auth/auth-store";

describe("auth route guards", () => {
  afterEach(() => {
    useAuthStore.setState({ user: null, status: "unknown", isAdmin: false });
  });

  it("redirects unauthenticated users away from protected routes", async () => {
    const client = {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => undefined } } }),
        signInWithPassword: async () => ({ data: { session: null, user: null }, error: null }),
        signInWithOAuth: async () => ({ data: { provider: "google", url: null }, error: null }),
        signOut: async () => ({ error: null }),
        signUp: async () => ({ data: { session: null, user: null }, error: null }),
      },
    };

    render(
      <MemoryRouter initialEntries={["/app"]}>
        <AuthProvider client={client}>
          <Routes>
            <Route element={<PublicAuthRoute />} path="/auth">
              <Route path="sign-in" element={<div>Sign In Page</div>} />
            </Route>
            <Route element={<ProtectedRoute />} path="/app">
              <Route index element={<div>Private Shell</div>} />
            </Route>
            <Route path="*" element={<Navigate replace to="/" />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText("Sign In Page")).toBeInTheDocument());
  });

  it("keeps authenticated users inside the private shell", async () => {
    const client = {
      auth: {
        getSession: async () => ({
          data: {
            session: {
              user: { id: "550e8400-e29b-41d4-a716-446655440000", email: "ana@empresa.com" },
            },
          },
          error: null,
        }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => undefined } } }),
        signInWithPassword: async () => ({ data: { session: null, user: null }, error: null }),
        signInWithOAuth: async () => ({ data: { provider: "google", url: null }, error: null }),
        signOut: async () => ({ error: null }),
        signUp: async () => ({ data: { session: null, user: null }, error: null }),
      },
    };

    render(
      <MemoryRouter initialEntries={["/app"]}>
        <AuthProvider client={client}>
          <Routes>
            <Route element={<PublicAuthRoute />} path="/auth">
              <Route path="sign-in" element={<div>Sign In Page</div>} />
            </Route>
            <Route element={<ProtectedRoute />} path="/app">
              <Route index element={<div>Private Shell</div>} />
            </Route>
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText("Private Shell")).toBeInTheDocument());
  });

  it("redirects authenticated users away from public auth pages", async () => {
    const client = {
      auth: {
        getSession: async () => ({
          data: {
            session: {
              user: { id: "550e8400-e29b-41d4-a716-446655440000", email: "ana@empresa.com" },
            },
          },
          error: null,
        }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => undefined } } }),
        signInWithPassword: async () => ({ data: { session: null, user: null }, error: null }),
        signInWithOAuth: async () => ({ data: { provider: "google", url: null }, error: null }),
        signOut: async () => ({ error: null }),
        signUp: async () => ({ data: { session: null, user: null }, error: null }),
      },
    };

    render(
      <MemoryRouter initialEntries={["/auth/sign-in"]}>
        <AuthProvider client={client}>
          <Routes>
            <Route element={<PublicAuthRoute />} path="/auth">
              <Route path="sign-in" element={<div>Sign In Page</div>} />
            </Route>
            <Route element={<ProtectedRoute />} path="/app">
              <Route index element={<div>Private Shell</div>} />
            </Route>
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText("Private Shell")).toBeInTheDocument());
  });
});
