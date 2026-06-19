import { create } from "zustand";

export interface AuthUser {
  id: string;
  email: string;
  displayName: string | null;
}

export type AuthStatus = "unknown" | "loading" | "authenticated" | "unauthenticated";

export const AUTH_STATUS = {
  UNKNOWN: "unknown",
  LOADING: "loading",
  AUTHENTICATED: "authenticated",
  UNAUTHENTICATED: "unauthenticated",
} as const;

interface AuthState {
  user: AuthUser | null;
  status: AuthStatus;
  isAdmin: boolean;
  restoreSession: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: "unknown",
  isAdmin: false,

  restoreSession: async () => {
    set({ status: "loading" });

    try {
      const response = await fetch("/api/auth/me", { credentials: "include" });

      if (response.ok) {
        const data = await response.json() as { user?: AuthUser } | AuthUser;
        const user = "user" in data ? data.user : data;

        set({
          user: user ?? null,
          status: user ? "authenticated" : "unauthenticated",
        });
      } else if (response.status === 401) {
        set({ user: null, status: "unauthenticated" });
      } else {
        set({ status: "unknown" });
      }
    } catch {
      // Network error — revert to unknown
      set({ status: "unknown" });
    }
  },

  login: async (email, password) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), password }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({})) as { error?: string };
      throw new Error(body.error ?? "No se pudo iniciar sesión.");
    }

    const data = await response.json() as { user?: AuthUser } | AuthUser;
    const user = "user" in data ? data.user : data;

    set({ user: user ?? null, status: "authenticated" });
  },

  register: async (email, password, displayName) => {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), password, displayName }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({})) as { error?: string };
      throw new Error(body.error ?? "No se pudo crear la cuenta.");
    }

    const data = await response.json() as { user?: AuthUser } | AuthUser;
    const user = "user" in data ? data.user : data;

    set({ user: user ?? null, status: "authenticated" });
  },

  logout: async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    set({ user: null, status: "unauthenticated" });
  },

  clearSession: () => {
    set({ user: null, status: "unauthenticated" });
  },
}));
