import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createSettingsRepository, type SettingsRepository } from "../../../lib/repositories";
import { type AppSettingsInput } from "../../../lib/validation/settings";

export const SETTINGS_QUERY_KEY = ["app-settings"] as const;

interface UseSettingsOptions {
  repository?: SettingsRepository;
}

const defaultRepository = createSettingsRepository();

export function useSettings(options: UseSettingsOptions = {}) {
  const repository = options.repository ?? defaultRepository;
  const queryClient = useQueryClient();

  const settingsQuery = useQuery({
    queryKey: SETTINGS_QUERY_KEY,
    queryFn: () => repository.get(),
  });

  const saveMutation = useMutation({
    mutationFn: (settings: AppSettingsInput) => repository.save(settings),
    onSuccess: (settings) => {
      queryClient.setQueryData(SETTINGS_QUERY_KEY, settings);
    },
  });

  return {
    ...settingsQuery,
    saveSettings: saveMutation.mutateAsync,
    saveSettingsError: saveMutation.error,
    saveSettingsPending: saveMutation.isPending,
    saveSettingsSuccess: saveMutation.isSuccess,
  };
}
