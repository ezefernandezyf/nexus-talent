import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth";

export const APP_SETTINGS_KEY = ["app-settings"];

export interface AppSettings {
  theme: "light" | "dark";
  emailDigest: boolean;
  rateLimitTier: "default" | "relaxed" | "strict";
}

export function useAppSettings() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const isAuthenticated = !!session;

  const settingsQuery = useQuery({
    queryKey: APP_SETTINGS_KEY,
    queryFn: async () => {
      const res = await fetch("/api/settings");
      if (!res.ok) throw new Error("Failed to fetch settings");
      return res.json() as Promise<AppSettings>;
    },
    enabled: isAuthenticated,
  });

  const syncMutation = useMutation({
    mutationFn: async (data: Partial<AppSettings>) => {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to sync settings");
      return res.json() as Promise<AppSettings>;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(APP_SETTINGS_KEY, data);
    },
  });

  return {
    settings: settingsQuery.data ?? null,
    isLoading: settingsQuery.isLoading,
    isError: settingsQuery.isError,
    error: settingsQuery.error,
    syncSettings: syncMutation.mutateAsync,
    isSyncing: syncMutation.isPending,
  };
}
