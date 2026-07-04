import { createContext, useEffect, type ReactNode } from "react";
import { useSession, type AuthUser } from "./api/useSession";
import { useLogin } from "./api/useLogin";
import { useRegister } from "./api/useRegister";
import { useLogout } from "./api/useLogout";
import { useAuthStatus, AUTH_STATUS, type AuthStatus } from "./store/auth-status";

export type { AuthStatus };

export { AUTH_STATUS };

const AUTH_MESSAGES = {
  SESSION_CHECK_FAILED: "No se pudo validar la sesión.",
} as const;

type AuthActionResponse = {
  success: boolean;
  message: string;
};

interface AuthContextValue {
  errorMessage: string | null;
  isAdmin: boolean;
  isConfigured: boolean;
  session: { user: AuthUser } | null;
  signIn: (email: string, password: string) => Promise<AuthActionResponse>;
  signInWithOAuth: (provider: string) => Promise<AuthActionResponse>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<AuthActionResponse>;
  status: AuthStatus;
  user: AuthUser | null;
  /** @deprecated Kept for settings compatibility. Removed in PR #3. */
  linkIdentity?: (provider: string) => Promise<{ success: boolean; message: string }>;
  /** @deprecated Kept for settings compatibility. Removed in PR #3. */
  unlinkIdentity?: (provider: string) => Promise<{ success: boolean; message: string }>;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps) {
  const { data: sessionData, isLoading } = useSession();
  const { status, setStatus } = useAuthStatus();
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();

  const isDev = import.meta.env.MODE === "development";

  // Sync React Query session state to Zustand status
  useEffect(() => {
    // Dev mode: skip real auth, inject mock user so we can browse all pages
    if (isDev) {
      setStatus("authenticated");
      return;
    }

    if (isLoading) {
      setStatus("loading");
    } else if (sessionData) {
      setStatus("authenticated");
    } else {
      // null data (explicitly cleared), error, or initial undefined → unauthenticated
      setStatus("unauthenticated");
    }
  }, [isLoading, sessionData, setStatus, isDev]);

  // Reset auth status on unmount
  useEffect(() => {
    return () => {
      setStatus("unknown");
    };
    // Run only on mount/unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function signIn(email: string, password: string): Promise<AuthActionResponse> {
    try {
      await loginMutation.mutateAsync({ email, password });
      return { success: true, message: "Sesión iniciada. Redirigiendo al panel privado." };
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo iniciar sesión.";
      throw new Error(message);
    }
  }

  async function signUp(email: string, password: string): Promise<AuthActionResponse> {
    try {
      await registerMutation.mutateAsync({ email, password });
      return { success: true, message: "Cuenta creada y sesión iniciada." };
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo crear la cuenta.";
      throw new Error(message);
    }
  }

  async function signOut(): Promise<void> {
    await logoutMutation.mutateAsync();
  }

  // Redirect directly to Render backend so the state cookie is set on
  // the same domain as the Google callback URL - avoids cookie mismatch.
  const RENDER_BACKEND_URL = "https://nexus-talent-api-svik.onrender.com";

  async function signInWithOAuth(provider: string): Promise<AuthActionResponse> {
    window.location.href = `${RENDER_BACKEND_URL}/api/auth/oauth/${provider}`;
    return { success: true, message: "Redirigiendo..." };
  }

  /** @deprecated Kept for settings compatibility. Removed in PR #3. */
  async function linkIdentityAction(_provider: string): Promise<{ success: boolean; message: string }> {
    throw new Error("Social identity linking is not available in this version.");
  }

  /** @deprecated Kept for settings compatibility. Removed in PR #3. */
  async function unlinkIdentityAction(_provider: string): Promise<{ success: boolean; message: string }> {
    throw new Error("Social identity unlinking is not available in this version.");
  }

  // Dev mode: inject a mock user so ProtectedRoute allows access without real auth
  const user = isDev
    ? { id: "dev-user", email: "dev@nexus.local", displayName: "Dev User" }
    : (sessionData?.user ?? null);
  const isAdmin = isDev || (sessionData?.isAdmin ?? false);

  const value: AuthContextValue = {
    errorMessage: null,
    isAdmin,
    isConfigured: true,
    session: user ? { user } : null,
    signIn,
    signInWithOAuth,
    signOut,
    signUp,
    status,
    user,
    linkIdentity: linkIdentityAction,
    unlinkIdentity: unlinkIdentityAction,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AUTH_MESSAGES };
