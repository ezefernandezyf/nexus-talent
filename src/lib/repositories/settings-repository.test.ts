import { beforeEach, describe, expect, it, vi } from "vitest";
import { APP_SETTINGS_ID, SETTINGS_STORAGE_KEY } from "../validation/settings";
import { createSettingsRepository } from "./settings-repository";

const APP_SETTINGS_ROW = {
  allowed_domains: ["empresa.com"],
  id: APP_SETTINGS_ID,
  maintenance_mode: true,
  updated_at: "2026-04-05T12:00:00.000Z",
};

describe("createSettingsRepository", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("falls back to local storage and validates persisted data", async () => {
    const repository = createSettingsRepository();

    const initial = await repository.get();
    expect(initial.id).toBe(APP_SETTINGS_ID);
    expect(initial.maintenanceMode).toBe(false);

    const saved = await repository.save({
      allowedDomains: ["partners.dev"],
      maintenanceMode: true,
    });

    expect(saved.maintenanceMode).toBe(true);
    expect(saved.allowedDomains).toEqual(["partners.dev"]);
    expect(JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY) ?? "{}")).toMatchObject({
      allowedDomains: ["partners.dev"],
      maintenanceMode: true,
    });
  });

  it("cleans invalid local storage before returning defaults", async () => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, "not-json");

    const repository = createSettingsRepository();

    expect(await repository.get()).toMatchObject({
      id: APP_SETTINGS_ID,
      allowedDomains: [],
      maintenanceMode: false,
    });
  });

  it("uses the Supabase client when env vars are configured", async () => {
    const select = vi.fn(async () => ({ data: APP_SETTINGS_ROW, error: null }));
    const single = vi.fn(async () => ({ data: APP_SETTINGS_ROW, error: null }));
    const upsert = vi.fn(() => ({
      select: () => ({
        single,
      }),
    }));
    const from = vi.fn(() => ({
      select: () => ({
        eq: () => ({
          maybeSingle: select,
        }),
      }),
      upsert,
    }));

    const repository = createSettingsRepository({ from } as never);

    await expect(repository.get()).resolves.toMatchObject({
      id: APP_SETTINGS_ID,
      maintenanceMode: true,
      allowedDomains: ["empresa.com"],
    });

    await expect(repository.save({ allowedDomains: ["partners.dev"], maintenanceMode: false })).resolves.toMatchObject({
      id: APP_SETTINGS_ID,
      maintenanceMode: true,
    });

    expect(from).toHaveBeenCalledWith("settings");
  });
});
