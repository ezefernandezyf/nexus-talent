import { createClient } from "@supabase/supabase-js";
import type { Session } from "@supabase/supabase-js";

const SUPABASE_ENV = {
  ANON_KEY: "VITE_SUPABASE_ANON_KEY",
  URL: "VITE_SUPABASE_URL",
} as const;

export interface AuthClientLike {
  auth: {
    getSession: () => Promise<{
      data: {
        session: Session | null;
      };
      error: { message: string } | null;
    }>;
    onAuthStateChange: (
      callback: (event: string, session: Session | null) => void,
    ) => { data: { subscription: { unsubscribe: () => void } } };
    signInWithPassword: (credentials: { email: string; password: string }) => Promise<{
      data: {
        session: Session | null;
        user: Session["user"] | null;
      };
      error: { message: string } | null;
    }>;
    signOut: () => Promise<{
      error: { message: string } | null;
    }>;
    signUp: (credentials: { email: string; password: string }) => Promise<{
      data: {
        session: Session | null;
        user: Session["user"] | null;
      };
      error: { message: string } | null;
    }>;
  };
}

export type SupabaseClientState = {
  client: AuthClientLike | null;
  isConfigured: boolean;
  missingVariables: string[];
};

let cachedClientState: SupabaseClientState | null = null;

function readSupabaseVariable(name: keyof typeof SUPABASE_ENV) {
  const value = import.meta.env[SUPABASE_ENV[name]];
  return typeof value === "string" ? value.trim() : "";
}

function getMissingVariables(url: string, anonKey: string) {
  const missingVariables: string[] = [];

  if (!url) {
    missingVariables.push(SUPABASE_ENV.URL);
  }

  if (!anonKey) {
    missingVariables.push(SUPABASE_ENV.ANON_KEY);
  }

  return missingVariables;
}

export function createSupabaseClient(): SupabaseClientState {
  if (cachedClientState) {
    return cachedClientState;
  }

  const url = readSupabaseVariable("URL");
  const anonKey = readSupabaseVariable("ANON_KEY");
  const missingVariables = getMissingVariables(url, anonKey);

  if (missingVariables.length > 0) {
    cachedClientState = {
      client: null,
      isConfigured: false,
      missingVariables,
    };

    return cachedClientState;
  }

  cachedClientState = {
    client: createClient(url, anonKey, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true,
      },
    }) as AuthClientLike,
    isConfigured: true,
    missingVariables: [],
  };

  return cachedClientState;
}
