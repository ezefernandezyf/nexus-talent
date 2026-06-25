import { QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import axios from "axios";
import { ANALYSIS_HISTORY_STORAGE_KEY } from "../../features/analysis/api/repository";
import { useAuthStatus } from "../../features/auth/store/auth-status";
import { createSavedAnalysis } from "../../test/factories/analysis";
import { AppLayout } from "./AppLayout";
import { AuthProvider } from "../../features/auth";
import { createTestQueryClient } from "../../test/mocks/query-client";

// ---------------------------------------------------------------------------
// Axios mock — hooks now use HTTP repo instead of localStorage
// ---------------------------------------------------------------------------

const mockAxiosInstance = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
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

function renderAppLayout(
  queryClient: ReturnType<typeof createTestQueryClient>,
  options: { initialEntry?: string } = {},
) {
  const { initialEntry = "/app/analysis" } = options;

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter initialEntries={[initialEntry]}>
          <Routes>
            <Route element={<AppLayout />} path="/app">
              <Route path="analysis" element={<div>Analysis Content</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>,
  );
}

describe("AppLayout", () => {
  beforeEach(() => {
    mockAxiosInstance.get.mockReset();
    mockAxiosInstance.post.mockReset();
    mockAxiosInstance.patch.mockReset();
    mockAxiosInstance.delete.mockReset();

    // Default axios mock: empty analysis list for sidebar
    mockAxiosInstance.get.mockResolvedValue({ data: { items: [], total: 0 } });
  });

  it("renders the shared shell and outlet content for public users", async () => {
    const queryClient = createTestQueryClient();

    // Pre-seed: no session, unauthenticated
    queryClient.setQueryData(["auth", "session"], null);
    useAuthStatus.setState({ status: "unauthenticated" });

    const user = userEvent.setup();
    const savedAnalysis = createSavedAnalysis({
      id: "550e8400-e29b-41d4-a716-446655440000",
      jobDescription: "Frontend Lead\nBuild resilient interfaces",
    });

    localStorage.setItem(ANALYSIS_HISTORY_STORAGE_KEY, JSON.stringify([savedAnalysis]));

    // Configure axios to return the saved analysis in the sidebar
    mockAxiosInstance.get.mockResolvedValue({ data: { items: [savedAnalysis], total: 1 } });

    renderAppLayout(queryClient);

    await waitFor(() => expect(screen.getByText("Analysis Content")).toBeInTheDocument());
    expect(screen.getByRole("link", { name: "Nexus Talent" })).toHaveAttribute("href", "/");
    expect(within(screen.getByLabelText(/app primary navigation/i)).getByRole("link", { name: /análisis/i })).toHaveAttribute("href", "/app/analysis");
    expect(within(screen.getByLabelText(/app primary navigation/i)).getByRole("link", { name: /historial/i })).toHaveAttribute("href", "/app/history");
    expect(within(screen.getByLabelText(/app primary navigation/i)).queryByRole("link", { name: /settings/i })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /nuevo análisis/i })).toHaveAttribute("href", "/app/analysis");
    expect(screen.queryByText("© 2026 Nexus Talent — Precision Recruiting Layer")).not.toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByRole("link", { name: /abrir detalle de frontend lead/i })).toHaveAttribute(
        "href",
        "/app/history/550e8400-e29b-41d4-a716-446655440000",
      ),
    );

    await user.click(screen.getByRole("button", { name: /abrir menú/i }));
    const drawer = screen.getByRole("dialog", { name: "Nexus Talent" });
    expect(within(drawer).getByRole("link", { name: "Análisis" })).toHaveAttribute("href", "/app/analysis");
    expect(within(drawer).queryByRole("link", { name: "Settings" })).not.toBeInTheDocument();

    await user.click(within(drawer).getByRole("link", { name: "Historial" }));
    expect(screen.queryByRole("dialog", { name: "Nexus Talent" })).not.toBeInTheDocument();
  });

  it("renders the authenticated shell copy for signed-in users", async () => {
    const queryClient = createTestQueryClient();
    const user = userEvent.setup();

    // Pre-seed: authenticated session
    queryClient.setQueryData(["auth", "session"], {
      user: { id: "550e8400-e29b-41d4-a716-446655440000", email: "analyst@nexustalent.dev", displayName: null },
      isAdmin: false,
    });
    useAuthStatus.setState({ status: "authenticated" });

    renderAppLayout(queryClient);

    await user.click(screen.getByRole("button", { name: /abrir menú/i }));
    const drawer = screen.getByRole("dialog", { name: "Nexus Talent" });
    expect(within(drawer).getByText(/analyst@nexustalent.dev/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /abrir acciones de cuenta/i }));
    const accountActions = screen.getByLabelText("Acciones de cuenta");
    expect(within(accountActions).getByRole("link", { name: /settings/i })).toHaveAttribute("href", "/app/settings");
    expect(within(accountActions).getByRole("button", { name: /cerrar sesión/i })).toBeInTheDocument();
  });

  it("shows settings only for authenticated users", async () => {
    const queryClient = createTestQueryClient();
    const user = userEvent.setup();

    // Pre-seed: authenticated session
    queryClient.setQueryData(["auth", "session"], {
      user: { id: "550e8400-e29b-41d4-a716-446655440000", email: "analyst@nexustalent.dev", displayName: null },
      isAdmin: false,
    });
    useAuthStatus.setState({ status: "authenticated" });

    renderAppLayout(queryClient);

    await waitFor(() => expect(screen.getByRole("button", { name: /abrir acciones de cuenta/i })).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /abrir acciones de cuenta/i }));

    const accountActions = screen.getByLabelText("Acciones de cuenta");
    expect(within(accountActions).getByRole("link", { name: /settings/i })).toHaveAttribute("href", "/app/settings");
  });

  it("persists the theme toggle across reloads", async () => {
    const queryClient = createTestQueryClient();
    const user = userEvent.setup();

    localStorage.clear();

    // Pre-seed: no session
    queryClient.setQueryData(["auth", "session"], null);
    useAuthStatus.setState({ status: "unauthenticated" });

    const firstRender = renderAppLayout(queryClient);

    await waitFor(() => expect(screen.getByRole("button", { name: /cambiar a tema claro/i })).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /cambiar a tema claro/i }));

    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(localStorage.getItem("nexus-talent:theme:v1")).toBe("light");

    firstRender.unmount();

    const queryClient2 = createTestQueryClient();
    queryClient2.setQueryData(["auth", "session"], null);
    useAuthStatus.setState({ status: "unauthenticated" });

    renderAppLayout(queryClient2);

    await waitFor(() => expect(document.documentElement.getAttribute("data-theme")).toBe("light"));
    expect(screen.getByRole("button", { name: /cambiar a tema oscuro/i })).toBeInTheDocument();
  });
});
