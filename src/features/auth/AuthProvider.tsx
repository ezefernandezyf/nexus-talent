import { createContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { createSupabaseClient, type AuthClientLike } from "../../lib/supabase";

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
          setSession(null);
          setUser(null);
          setIsAdmin(false);
          setStatus(AUTH_STATUS.UNAUTHENTICATED);
          setErrorMessage(getErrorMessage(error, AUTH_MESSAGES.SESSION_CHECK_FAILED));
          return;
        }

        setSession(data.session);
        setUser(data.session?.user ?? null);
        setIsAdmin(getIsAdmin(data.session?.user));
        setStatus(data.session ? AUTH_STATUS.AUTHENTICATED : AUTH_STATUS.UNAUTHENTICATED);
      })
      .catch((error: unknown) => {
        if (!isActive) {
          return;
        }

        setSession(null);
        setUser(null);
        setIsAdmin(false);
        setStatus(AUTH_STATUS.UNAUTHENTICATED);
        setErrorMessage(getErrorMessage(error, AUTH_MESSAGES.SESSION_CHECK_FAILED));
      });

    const { data } = clientState.client.auth.onAuthStateChange((_event, nextSession) => {
      if (!isActive) {
        return;
      }

      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setIsAdmin(getIsAdmin(nextSession?.user));
      setStatus(nextSession ? AUTH_STATUS.AUTHENTICATED : AUTH_STATUS.UNAUTHENTICATED);
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

    const { data, error } = await clientState.client.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (data.session) {
      setSession(data.session);
      setUser(data.session.user ?? null);
      setIsAdmin(getIsAdmin(data.session.user));
      setStatus(AUTH_STATUS.AUTHENTICATED);
      setErrorMessage(null);
    }

    return {
      message: "Sesión iniciada. Redirigiendo al panel privado.",
    };
  }

  async function signUp(email: string, password: string) {
    if (!clientState.client) {
      throw new Error(AUTH_MESSAGES.MISSING_CONFIGURATION);
    }

    const { data, error } = await clientState.client.auth.signUp({
      email: email.trim(),
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (data.session) {
      setSession(data.session);
      setUser(data.session.user ?? null);
      setIsAdmin(getIsAdmin(data.session.user));
      setStatus(AUTH_STATUS.AUTHENTICATED);
      setErrorMessage(null);
      return {
        message: "Cuenta creada y sesión iniciada.",
      };
    }

    setSession(null);
    setUser(null);
    setIsAdmin(false);
    setStatus(AUTH_STATUS.UNAUTHENTICATED);
    return {
      message: "Cuenta creada. Revisá tu correo para confirmar el acceso.",
    };
  }

  async function signOut() {
    if (!clientState.client) {
      throw new Error(AUTH_MESSAGES.MISSING_CONFIGURATION);
    }

    const { error } = await clientState.client.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }

    setSession(null);
    setUser(null);
    setIsAdmin(false);
    setStatus(AUTH_STATUS.UNAUTHENTICATED);
    setErrorMessage(null);
  }

  const value: AuthContextValue = {
    errorMessage,
    isAdmin,
    isConfigured: clientState.isConfigured,
    session,
    signIn,
    signOut,
    signUp,
    status,
    user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AUTH_MESSAGES, AUTH_STATUS };
