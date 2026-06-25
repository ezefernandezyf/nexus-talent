import { apiClient } from "@/core/api-client";
import {
  PROFILE_SAVE_INPUT_SCHEMA,
  type ProfileRecord,
  type ProfileSaveInput,
} from "./validation";

const BASE_URL = "/profile";

export interface ProfileRepository {
  get(userId: string): Promise<ProfileRecord | null>;
  delete(userId: string): Promise<void>;
  save(input: ProfileSaveInput): Promise<ProfileRecord>;
}

export function createProfileRepository(): ProfileRepository {
  return {
    async get(userId: string): Promise<ProfileRecord | null> {
      try {
        const { data } = await apiClient.get<ProfileRecord>(`${BASE_URL}/${userId}`);
        return data;
      } catch {
        return null;
      }
    },

    async delete(userId: string): Promise<void> {
      await apiClient.delete(`${BASE_URL}/${userId}`);
    },

    async save(input: ProfileSaveInput): Promise<ProfileRecord> {
      const validated = PROFILE_SAVE_INPUT_SCHEMA.parse(input);
      const { data } = await apiClient.put<ProfileRecord>(BASE_URL, validated);
      return data;
    },
  };
}
