import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { AuthProvider } from "../AuthProvider";
import { AuthShell } from "./AuthShell";

function createAuthClient() {
  return {
    auth: {
      getSession: vi.fn(async () => ({ data: { session: null }, error: null })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      signInWithPassword: vi.fn(async () => ({ data: { session: null, user: null }, error: null })),
      signInWithOAuth: vi.fn(async () => ({ data: { provider: "github", url: null }, error: null })),
      signOut: vi.fn(async () => ({ error: null })),
      signUp: vi.fn(async () => ({ data: { session: null, user: null }, error: null })),
    },
  };
}

describe("AuthShell", () => {
  it("does not render the placeholder help outline text", () => {
    render(
      <MemoryRouter>
        <AuthProvider client={createAuthClient() as never}>
          <AuthShell mode="sign-in">
            <div>Contenido</div>
          </AuthShell>
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(screen.getByText(/^Nexus Talent$/)).toBeInTheDocument();
    expect(screen.queryByText(/help_outline/i)).not.toBeInTheDocument();
  });
});