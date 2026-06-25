import type { AuthUser } from "../auth/api/useSession";
import { getOAuthProviderConfig, type OAuthProviderKey } from "./api/oauth-config";
import type { ThemeMode } from "../../core/theme";

export type { OAuthProviderKey };
export { getOAuthProviderConfig };

export interface LinkedAccountSnapshot {
  connected: boolean;
  label: string;
  provider: Extract<OAuthProviderKey, "google">;
}

export interface SettingsExportPayloadInput {
  session: AuthUser | null;
  theme: ThemeMode;
  user: AuthUser | null;
}

function getIdentityProviders(_user: AuthUser | null): Set<string> {
  // Identity providers are not available in the current auth system.
  // Revisit when social login linking is implemented.
  return new Set<string>();
}

export function getDisplayName(user: AuthUser | null) {
  if (user?.displayName && user.displayName.trim().length > 0) {
    return user.displayName.trim();
  }

  if (user?.email) {
    return user.email.split("@")[0] ?? user.email;
  }

  return "Sin nombre";
}

export function getLocation(_user: AuthUser | null) {
  return null;
}

export function getLinkedAccounts(user: AuthUser | null): LinkedAccountSnapshot[] {
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
          expiresAt: null,
          provider: null,
          userId: session.id,
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
