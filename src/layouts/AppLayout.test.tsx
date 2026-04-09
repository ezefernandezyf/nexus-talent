import { QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AppLayout } from "./AppLayout";
import { AuthProvider } from "../features/auth";
import { createTestQueryClient } from "../test/mocks/query-client";

function createAuthClient() {
  return {
    auth: {
      getSession: vi.fn(async () => ({ data: { session: null }, error: null })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      signInWithPassword: vi.fn(async () => ({ data: { session: null, user: null }, error: null })),
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
    expect(screen.getByRole("link", { name: "Nexus Talent" })).toHaveAttribute("href", "/app/analysis");
    expect(screen.getByRole("link", { name: /nuevo análisis/i })).toHaveAttribute("href", "/app/analysis");
    expect(screen.getByRole("link", { name: /iniciar sesión/i })).toHaveAttribute("href", "/auth/sign-in");
    expect(screen.getByText("© 2026 Nexus Talent — Precision Recruiting Layer")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /abrir menú/i }));
    const drawer = screen.getByRole("dialog", { name: "Nexus Talent" });
    expect(within(drawer).getByRole("link", { name: "Análisis" })).toHaveAttribute("href", "/app/analysis");

    await user.click(within(drawer).getByRole("link", { name: "Historial" }));
    expect(screen.queryByRole("dialog", { name: "Nexus Talent" })).not.toBeInTheDocument();
  });
});
