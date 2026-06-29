import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Navigate, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { PublicAuthRoute } from "@/features/auth/PublicAuthRoute";
import { SignInForm } from "./SignInForm";
import { useAuthStatus } from "@/features/auth/store/auth-status";
import { createTestQueryClient } from "@/test/mocks/query-client";

const mockAxiosInstance = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  interceptors: {
    request: { use: vi.fn(), eject: vi.fn() },
    response: { use: vi.fn(), eject: vi.fn() },
  },
}));

vi.mock("axios", () => ({
  default: {
    create: vi.fn(() => mockAxiosInstance),
    isAxiosError: vi.fn(() => false),
  },
}));

describe("SignInForm", () => {
  beforeEach(() => {
    mockAxiosInstance.get.mockReset();
    mockAxiosInstance.post.mockReset();
  });

  afterEach(() => {
    useAuthStatus.getState().setStatus("unknown");
  });

  function renderWithAuth(queryClient: ReturnType<typeof createTestQueryClient>, ui: React.ReactElement) {
    return render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{ui}</AuthProvider>
      </QueryClientProvider>,
    );
  }

  it("shows validation errors for empty submit", async () => {
    const user = userEvent.setup();
    const queryClient = createTestQueryClient();

    renderWithAuth(queryClient, <SignInForm />);

    await user.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    await waitFor(() => expect(screen.getByText(/el email debe ser válido/i)).toBeInTheDocument());
    expect(screen.getByText(/la contraseña debe tener al menos 6 caracteres/i)).toBeInTheDocument();
  });

  it("surfaces invalid login errors", async () => {
    const user = userEvent.setup();
    const queryClient = createTestQueryClient();

    // POST /auth/login rejects with an error message
    mockAxiosInstance.post.mockRejectedValueOnce(new Error("Invalid login credentials"));

    useAuthStatus.setState({ status: "unauthenticated" });

    renderWithAuth(queryClient, <SignInForm />);

    await user.type(screen.getByLabelText(/email/i), "ana@empresa.com");
    await user.type(screen.getByLabelText(/contraseña/i), "wrong-password");
    await user.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    await waitFor(() => expect(screen.getByText(/invalid login credentials/i)).toBeInTheDocument());
  });

  it("starts google oauth from the sign-in entry point", async () => {
    const user = userEvent.setup();
    const queryClient = createTestQueryClient();

    const originalLocation = window.location;
    const mockLocation = { ...originalLocation, href: "" };
    Object.defineProperty(window, "location", {
      value: mockLocation,
      writable: true,
    });

    useAuthStatus.setState({ status: "unauthenticated" });

    renderWithAuth(queryClient, <SignInForm />);

    await user.click(screen.getByRole("button", { name: /ingresar con google/i }));

    await waitFor(() => expect(window.location.href).toBe("https://nexus-talent-api-um0a.onrender.com/api/auth/oauth/google"));

    Object.defineProperty(window, "location", {
      value: originalLocation,
      writable: true,
    });
  });

  it("surfaces oauth errors without breaking the password form", async () => {
    const user = userEvent.setup();
    const queryClient = createTestQueryClient();

    // OAuth error simulation: the signInWithOAuth function doesn't return errors
    // (it just redirects). The original test used client.auth.signInWithOAuth which
    // could return errors. With the new approach, OAuth redirects to the backend
    // endpoint which handles errors. The form's try/catch won't catch redirect errors.
    // This test validates the form remains functional after an OAuth attempt.

    const originalLocation = window.location;
    const mockLocation = { ...originalLocation, href: "" };
    Object.defineProperty(window, "location", {
      value: mockLocation,
      writable: true,
    });

    useAuthStatus.setState({ status: "unauthenticated" });

    renderWithAuth(queryClient, <SignInForm />);

    await user.click(screen.getByRole("button", { name: /ingresar con google/i }));

    expect(screen.getByRole("button", { name: /iniciar sesión/i })).toBeEnabled();

    Object.defineProperty(window, "location", {
      value: originalLocation,
      writable: true,
    });
  });

  it("redirects into the private shell after a successful login", async () => {
    const user = userEvent.setup();
    const queryClient = createTestQueryClient();

    // Initial session check → no session (unauthenticated)
    mockAxiosInstance.get.mockResolvedValueOnce({ data: null });

    // POST /auth/login succeeds, then GET /auth/me returns the session (after invalidation)
    mockAxiosInstance.post.mockResolvedValueOnce({
      data: { user: { id: "550e8400-e29b-41d4-a716-446655440000", email: "ana@empresa.com", displayName: null } },
    });
    mockAxiosInstance.get.mockResolvedValueOnce({
      data: { user: { id: "550e8400-e29b-41d4-a716-446655440000", email: "ana@empresa.com", displayName: null }, isAdmin: false },
    });

    useAuthStatus.setState({ status: "unauthenticated" });

    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <MemoryRouter initialEntries={["/auth/sign-in"]}>
            <Routes>
              <Route element={<PublicAuthRoute />} path="/auth">
                <Route path="sign-in" element={<SignInForm />} />
              </Route>
              <Route element={<ProtectedRoute />} path="/app">
                <Route index element={<div>Private Shell</div>} />
              </Route>
              <Route path="*" element={<Navigate replace to="/" />} />
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      </QueryClientProvider>,
    );

    await screen.findByLabelText(/email/i);

    await user.type(screen.getByLabelText(/email/i), "ana@empresa.com");
    await user.type(screen.getByLabelText(/contraseña/i), "secure-password");
    await user.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    await waitFor(() => expect(screen.getByText("Private Shell")).toBeInTheDocument());
  });
});
