import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import {
  APP_SETTINGS_ID,
  APP_SETTINGS_INPUT_SCHEMA,
  APP_SETTINGS_SCHEMA,
  SETTINGS_STORAGE_KEY,
  createDefaultSettings,
  type AppSettings,
  type AppSettingsInput,
} from "../validation/settings";

const SETTINGS_TABLE = "settings";

const SETTINGS_ROW_SCHEMA = z.object({
  id: z.string(),
  maintenance_mode: z.boolean(),
  allowed_domains: z.array(z.string()),
  updated_at: z.string().datetime(),
});

type SettingsRow = z.infer<typeof SETTINGS_ROW_SCHEMA>;

export interface SettingsRepository {
  get(): Promise<AppSettings>;
  save(settings: AppSettingsInput): Promise<AppSettings>;
}

function readSupabaseEnv(name: "VITE_SUPABASE_URL" | "VITE_SUPABASE_ANON_KEY") {
  const value = import.meta.env[name];
  return typeof value === "string" ? value.trim() : "";
}

function createSupabaseSettingsClient(): SupabaseClient | null {
  const url = readSupabaseEnv("VITE_SUPABASE_URL");
  const anonKey = readSupabaseEnv("VITE_SUPABASE_ANON_KEY");

  if (!url || !anonKey) {
    return null;
  }

  return createClient(url, anonKey, {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true,
    },
  });
}

function getStorage() {
  try {
    return globalThis.localStorage;
  } catch {
    return null;
  }
}

function toRow(settings: AppSettings): SettingsRow {
  return {
    allowed_domains: settings.allowedDomains,
    id: settings.id,
    maintenance_mode: settings.maintenanceMode,
    updated_at: settings.updatedAt,
  };
}

function toSettings(row: SettingsRow): AppSettings {
  return APP_SETTINGS_SCHEMA.parse({
    allowedDomains: row.allowed_domains,
    id: row.id,
    maintenanceMode: row.maintenance_mode,
    updatedAt: row.updated_at,
  });
}

function createFallbackRepository(): SettingsRepository {
  function readLocalSettings() {
    const storage = getStorage();

    if (!storage) {
      return createDefaultSettings();
    }

    const rawValue = storage.getItem(SETTINGS_STORAGE_KEY);

    if (!rawValue) {
      const defaults = createDefaultSettings();
      storage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(defaults));
      return defaults;
    }

    try {
      const parsed = JSON.parse(rawValue) as unknown;
      return APP_SETTINGS_SCHEMA.parse(parsed);
    } catch {
      const defaults = createDefaultSettings();
      storage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(defaults));
      return defaults;
    }
  }

  function writeLocalSettings(settings: AppSettings) {
    const storage = getStorage();

    if (!storage) {
      return;
    }

    storage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }

  return {
    async get() {
      return readLocalSettings();
    },

    async save(settings) {
      const validated = APP_SETTINGS_INPUT_SCHEMA.parse(settings);
      const nextSettings = createDefaultSettings({
        allowedDomains: validated.allowedDomains,
        maintenanceMode: validated.maintenanceMode,
        updatedAt: new Date().toISOString(),
      });

      writeLocalSettings(nextSettings);
      return nextSettings;
    },
  };
}

function createSupabaseRepository(client: SupabaseClient): SettingsRepository {
  return {
    async get() {
      try {
        const { data, error } = await client
          .from(SETTINGS_TABLE)
          .select("id, maintenance_mode, allowed_domains, updated_at")
          .eq("id", APP_SETTINGS_ID)
          .maybeSingle();

        if (error) {
          throw error;
        }

        if (!data) {
          return createDefaultSettings();
        }

        return toSettings(SETTINGS_ROW_SCHEMA.parse(data));
      } catch {
        return createFallbackRepository().get();
      }
    },

    async save(settings) {
      const validated = APP_SETTINGS_INPUT_SCHEMA.parse(settings);
      const nextRow = toRow(
        createDefaultSettings({
          allowedDomains: validated.allowedDomains,
          maintenanceMode: validated.maintenanceMode,
          updatedAt: new Date().toISOString(),
        }),
      );

      try {
        const { data, error } = await client
          .from(SETTINGS_TABLE)
          .upsert(nextRow, { onConflict: "id" })
          .select("id, maintenance_mode, allowed_domains, updated_at")
          .single();

        if (error) {
          throw error;
        }

        return toSettings(SETTINGS_ROW_SCHEMA.parse(data));
      } catch {
        return createFallbackRepository().save(validated);
      }
    },
  };
}

export function createSettingsRepository(client: SupabaseClient | null = createSupabaseSettingsClient()): SettingsRepository {

  if (!client) {
    return createFallbackRepository();
  }

  return createSupabaseRepository(client);
}
