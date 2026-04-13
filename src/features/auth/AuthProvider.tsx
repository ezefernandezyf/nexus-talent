import { createContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { createSupabaseClient, getOAuthProviderConfig, getOAuthRedirectTo, type AuthClientLike, type OAuthProviderKey } from "../../lib/supabase";

const AUTH_STATUS = {
  AUTHENTICATED: "authenticated",
  LOADING: "loading",
  UNAUTHENTICATED: "unauthenticated",
} as const;

export type AuthStatus = (typeof AUTH_STATUS)[keyof typeof AUTH_STATUS];

const AUTH_MESSAGES = {
  MISSING_CONFIGURATION: "Configurá VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY para activar el acceso.",
  SESSION_CHECK_FAILED: "No se pudo validar la sesión.",
} as const;

type AuthActionResponse = {
  message: string;
};

interface AuthContextValue {
  errorMessage: string | null;
  isAdmin: boolean;
  isConfigured: boolean;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<AuthActionResponse>;
  signInWithOAuth: (provider: OAuthProviderKey) => Promise<AuthActionResponse>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<AuthActionResponse>;
  status: AuthStatus;
  user: User | null;
}

interface AuthProviderProps {
  children: ReactNode;
  client?: AuthClientLike | null;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return fallback;
}

function getIsAdmin(user: User | null | undefined) {
  const role = user?.user_metadata?.role ?? user?.app_metadata?.role;

  return role === "admin";
}

function createClientState(client: AuthClientLike | null | undefined) {
  if (client) {
    return {
      client,
      isConfigured: true,
      missingVariables: [],
    };
  }

  return createSupabaseClient();
}

export function AuthProvider({ children, client }: AuthProviderProps) {
  const [clientState] = useState(() => createClientState(client));
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [status, setStatus] = useState<AuthStatus>(clientState.isConfigured ? AUTH_STATUS.LOADING : AUTH_STATUS.UNAUTHENTICATED);
  const [errorMessage, setErrorMessage] = useState<string | null>(clientState.isConfigured ? null : AUTH_MESSAGES.MISSING_CONFIGURATION);

  function syncSession(nextSession: Session | null) {
    setSession(nextSession);
    setUser(nextSession?.user ?? null);
    setIsAdmin(getIsAdmin(nextSession?.user));
    setStatus(nextSession ? AUTH_STATUS.AUTHENTICATED : AUTH_STATUS.UNAUTHENTICATED);
  }

  function clearSession() {
    syncSession(null);
  }

  useEffect(() => {
    if (!clientState.client) {
      setStatus(AUTH_STATUS.UNAUTHENTICATED);
      setErrorMessage(AUTH_MESSAGES.MISSING_CONFIGURATION);
      return;
    }

    let isActive = true;
    setStatus(AUTH_STATUS.LOADING);
    setErrorMessage(null);

    void clientState.client.auth
      .getSession()
      .then(({ data, error }) => {
        if (!isActive) {
          return;
        }

        if (error) {
          clearSession();
          setErrorMessage(getErrorMessage(error, AUTH_MESSAGES.SESSION_CHECK_FAILED));
          return;
        }

        syncSession(data.session);
      })
      .catch((error: unknown) => {
        if (!isActive) {
          return;
        }

        clearSession();
        setErrorMessage(getErrorMessage(error, AUTH_MESSAGES.SESSION_CHECK_FAILED));
      });

    const { data } = clientState.client.auth.onAuthStateChange((_event, nextSession) => {
      if (!isActive) {
        return;
      }

      syncSession(nextSession);
      setErrorMessage(null);
    });

    return () => {
      isActive = false;
      data.subscription.unsubscribe();
    };
  }, [clientState.client]);

  async function signIn(email: string, password: string) {
    if (!clientState.client) {
      throw new Error(AUTH_MESSAGES.MISSING_CONFIGURATION);
    }

    setErrorMessage(null);

    const { data, error } = await clientState.client.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    syncSession(data.session);
    setErrorMessage(null);

    return {
      message: "Sesión iniciada. Redirigiendo al panel privado.",
    };
  }

  async function signUp(email: string, password: string) {
    if (!clientState.client) {
      throw new Error(AUTH_MESSAGES.MISSING_CONFIGURATION);
    }

    setErrorMessage(null);

    const { data, error } = await clientState.client.auth.signUp({
      email: email.trim(),
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    syncSession(data.session);

    if (data.session) {
      setErrorMessage(null);
      return {
        message: "Cuenta creada y sesión iniciada.",
      };
    }

    return {
      message: "Cuenta creada. Revisá tu correo para confirmar el acceso.",
    };
  }

  async function signOut() {
    if (!clientState.client) {
      throw new Error(AUTH_MESSAGES.MISSING_CONFIGURATION);
    }

    setErrorMessage(null);

    const { error } = await clientState.client.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }

    clearSession();
    setErrorMessage(null);
  }

  async function signInWithOAuth(provider: OAuthProviderKey) {
    if (!clientState.client) {
      throw new Error(AUTH_MESSAGES.MISSING_CONFIGURATION);
    }

    const providerConfig = getOAuthProviderConfig(provider);

    if (!providerConfig.enabled) {
      const message = `${providerConfig.label} no está habilitado en esta instancia.`;
      setErrorMessage(message);
      throw new Error(message);
    }

    setErrorMessage(null);

    const { error } = await clientState.client.auth.signInWithOAuth({
      options: {
        redirectTo: getOAuthRedirectTo(),
      },
      provider: providerConfig.provider,
    });

    if (error) {
      setErrorMessage(error.message);
      throw new Error(error.message);
    }

    return {
      message: `Redirigiendo a ${providerConfig.label}...`,
    };
  }

  const value: AuthContextValue = {
    errorMessage,
    isAdmin,
    isConfigured: clientState.isConfigured,
    session,
    signIn,
    signInWithOAuth,
    signOut,
    signUp,
    status,
    user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AUTH_MESSAGES, AUTH_STATUS };
