import { describe, expect, it } from "vitest";
import { getEnabledOAuthProviders, getOAuthProviderConfig } from "./oauth-providers";

describe("oauth-providers", () => {
  it("exposes github, google, and linkedin in the enabled provider list", () => {
    expect(getEnabledOAuthProviders().map((provider) => provider.provider)).toEqual(["github", "google", "linkedin_oidc"]);
  });

  it("keeps linkedin mapped to the oidc provider", () => {
    expect(getOAuthProviderConfig("linkedin")).toMatchObject({
      enabled: true,
      label: "LinkedIn",
      provider: "linkedin_oidc",
    });
  });
});