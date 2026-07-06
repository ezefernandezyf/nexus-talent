import { QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "@/features/auth";
import { useAuthStatus } from "@/features/auth/store/auth-status";
import { ThemeProvider } from "@/core/theme";
import { createTestQueryClient } from "@/test/mocks/query-client";
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

function createRenderer() {
  const queryClient = createTestQueryClient();
  const ui = (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <MemoryRouter>
            <SettingsPage />
          </MemoryRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
  return { queryClient, ui };
}

describe("SettingsPage", () => {
  afterEach(() => {
    useAuthStatus.getState().setStatus("unknown");
    localStorage.removeItem("nexus-talent:theme:v1");
  });

  it("renders the skeleton when auth status is loading", () => {
    useAuthStatus.setState({ status: "loading" });
    const { ui } = createRenderer();
    render(ui);
    // Eyebrow and heading should not be in the document during loading
    expect(screen.queryByText("Settings")).not.toBeInTheDocument();
  });

  it("renders the user-facing settings shell and top-level actions", async () => {
    const { queryClient, ui } = createRenderer();

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

    render(ui);

    await waitFor(() => expect(screen.getByText("Settings")).toBeInTheDocument());
    expect(screen.getByText("Configuración")).toBeInTheDocument();
    // 3 numbered cards should be present
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText("02")).toBeInTheDocument();
    expect(screen.getByText("03")).toBeInTheDocument();
    expect(screen.getByText("Account")).toBeInTheDocument();
    expect(screen.getByText("Appearance")).toBeInTheDocument();
    expect(screen.getByText("Data")).toBeInTheDocument();
  });
});
