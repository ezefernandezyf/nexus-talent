// Migrated from lib/supabase/oauth-providers.ts — no Supabase dependency

export type OAuthProviderKey = "github" | "google";

type OAuthProviderType = "github" | "google";

export interface OAuthProviderConfig {
  enabled: boolean;
  label: string;
  provider: OAuthProviderType;
}

const OAUTH_PROVIDERS: Record<OAuthProviderKey, OAuthProviderConfig> = {
  github: {
    enabled: true,
    label: "GitHub",
    provider: "github",
  },
  google: {
    enabled: true,
    label: "Google",
    provider: "google",
  },
};

export function getOAuthProviderConfig(provider: OAuthProviderKey) {
  return OAUTH_PROVIDERS[provider];
}

export function getEnabledOAuthProviders() {
  return (Object.entries(OAUTH_PROVIDERS) as Array<[OAuthProviderKey, OAuthProviderConfig]>)
    .filter(([, config]) => config.enabled)
    .map(([, config]) => config);
}

export function getOAuthRedirectTo() {
  if (typeof window === "undefined") {
    return "/auth/callback";
  }

  return new URL("/auth/callback", window.location.origin).toString();
}
