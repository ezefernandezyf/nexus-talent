import { z } from "zod";

export const SETTINGS_STORAGE_KEY = "nexus-talent:settings:v1";
export const APP_SETTINGS_ID = "app-settings";

export const APP_SETTINGS_SCHEMA = z.object({
  id: z.literal(APP_SETTINGS_ID),
  maintenanceMode: z.boolean(),
  allowedDomains: z.array(z.string().trim().min(1)).default([]),
  updatedAt: z.string().datetime(),
});

export const APP_SETTINGS_INPUT_SCHEMA = APP_SETTINGS_SCHEMA.omit({
  id: true,
  updatedAt: true,
});

export type AppSettings = z.infer<typeof APP_SETTINGS_SCHEMA>;
export type AppSettingsInput = z.infer<typeof APP_SETTINGS_INPUT_SCHEMA>;

export function createDefaultSettings(overrides: Partial<AppSettings> = {}): AppSettings {
  return APP_SETTINGS_SCHEMA.parse({
    id: APP_SETTINGS_ID,
    maintenanceMode: false,
    allowedDomains: [],
    updatedAt: new Date().toISOString(),
    ...overrides,
  });
}
