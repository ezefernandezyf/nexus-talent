import { describe, expect, it } from "vitest";
import { getEnabledOAuthProviders, getOAuthProviderConfig } from "./oauth-providers";

describe("oauth-providers", () => {
  it("exposes github and google in the enabled provider list", () => {
    expect(getEnabledOAuthProviders().map((provider) => provider.provider)).toEqual(["github", "google"]);
  });
});