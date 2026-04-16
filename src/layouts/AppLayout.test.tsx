import { QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AppLayout } from "./AppLayout";
import { AuthProvider } from "../features/auth";
import { createTestQueryClient } from "../test/mocks/query-client";

function createAuthClient(session: { user: { email?: string } } | null = null) {
  return {
    auth: {
      getSession: vi.fn(async () => ({ data: { session }, error: null })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      signInWithPassword: vi.fn(async () => ({ data: { session: null, user: null }, error: null })),
      signInWithOAuth: vi.fn(async () => ({ data: { provider: "github", url: null }, error: null })),
      signOut: vi.fn(async () => ({ error: null })),
      signUp: vi.fn(async () => ({ data: { session: null, user: null }, error: null })),
    },
  };
}

describe("AppLayout", () => {
  it("renders the shared shell and outlet content for public users", async () => {
    const queryClient = createTestQueryClient();
    const user = userEvent.setup();

    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider client={createAuthClient()}>
          <MemoryRouter initialEntries={["/app/analysis"]}>
            <Routes>
              <Route element={<AppLayout />} path="/app">
                <Route path="analysis" element={<div>Analysis Content</div>} />
              </Route>
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      </QueryClientProvider>,
    );

    await waitFor(() => expect(screen.getByText("Analysis Content")).toBeInTheDocument());
  expect(screen.getByRole("link", { name: "Nexus Talent" })).toHaveAttribute("href", "/");
  expect(within(screen.getByLabelText(/app primary navigation/i)).getByRole("link", { name: /análisis/i })).toHaveAttribute("href", "/app/analysis");
  expect(within(screen.getByLabelText(/app primary navigation/i)).getByRole("link", { name: /historial/i })).toHaveAttribute("href", "/app/history");
  expect(within(screen.getByLabelText(/app primary navigation/i)).getByRole("link", { name: /settings/i })).toHaveAttribute("href", "/app/admin/settings");
    expect(screen.getByRole("link", { name: /nuevo análisis/i })).toHaveAttribute("href", "/app/analysis");
    expect(screen.queryByText("© 2026 Nexus Talent — Precision Recruiting Layer")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /abrir menú/i }));
    const drawer = screen.getByRole("dialog", { name: "Nexus Talent" });
    expect(within(drawer).getByRole("link", { name: "Análisis" })).toHaveAttribute("href", "/app/analysis");

    await user.click(within(drawer).getByRole("link", { name: "Historial" }));
    expect(screen.queryByRole("dialog", { name: "Nexus Talent" })).not.toBeInTheDocument();
  });

  it("renders the authenticated shell copy for signed-in users", async () => {
    const queryClient = createTestQueryClient();
    const user = userEvent.setup();

    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider client={createAuthClient({ user: { email: "analyst@nexustalent.dev" } })}>
          <MemoryRouter initialEntries={["/app/analysis"]}>
            <Routes>
              <Route element={<AppLayout />} path="/app">
                <Route path="analysis" element={<div>Analysis Content</div>} />
              </Route>
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      </QueryClientProvider>,
    );

    await user.click(screen.getByRole("button", { name: /abrir menú/i }));
    const drawer = screen.getByRole("dialog", { name: "Nexus Talent" });
    expect(within(drawer).getByText(/analyst@nexustalent.dev/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /abrir acciones de cuenta/i }));
    const accountActions = screen.getByLabelText("Acciones de cuenta");
    expect(within(accountActions).getByRole("link", { name: /settings/i })).toHaveAttribute("href", "/app/admin/settings");
    expect(within(accountActions).getByRole("button", { name: /cerrar sesión/i })).toBeInTheDocument();
  });

  it("persists the theme toggle across reloads", async () => {
    const queryClient = createTestQueryClient();
    const user = userEvent.setup();

    localStorage.clear();

    const firstRender = render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider client={createAuthClient()}>
          <MemoryRouter initialEntries={["/app/analysis"]}>
            <Routes>
              <Route element={<AppLayout />} path="/app">
                <Route path="analysis" element={<div>Analysis Content</div>} />
              </Route>
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      </QueryClientProvider>,
    );

    await waitFor(() => expect(screen.getByRole("button", { name: /cambiar a tema claro/i })).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /cambiar a tema claro/i }));

    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(localStorage.getItem("nexus-talent:theme:v1")).toBe("light");

    firstRender.unmount();

    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider client={createAuthClient()}>
          <MemoryRouter initialEntries={["/app/analysis"]}>
            <Routes>
              <Route element={<AppLayout />} path="/app">
                <Route path="analysis" element={<div>Analysis Content</div>} />
              </Route>
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      </QueryClientProvider>,
    );

    await waitFor(() => expect(document.documentElement.getAttribute("data-theme")).toBe("light"));
    expect(screen.getByRole("button", { name: /cambiar a tema oscuro/i })).toBeInTheDocument();
  });
});
