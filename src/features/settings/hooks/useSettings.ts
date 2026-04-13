import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../auth";
import { createProfileRepository, type ProfileRepository } from "../../../lib/repositories";
import { useTheme } from "../../../lib/theme";
import { type ProfileSaveInput } from "../../../lib/validation/profile";

export const SETTINGS_QUERY_KEY = ["settings", "profile"] as const;

interface UseSettingsOptions {
  repository?: ProfileRepository;
}

const defaultRepository = createProfileRepository();

export function useSettings(options: UseSettingsOptions = {}) {
  const { session, status, user } = useAuth();
  const { setTheme, theme, toggleTheme } = useTheme();
  const repository = options.repository ?? defaultRepository;
  const queryClient = useQueryClient();
  const profileQueryKey = [...SETTINGS_QUERY_KEY, user?.id ?? "anonymous"] as const;

  const settingsQuery = useQuery({
    enabled: Boolean(user?.id),
    queryKey: profileQueryKey,
    queryFn: async () => (user ? repository.get(user.id) : null),
  });

  const saveMutation = useMutation({
    mutationFn: (settings: ProfileSaveInput) => repository.save(settings),
    onSuccess: (settings) => {
      if (user) {
        queryClient.setQueryData(profileQueryKey, settings);
      }
    },
  });

  return {
    profile: settingsQuery.data ?? null,
    profileError: settingsQuery.error,
    profileLoading: settingsQuery.isLoading,
    profileRefetch: settingsQuery.refetch,
    profileUnavailable: settingsQuery.isError,
    saveProfile: saveMutation.mutateAsync,
    saveProfileError: saveMutation.error,
    saveProfilePending: saveMutation.isPending,
    saveProfileSuccess: saveMutation.isSuccess,
    session,
    setTheme,
    status,
    theme,
    toggleTheme,
    user,
  };
}
