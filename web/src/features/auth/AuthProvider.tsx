import { createContext, useCallback, useEffect, useState, type ReactNode } from "react";
import { useAuthStore, AUTH_STATUS, type AuthUser, type AuthStatus } from "../../auth/auth-store";

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
  user: (AuthUser & { user_metadata?: Record<string, unknown>; app_metadata?: Record<string, unknown>; identities?: unknown[] }) | null;
  /** @deprecated Kept for settings compatibility. Removed in PR #3. */
  linkIdentity?: (provider: string) => Promise<{ success: boolean; message: string }>;
  /** @deprecated Kept for settings compatibility. Removed in PR #3. */
  unlinkIdentity?: (provider: string) => Promise<{ success: boolean; message: string }>;
}

interface AuthProviderProps {
  children: ReactNode;
  /** @deprecated Legacy client mock for test compatibility. Not used in production. */
  client?: {
    auth: {
      getSession: () => Promise<{ data: { session: Record<string, unknown> | null }; error: { message: string } | null }>;
      onAuthStateChange: (cb: (event: string, session: Record<string, unknown> | null) => void) => {
        data: { subscription: { unsubscribe: () => void } };
      };
      signInWithPassword: (creds: { email: string; password: string }) => Promise<{ data: Record<string, unknown>; error: { message: string } | null }>;
      signInWithOAuth: (opts: { options?: { redirectTo?: string }; provider: string }) => Promise<{ data: Record<string, unknown>; error: { message: string } | null }>;
      signOut: () => Promise<{ error: { message: string } | null }>;
      signUp: (creds: { email: string; password: string }) => Promise<{ data: Record<string, unknown>; error: { message: string } | null }>;
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } | null;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }
  return fallback;
}

function extractUser(session: Record<string, unknown> | null): {
  user: (AuthUser & { user_metadata?: Record<string, unknown>; app_metadata?: Record<string, unknown>; identities?: unknown[] }) | null;
  isAdmin: boolean;
} {
  if (!session) {
    return { user: null, isAdmin: false };
  }

  const sessionUser = session.user as Record<string, unknown> | undefined;

  if (!sessionUser) {
    return { user: null, isAdmin: false };
  }

  const meta = sessionUser.user_metadata as Record<string, unknown> | null | undefined;

  const displayName = (sessionUser.displayName as string | null)
    ?? (meta?.["displayName" as never] as string | null)
    ?? (meta?.["display_name" as never] as string | null)
    ?? (meta?.["full_name" as never] as string | null)
    ?? (meta?.["name" as never] as string | null)
    ?? null;

  const user = {
    id: String(sessionUser.id ?? ""),
    email: String(sessionUser.email ?? ""),
    displayName,
    user_metadata: (meta ?? {}),
    app_metadata: (sessionUser.app_metadata as Record<string, unknown> ?? {}),
    identities: (sessionUser.identities as unknown[] ?? []),
  };

  const role = (meta?.["role" as never] as string | undefined)
    ?? (sessionUser.app_metadata as Record<string, unknown> | null)?.["role" as never] as string | undefined;

  return { user, isAdmin: role === "admin" };
}

