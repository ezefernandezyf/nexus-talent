import { create } from "zustand";

export type AuthStatus = "unknown" | "loading" | "authenticated" | "unauthenticated" | "error";

export const AUTH_STATUS = {
  UNKNOWN: "unknown",
  LOADING: "loading",
  AUTHENTICATED: "authenticated",
  UNAUTHENTICATED: "unauthenticated",
  ERROR: "error",
} as const;

interface AuthUIState {
  status: AuthStatus;
  setStatus: (status: AuthStatus) => void;
}

export const useAuthStatus = create<AuthUIState>((set) => ({
  status: "unknown",
  setStatus: (status) => set({ status }),
}));
