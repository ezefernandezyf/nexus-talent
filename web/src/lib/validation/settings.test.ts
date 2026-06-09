import { describe, expect, it } from "vitest";
import { APP_SETTINGS_INPUT_SCHEMA, createDefaultSettings } from "./settings";

describe("settings validation", () => {
  it("rejects malformed settings payloads", () => {
    const result = APP_SETTINGS_INPUT_SCHEMA.safeParse({
      allowedDomains: [""],
      maintenanceMode: "yes",
    });

    expect(result.success).toBe(false);
  });

  it("creates default settings with the expected shape", () => {
    const settings = createDefaultSettings();

    expect(settings).toMatchObject({
      allowedDomains: [] as string[],
      id: "app-settings",
      maintenanceMode: false,
    });
  });
});