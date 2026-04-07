import { MemoryRouter, Navigate, Route, Routes } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import type { Session, User } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import { AuthProvider } from "../AuthProvider";
import { AdminRoute } from "./AdminRoute";
import type { AuthClientLike } from "../../../lib/supabase";

function createUser(email: string, role: "admin" | "authenticated"): User {
  const now = new Date("2026-04-05T12:00:00.000Z").toISOString();

  return {
    aud: "authenticated",
    app_metadata: {},
    created_at: now,
    email,
    email_confirmed_at: now,
    id: "550e8400-e29b-41d4-a716-446655440000",
    identities: [],
    is_anonymous: false,
    last_sign_in_at: now,
    phone: "",
    role: "authenticated",
    updated_at: now,
    user_metadata: { role },
  } as User;
}

function createSession(email: string, role: "admin" | "authenticated"): Session {
  const user = createUser(email, role);

  return {
    access_token: "session-token",
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    expires_in: 3600,
    provider_refresh_token: null,
    provider_token: null,
    refresh_token: "refresh-token",
    token_type: "bearer",
    user,
  } as Session;
}

function createAuthClient(session: Session | null): AuthClientLike {
  let currentSession = session;
  const listeners = new Set<(event: string, nextSession: Session | null) => void>();

  return {
    auth: {
      getSession: vi.fn(async () => ({ data: { session: currentSession }, error: null })),
      onAuthStateChange: vi.fn((callback) => {
        listeners.add(callback);

        return {
          data: {
            subscription: {
              unsubscribe: () => {
                listeners.delete(callback);
              },
            },
          },
        };
      }),
      signInWithPassword: vi.fn(async () => ({ data: { session: currentSession, user: currentSession?.user ?? null }, error: null })),
      signOut: vi.fn(async () => ({ error: null })),
      signUp: vi.fn(async () => ({ data: { session: currentSession, user: currentSession?.user ?? null }, error: null })),
    },
  };
}

describe("AdminRoute", () => {
  it("redirects standard users to the private app shell", async () => {
    const client = createAuthClient(createSession("ana@empresa.com", "authenticated"));

    render(
      <MemoryRouter initialEntries={["/app/admin/settings"]}>
        <AuthProvider client={client}>
          <Routes>
            <Route element={<AdminRoute />} path="/app/admin">
              <Route path="settings" element={<div>Admin Settings</div>} />
            </Route>
            <Route path="/app" element={<div>Private App</div>} />
            <Route path="*" element={<Navigate replace to="/" />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText("Private App")).toBeInTheDocument());
  });

  it("allows admin users to access settings", async () => {
    const client = createAuthClient(createSession("admin@empresa.com", "admin"));

    render(
      <MemoryRouter initialEntries={["/app/admin/settings"]}>
        <AuthProvider client={client}>
          <Routes>
            <Route element={<AdminRoute />} path="/app/admin">
              <Route path="settings" element={<div>Admin Settings</div>} />
            </Route>
            <Route path="/app" element={<div>Private App</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText("Admin Settings")).toBeInTheDocument());
  });
});
