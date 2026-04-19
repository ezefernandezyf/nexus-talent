import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "../../auth";
import { createProfileRepository, type ProfileRepository } from "../../../lib/repositories";
import { type OAuthProviderKey } from "../../../lib/supabase";
import { useTheme } from "../../../lib/theme";
import { type ProfileSaveInput } from "../../../lib/validation/profile";

export const SETTINGS_QUERY_KEY = ["settings", "profile"] as const;

const ACCOUNT_LINKING_AVAILABLE = true;
const ACCOUNT_DELETION_AVAILABLE = true;

interface UseSettingsOptions {
  repository?: ProfileRepository;
}

const defaultRepository = createProfileRepository();

export function useSettings(options: UseSettingsOptions = {}) {
  const { linkIdentity, session, signOut, status, unlinkIdentity, user } = useAuth();
  const { setTheme, theme, toggleTheme } = useTheme();
  const repository = options.repository ?? defaultRepository;
  const queryClient = useQueryClient();
  const profileQueryKey = [...SETTINGS_QUERY_KEY, user?.id ?? "anonymous"] as const;
  const [accountActionError, setAccountActionError] = useState<string | null>(null);
  const [accountActionPending, setAccountActionPending] = useState<OAuthProviderKey | null>(null);

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

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        throw new Error("No hay una sesión activa para eliminar.");
      }

      await repository.delete(user.id);
      await signOut();
    },
  });

  async function connectAccount(provider: OAuthProviderKey) {
    setAccountActionPending(provider);
    setAccountActionError(null);

    try {
      return await linkIdentity(provider);
    } catch (error) {
      const message = error instanceof Error && error.message.trim().length > 0 ? error.message : `No se pudo vincular ${provider}.`;
      setAccountActionError(message);
      throw error instanceof Error ? error : new Error(message);
    } finally {
      setAccountActionPending(null);
    }
  }

  async function disconnectAccount(provider: OAuthProviderKey) {
    setAccountActionPending(provider);
    setAccountActionError(null);

    try {
      return await unlinkIdentity(provider);
    } catch (error) {
      const message = error instanceof Error && error.message.trim().length > 0 ? error.message : `No se pudo desvincular ${provider}.`;
      setAccountActionError(message);
      throw error instanceof Error ? error : new Error(message);
    } finally {
      setAccountActionPending(null);
    }
  }

  return {
    accountActionError,
    accountActionPending,
    connectAccount,
    disconnectAccount,
    profile: settingsQuery.data ?? null,
    profileError: settingsQuery.error,
    profileLoading: settingsQuery.isLoading,
    profileRefetch: settingsQuery.refetch,
    profileUnavailable: settingsQuery.isError,
    saveProfile: saveMutation.mutateAsync,
    saveProfileError: saveMutation.error,
    saveProfilePending: saveMutation.isPending,
    saveProfileSuccess: saveMutation.isSuccess,
    deleteAccount: deleteMutation.mutateAsync,
    deleteAccountError: deleteMutation.error,
    deleteAccountPending: deleteMutation.isPending,
    deleteAccountReset: deleteMutation.reset,
    identityLinkingAvailable: ACCOUNT_LINKING_AVAILABLE,
    accountDeletionAvailable: ACCOUNT_DELETION_AVAILABLE,
    resetAccountActionError: () => setAccountActionError(null),
    session,
    setTheme,
    status,
    theme,
    toggleTheme,
    user,
  };
}
