import { QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "../features/auth";
import { useAuthStatus } from "../features/auth/store/auth-status";
import { ThemeProvider } from "../lib/theme";
import { createTestQueryClient } from "../test/mocks/query-client";
import { SettingsPage } from "./SettingsPage";

// Shared mock axios instance
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

describe("SettingsPage", () => {
  afterEach(() => {
    useAuthStatus.getState().setStatus("unknown");
  });

  it("renders the user-facing settings shell and top-level actions", async () => {
    const queryClient = createTestQueryClient();

    // Pre-seed the session cache as if already authenticated
    queryClient.setQueryData(["auth", "session"], {
      user: {
        id: "user-1",
        email: "analyst@nexustalent.dev",
        displayName: "Marcus Sterling",
        user_metadata: {
          display_name: "Marcus Sterling",
          location: "San Francisco, CA",
        },
        identities: [{ provider: "github" }],
        app_metadata: { provider: "github" },
      },
      isAdmin: false,
    });
    useAuthStatus.setState({ status: "authenticated" });
    localStorage.setItem("nexus-talent:theme:v1", "dark");

    render(
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <MemoryRouter>
              <SettingsPage />
            </MemoryRouter>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>,
    );

    await waitFor(() => expect(screen.getByRole("heading", { name: "Configuración" })).toBeInTheDocument());
    expect(screen.getByRole("button", { name: /tema claro/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /exportar datos/i })).toBeInTheDocument();
    expect(screen.getByText(/información de la cuenta/i)).toBeInTheDocument();
    expect(screen.getByText(/cuentas vinculadas/i)).toBeInTheDocument();
    expect(screen.getByText(/zona de peligro/i )).toBeInTheDocument();
  });
});