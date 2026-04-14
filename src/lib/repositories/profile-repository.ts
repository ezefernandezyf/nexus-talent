import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseClient } from "../supabase";
import { PROFILE_RECORD_SCHEMA, PROFILE_SAVE_INPUT_SCHEMA, type ProfileRecord, type ProfileSaveInput } from "../validation/profile";

const PROFILE_TABLE = "profiles";
const PROFILE_STORAGE_KEY = "nexus-talent:profile:v1";

export interface ProfileRepository {
  get(userId: string): Promise<ProfileRecord | null>;
  save(input: ProfileSaveInput): Promise<ProfileRecord>;
}

function getStorage() {
  try {
    return globalThis.localStorage;
  } catch {
    return null;
  }
}

function readLocalProfiles() {
  const storage = getStorage();

  if (!storage) {
    return {} as Record<string, ProfileRecord>;
  }

  const rawValue = storage.getItem(PROFILE_STORAGE_KEY);

  if (!rawValue) {
    return {} as Record<string, ProfileRecord>;
  }

  try {
    const parsed = JSON.parse(rawValue) as unknown;

    if (typeof parsed !== "object" || parsed === null) {
      return {} as Record<string, ProfileRecord>;
    }

    return Object.fromEntries(
      Object.entries(parsed as Record<string, unknown>).flatMap(([userId, value]) => {
        const result = PROFILE_RECORD_SCHEMA.safeParse(value);

        return result.success ? [[userId, result.data]] : [];
      }),
    ) as Record<string, ProfileRecord>;
  } catch {
    return {} as Record<string, ProfileRecord>;
  }
}

function writeLocalProfiles(profiles: Record<string, ProfileRecord>) {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  storage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profiles));
}

function createLocalRepository(): ProfileRepository {
  return {
    async get(userId) {
      return readLocalProfiles()[userId] ?? null;
    },

    async save(input) {
      const validated = PROFILE_SAVE_INPUT_SCHEMA.parse(input);
      const profiles = readLocalProfiles();
      const currentProfile = profiles[validated.userId];
      const now = new Date().toISOString();

      const nextProfile = PROFILE_RECORD_SCHEMA.parse({
        created_at: currentProfile?.created_at ?? now,
        display_name: validated.displayName,
        email: validated.email,
        id: validated.userId,
        updated_at: now,
      });

      profiles[validated.userId] = nextProfile;
      writeLocalProfiles(profiles);

      return nextProfile;
    },
  };
}

function createSupabaseRepository(client: SupabaseClient): ProfileRepository {
  return {
    async get(userId) {
      const { data, error } = await client
        .from(PROFILE_TABLE)
        .select("id, email, display_name, created_at, updated_at")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        throw new Error(error.message);
      }

      if (!data) {
        return null;
      }

      return PROFILE_RECORD_SCHEMA.parse(data);
    },

    async save(input) {
      const validated = PROFILE_SAVE_INPUT_SCHEMA.parse(input);
      const now = new Date().toISOString();

      const { data, error } = await client
        .from(PROFILE_TABLE)
        .upsert(
          {
            display_name: validated.displayName,
            email: validated.email,
            id: validated.userId,
            updated_at: now,
          },
          { onConflict: "id" },
        )
        .select("id, email, display_name, created_at, updated_at")
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return PROFILE_RECORD_SCHEMA.parse(data);
    },
  };
}

export function createProfileRepository(client: SupabaseClient | null = getSupabaseClient()): ProfileRepository {
  if (!client) {
    return createLocalRepository();
  }

  return createSupabaseRepository(client);
}