export function AuthProvider({ children, client }: AuthProviderProps) {
  // Individual selectors to avoid creating new object references each render
  const storeUser = useAuthStore((s) => s.user);
  const storeStatus = useAuthStore((s) => s.status);
  const storeIsAdmin = useAuthStore((s) => s.isAdmin);
  const restoreSessionAction = useAuthStore((s) => s.restoreSession);
  const loginAction = useAuthStore((s) => s.login);
  const registerAction = useAuthStore((s) => s.register);
  const logoutAction = useAuthStore((s) => s.logout);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // On mount: hydrate the store
  useEffect(() => {
    let isActive = true;

    if (client) {
      // Legacy mode: hydrate from client mock (test compatibility)
      client.auth
        .getSession()
        .then(({ data, error }) => {
          if (!isActive) return;

          if (error) {
            setErrorMessage(getErrorMessage(error, AUTH_MESSAGES.SESSION_CHECK_FAILED));
            useAuthStore.setState({ user: null, status: "unauthenticated", isAdmin: false });
            return;
          }

          const { user, isAdmin } = extractUser(data.session as Record<string, unknown> | null);

          if (user) {
            useAuthStore.setState({ user, status: "authenticated", isAdmin });
          } else {
            useAuthStore.setState({ user: null, status: "unauthenticated", isAdmin: false });
          }
        })
        .catch((error: unknown) => {
          if (!isActive) return;
          setErrorMessage(getErrorMessage(error, AUTH_MESSAGES.SESSION_CHECK_FAILED));
          useAuthStore.setState({ user: null, status: "unauthenticated", isAdmin: false });
        });

      // Listen for auth state changes from client
      const { data } = client.auth.onAuthStateChange((_event, nextSession) => {
        if (!isActive) return;
        const { user, isAdmin } = extractUser(nextSession as Record<string, unknown> | null);

        if (user) {
          useAuthStore.setState({ user, status: "authenticated", isAdmin });
          setErrorMessage(null);
        } else {
          useAuthStore.setState({ user: null, status: "unauthenticated", isAdmin: false });
          setErrorMessage(null);
        }
      });

      return () => {
        isActive = false;
        data.subscription.unsubscribe();
      };
    } else {
      // Production mode: use Zustand store
      restoreSessionAction();
    }
  }, [client, restoreSessionAction]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      setErrorMessage(null);

      if (client) {
        const { data, error } = await client.auth.signInWithPassword({ email: email.trim(), password });

        if (error) {
          throw new Error(error.message);
        }

        const { user, isAdmin } = extractUser(data.session as Record<string, unknown> | null);

        if (user) {
          useAuthStore.setState({ user, status: "authenticated", isAdmin });
        }

        setErrorMessage(null);
        return { success: true, message: "Sesión iniciada. Redirigiendo al panel privado." };
      }

      // Production: use Zustand store
      await loginAction(email, password);

      return { success: true, message: "Sesión iniciada. Redirigiendo al panel privado." };
    },
    [client, loginAction],
  );

  const signUp = useCallback(
    async (email: string, password: string) => {
      setErrorMessage(null);

      if (client) {
        const { data, error } = await client.auth.signUp({ email: email.trim(), password });

        if (error) {
          throw new Error(error.message);
        }

        const { user, isAdmin } = extractUser(data.session as Record<string, unknown> | null);

        if (user) {
          useAuthStore.setState({ user, status: "authenticated", isAdmin });
          setErrorMessage(null);
          return { success: true, message: "Cuenta creada y sesión iniciada." };
        }

        return { success: true, message: "Cuenta creada. Revisá tu correo para confirmar el acceso." };
      }

      // Production: use Zustand store
      await registerAction(email, password);

      return { success: true, message: "Cuenta creada y sesión iniciada." };
    },
    [client, registerAction],
  );

  const signOut = useCallback(async () => {
    setErrorMessage(null);

    if (client) {
      const { error } = await client.auth.signOut();

      if (error) {
        throw new Error(error.message);
      }

      useAuthStore.setState({ user: null, status: "unauthenticated", isAdmin: false });
      setErrorMessage(null);
      return;
    }

    // Production: use Zustand store
    await logoutAction();
  }, [client, logoutAction]);

  const signInWithOAuth = useCallback(
    async (provider: string) => {
      if (client) {
        const providerConfig = provider === "google" ? { label: "Google", provider: "google" as const } : { label: "GitHub", provider: provider as "github" | "google" };

        const { error } = await client.auth.signInWithOAuth({
          options: { redirectTo: new URL("/auth/callback", window.location.origin).toString() },
          provider: providerConfig.provider,
        });

        if (error) {
          setErrorMessage(error.message);
          return { success: false, message: error.message };
        }

        return { success: true, message: `Redirigiendo a ${providerConfig.label}...` };
      }

      // Production: redirect to backend OAuth endpoint
      window.location.href = `/api/auth/oauth/${provider}`;
      return { success: true, message: "Redirigiendo..." };
    },
    [client],
  );

  // @deprecated Kept for settings compatibility. Removed in PR #3.
  const linkIdentity = useCallback(async (provider: string) => {
    if (client) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const clientAuth = client.auth as any;
      if (clientAuth.linkIdentity) {
        await clientAuth.linkIdentity({ provider });
        return { success: true, message: `Vinculando ${provider}...` };
      }
    }
    throw new Error("linkIdentity is not available.");
  }, [client]);

  // @deprecated Kept for settings compatibility. Removed in PR #3.
  const unlinkIdentity = useCallback(async (provider: string) => {
    if (client) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const clientAuth = client.auth as any;
      if (clientAuth.unlinkIdentity) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const identitiesResult = clientAuth.getUserIdentities ? await clientAuth.getUserIdentities() : { data: { identities: [] } };
        const identities = identitiesResult.data.identities ?? [];
        if (identities.length < 2) {
          return { success: false, message: `Necesitás al menos dos identidades vinculadas para desvincular ${provider}.` };
        }
        const targetIdentity = identities.find(
          (item: { provider: string }) => item.provider === provider,
        );
        if (targetIdentity) {
          await clientAuth.unlinkIdentity(targetIdentity);
          return { success: true, message: `${provider} desvinculada.` };
        }
      }
    }
    throw new Error("unlinkIdentity is not available.");
  }, [client]);

  const value: AuthContextValue = {
    errorMessage,
    isAdmin: storeIsAdmin,
    isConfigured: true,
    session: storeUser ? { user: storeUser } : null,
    signIn,
    signInWithOAuth,
    signOut,
    signUp,
    status: storeStatus,
    user: storeUser,
    linkIdentity,
    unlinkIdentity,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AUTH_MESSAGES };
