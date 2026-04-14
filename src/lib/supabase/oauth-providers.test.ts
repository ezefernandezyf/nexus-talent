import { describe, expect, it } from "vitest";
import { getEnabledOAuthProviders, getOAuthProviderConfig } from "./oauth-providers";

describe("oauth-providers", () => {
  it("exposes github and google only in the enabled provider list", () => {
    expect(getEnabledOAuthProviders().map((provider) => provider.provider)).toEqual(["github", "google"]);
  });

  it("keeps linkedin disabled until its configuration is verified", () => {
    expect(getOAuthProviderConfig("linkedin")).toMatchObject({
      enabled: false,
      label: "LinkedIn",
      provider: "linkedin_oidc",
    });
  });
});