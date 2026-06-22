import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Navigate, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "../AuthProvider";
import { ProtectedRoute } from "../ProtectedRoute";
import { PublicAuthRoute } from "../PublicAuthRoute";
import { SignUpForm } from "./SignUpForm";
import { useAuthStatus } from "../store/auth-status";
import { createTestQueryClient } from "../../../test/mocks/query-client";

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

describe("SignUpForm", () => {
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

    renderWithAuth(queryClient, <SignUpForm />);

    await user.click(screen.getByRole("button", { name: /crear cuenta/i }));

    await waitFor(() => expect(screen.getByText(/el email debe ser válido/i)).toBeInTheDocument());
    expect(screen.getByText(/la contraseña debe tener al menos 6 caracteres/i)).toBeInTheDocument();
    expect(screen.getByText(/la confirmación de contraseña debe tener al menos 6 caracteres/i)).toBeInTheDocument();
  });

  it("blocks signup when the passwords do not match", async () => {
    const user = userEvent.setup();
    const queryClient = createTestQueryClient();

    renderWithAuth(queryClient, <SignUpForm />);

    await user.type(screen.getByLabelText(/email/i), "ana@empresa.com");
    await user.type(screen.getByLabelText(/^contraseña$/i), "secure-password");
    await user.type(screen.getByLabelText(/confirmar contraseña/i), "different-password");
    await user.click(screen.getByRole("button", { name: /crear cuenta/i }));

    await waitFor(() => expect(screen.getByText(/las contraseñas deben coincidir/i)).toBeInTheDocument());
    // The signUp mutation should NOT be called (form validation prevents it)
    expect(mockAxiosInstance.post).not.toHaveBeenCalled();
  });

  it("surfaces existing-email signup errors", async () => {
    const user = userEvent.setup();
    const queryClient = createTestQueryClient();

    // POST /auth/register rejects with an error
    mockAxiosInstance.post.mockRejectedValueOnce(new Error("User already registered"));

    useAuthStatus.setState({ status: "unauthenticated" });

    renderWithAuth(queryClient, <SignUpForm />);

    await user.type(screen.getByLabelText(/email/i), "ana@empresa.com");
    await user.type(screen.getByLabelText(/^contraseña$/i), "secure-password");
    await user.type(screen.getByLabelText(/confirmar contraseña/i), "secure-password");
    await user.click(screen.getByRole("button", { name: /crear cuenta/i }));

    await waitFor(() => expect(screen.getByText(/user already registered/i)).toBeInTheDocument());
  });

  it("starts google oauth from the sign-up entry point", async () => {
    const user = userEvent.setup();
    const queryClient = createTestQueryClient();

    const originalLocation = window.location;
    const mockLocation = { ...originalLocation, href: "" };
    Object.defineProperty(window, "location", {
      value: mockLocation,
      writable: true,
    });

    useAuthStatus.setState({ status: "unauthenticated" });

    renderWithAuth(queryClient, <SignUpForm />);

    await user.click(screen.getByRole("button", { name: /continuar con google/i }));

    await waitFor(() => expect(window.location.href).toBe("/api/auth/oauth/google"));

    Object.defineProperty(window, "location", {
      value: originalLocation,
      writable: true,
    });
  });

  it("redirects into the private shell after a successful signup", async () => {
    const user = userEvent.setup();
    const queryClient = createTestQueryClient();

    // Initial session check → no session (unauthenticated)
    mockAxiosInstance.get.mockResolvedValueOnce({ data: null });

    // POST /auth/register succeeds, then GET /auth/me returns the session
    mockAxiosInstance.post.mockResolvedValueOnce({ data: {} });
    mockAxiosInstance.get.mockResolvedValueOnce({
      data: { user: { id: "550e8400-e29b-41d4-a716-446655440000", email: "ana@empresa.com", displayName: null }, isAdmin: false },
    });

    useAuthStatus.setState({ status: "unauthenticated" });

    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <MemoryRouter initialEntries={["/auth/sign-up"]}>
            <Routes>
              <Route element={<PublicAuthRoute />} path="/auth">
                <Route path="sign-up" element={<SignUpForm />} />
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
    await user.type(screen.getByLabelText(/^contraseña$/i), "secure-password");
    await user.type(screen.getByLabelText(/confirmar contraseña/i), "secure-password");
    await user.click(screen.getByRole("button", { name: /crear cuenta/i }));

    await waitFor(() => expect(screen.getByText("Private Shell")).toBeInTheDocument());
  });
});
