import type { Session, User } from "@supabase/supabase-js";
import { getOAuthProviderConfig, type OAuthProviderKey } from "../../lib/supabase";
import type { ThemeMode } from "../../lib/theme";

export interface LinkedAccountSnapshot {
  connected: boolean;
  label: string;
  provider: Extract<OAuthProviderKey, "google">;
}

export interface SettingsExportPayloadInput {
  session: Session | null;
  theme: ThemeMode;
  user: User | null;
}

function getIdentityProviders(user: User | null) {
  const providers = new Set<string>();

  user?.identities?.forEach((identity) => {
    if (identity?.provider) {
      providers.add(identity.provider);
    }
  });

  const metadataProvider = user?.app_metadata?.provider;

  if (typeof metadataProvider === "string" && metadataProvider.length > 0) {
    providers.add(metadataProvider);
  }

  return providers;
}

export function getDisplayName(user: User | null) {
  const metadata = user?.user_metadata ?? {};
  const displayName = metadata.display_name ?? metadata.full_name ?? metadata.name;

  if (typeof displayName === "string" && displayName.trim().length > 0) {
    return displayName.trim();
  }

  if (user?.email) {
    return user.email.split("@")[0] ?? user.email;
  }

  return "Sin nombre";
}

export function getLocation(user: User | null) {
  const metadata = user?.user_metadata ?? {};
  const location = metadata.location ?? metadata.locale ?? metadata.region;

  return typeof location === "string" && location.trim().length > 0 ? location.trim() : null;
}

export function getLinkedAccounts(user: User | null): LinkedAccountSnapshot[] {
  const connectedProviders = getIdentityProviders(user);

  return (["google"] as const).map((provider) => {
    const config = getOAuthProviderConfig(provider);

    return {
      connected: connectedProviders.has(provider),
      label: config.label,
      provider,
    };
  });
}

export function buildSettingsExportPayload({ session, theme, user }: SettingsExportPayloadInput) {
  const linkedAccounts = getLinkedAccounts(user);

  const payload = {
    account: user
      ? {
          displayName: getDisplayName(user),
          email: user.email ?? null,
          id: user.id,
          location: getLocation(user),
        }
      : null,
    exportedAt: new Date().toISOString(),
    linkedAccounts,
    session: session
      ? {
          expiresAt: session.expires_at ?? null,
          provider: user?.app_metadata?.provider ?? null,
          userId: session.user.id,
        }
      : null,
    theme,
  };

  const fileBaseName = user?.email?.split("@")[0]?.trim().toLowerCase() || "guest";

  return {
    content: JSON.stringify(payload, null, 2),
    filename: `nexus-talent-settings-${fileBaseName}.json`,
  };
}