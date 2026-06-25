import { apiClient } from "../../../core/api-client";
import {
  APP_SETTINGS_INPUT_SCHEMA,
  createDefaultSettings,
  type AppSettings,
  type AppSettingsInput,
} from "./settings-validation";

const BASE_URL = "/settings";

export interface SettingsRepository {
  get(): Promise<AppSettings>;
  save(settings: AppSettingsInput): Promise<AppSettings>;
}

export function createSettingsRepository(): SettingsRepository {
  return {
    async get(): Promise<AppSettings> {
      try {
        const { data } = await apiClient.get<AppSettings>(BASE_URL);
        return data;
      } catch {
        return createDefaultSettings();
      }
    },

    async save(settings: AppSettingsInput): Promise<AppSettings> {
      const validated = APP_SETTINGS_INPUT_SCHEMA.parse(settings);
      const { data } = await apiClient.put<AppSettings>(BASE_URL, validated);
      return data;
    },
  };
}
