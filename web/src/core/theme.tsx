import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export const THEME_STORAGE_KEY = "nexus-talent:theme:v1";

export type ThemeMode = "dark" | "light";

interface ThemeContextValue {
  setTheme: (theme: ThemeMode) => void;
  theme: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getInitialTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "dark";
  }

  try {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

    if (storedTheme === "light" || storedTheme === "dark") {
      return storedTheme;
    }
  } catch {
    return "dark";
  }

  if (window.matchMedia?.("(prefers-color-scheme: light)").matches) {
    return "light";
  }

  return "dark";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.style.colorScheme = theme;

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      return;
    }

    // Best-effort: sync theme to API when user is authenticated.
    // Silently ignore errors (unauthenticated users, network failures).
    const controller = new AbortController();
    fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme }),
      signal: controller.signal,
    }).catch(() => {
      /* noop — best-effort sync */
    });

    return () => controller.abort();
  }, [theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      setTheme: setThemeState,
      theme,
      toggleTheme: () => setThemeState((currentTheme) => (currentTheme === "dark" ? "light" : "dark")),
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider.");
  }

  return context;
}