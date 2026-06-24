import { QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Navigate, Route, Routes } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "./AuthProvider";
import { ProtectedRoute } from "./ProtectedRoute";
import { PublicAuthRoute } from "./PublicAuthRoute";
import { useAuthStatus } from "./store/auth-status";
import { createTestQueryClient } from "../../test/mocks/query-client";

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

describe("auth route guards", () => {
  beforeEach(() => {
    mockAxiosInstance.get.mockReset();
    mockAxiosInstance.post.mockReset();
  });

  afterEach(() => {
    useAuthStatus.getState().setStatus("unknown");
  });

  it("redirects unauthenticated users away from protected routes", async () => {
    const queryClient = createTestQueryClient();

    // Pre-seed: no session, unauthenticated
    queryClient.setQueryData(["auth", "session"], null);
    useAuthStatus.setState({ status: "unauthenticated" });

    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <MemoryRouter initialEntries={["/app"]}>
            <Routes>
              <Route element={<PublicAuthRoute />} path="/auth">
                <Route path="sign-in" element={<div>Sign In Page</div>} />
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

    await waitFor(() => expect(screen.getByText("Sign In Page")).toBeInTheDocument());
  });

  it("keeps authenticated users inside the private shell", async () => {
    const queryClient = createTestQueryClient();

    // Pre-seed: authenticated session
    queryClient.setQueryData(["auth", "session"], {
      user: { id: "550e8400-e29b-41d4-a716-446655440000", email: "ana@empresa.com", displayName: null },
      isAdmin: false,
    });
    useAuthStatus.setState({ status: "authenticated" });

    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <MemoryRouter initialEntries={["/app"]}>
            <Routes>
              <Route element={<PublicAuthRoute />} path="/auth">
                <Route path="sign-in" element={<div>Sign In Page</div>} />
              </Route>
              <Route element={<ProtectedRoute />} path="/app">
                <Route index element={<div>Private Shell</div>} />
              </Route>
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      </QueryClientProvider>,
    );

    await waitFor(() => expect(screen.getByText("Private Shell")).toBeInTheDocument());
  });

  it("redirects authenticated users away from public auth pages", async () => {
    const queryClient = createTestQueryClient();

    // Pre-seed: authenticated session
    queryClient.setQueryData(["auth", "session"], {
      user: { id: "550e8400-e29b-41d4-a716-446655440000", email: "ana@empresa.com", displayName: null },
      isAdmin: false,
    });
    useAuthStatus.setState({ status: "authenticated" });

    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <MemoryRouter initialEntries={["/auth/sign-in"]}>
            <Routes>
              <Route element={<PublicAuthRoute />} path="/auth">
                <Route path="sign-in" element={<div>Sign In Page</div>} />
              </Route>
              <Route element={<ProtectedRoute />} path="/app">
                <Route index element={<div>Private Shell</div>} />
              </Route>
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      </QueryClientProvider>,
    );

    await waitFor(() => expect(screen.getByText("Private Shell")).toBeInTheDocument());
  });
});
