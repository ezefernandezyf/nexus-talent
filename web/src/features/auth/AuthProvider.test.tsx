import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "./AuthProvider";
import { useAuth } from "./hooks/useAuth";
import { useAuthStatus } from "./store/auth-status";
import { createTestQueryClient } from "@/test/mocks/query-client";

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

// Shared mock axios instance - configured per test via configureApiMocks()
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

describe("AuthProvider", () => {
  beforeEach(() => {
    mockAxiosInstance.get.mockReset();
    mockAxiosInstance.post.mockReset();
  });

  afterEach(() => {
    useAuthStatus.getState().setStatus("unknown");
  });

  it("boots the session and persists authenticated users after reload", async () => {
    const queryClient = createTestQueryClient();

    // Pre-seed the session cache as if already authenticated
    queryClient.setQueryData(["auth", "session"], {
      user: { id: "550e8400-e29b-41d4-a716-446655440000", email: "ana@empresa.com", displayName: null },
      isAdmin: false,
    });
    useAuthStatus.setState({ status: "authenticated" });

    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AuthProbe />
        </AuthProvider>
      </QueryClientProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("authenticated"));
    expect(screen.getByTestId("admin")).toHaveTextContent("user");
    expect(screen.getByTestId("email")).toHaveTextContent("ana@empresa.com");
  });

  it("syncs password sign-in, sign-up, and sign-out through the shared auth context", async () => {
    const user = userEvent.setup();
    const queryClient = createTestQueryClient();

    // Initial session check → no session (unauthenticated)
    mockAxiosInstance.get.mockResolvedValueOnce({ data: null });

    // Login: POST /auth/login → returns user, then GET /auth/me returns session (after invalidation)
    mockAxiosInstance.post.mockResolvedValueOnce({
      data: { user: { id: "550e8400-e29b-41d4-a716-446655440000", email: "ana@empresa.com", displayName: null } },
    });
    mockAxiosInstance.get.mockResolvedValueOnce({
      data: { user: { id: "550e8400-e29b-41d4-a716-446655440000", email: "ana@empresa.com", displayName: null }, isAdmin: false },
    });

    // Logout: POST /auth/logout → success
    mockAxiosInstance.post.mockResolvedValueOnce({ data: {} });

    // Register: POST /auth/register → success, then GET /auth/me returns new user
    mockAxiosInstance.post.mockResolvedValueOnce({ data: {} });
    mockAxiosInstance.get.mockResolvedValueOnce({
      data: { user: { id: "550e8400-e29b-41d4-a716-446655440001", email: "sofia@empresa.com", displayName: null }, isAdmin: false },
    });

    useAuthStatus.setState({ status: "unauthenticated" });

    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AuthProbe />
        </AuthProvider>
      </QueryClientProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("unauthenticated"));

    // Sign in
    await user.click(screen.getByRole("button", { name: /iniciar sesión/i }));
    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("authenticated"));
    expect(screen.getByTestId("email")).toHaveTextContent("ana@empresa.com");

    // Sign out
    await user.click(screen.getByRole("button", { name: /cerrar sesión/i }));
    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("unauthenticated"));
    expect(screen.getByTestId("email")).toHaveTextContent("no-user");

    // Sign up
    await user.click(screen.getByRole("button", { name: /crear cuenta/i }));
    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("authenticated"));
    expect(screen.getByTestId("email")).toHaveTextContent("sofia@empresa.com");
  });

  it("redirects to the backend OAuth endpoint on sign in with Google", async () => {
    const user = userEvent.setup();
    const queryClient = createTestQueryClient();

    const originalLocation = window.location;
    const mockLocation = { ...originalLocation, href: "" };
    Object.defineProperty(window, "location", {
      value: mockLocation,
      writable: true,
    });

    useAuthStatus.setState({ status: "unauthenticated" });

    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AuthProbe />
        </AuthProvider>
      </QueryClientProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("unauthenticated"));

    await user.click(screen.getByRole("button", { name: /google oauth/i }));

    expect(window.location.href).toBe("https://nexus-talent-api.onrender.com/api/auth/oauth/google");

    Object.defineProperty(window, "location", {
      value: originalLocation,
      writable: true,
    });
  });
});
