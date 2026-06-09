import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseClient } from "../supabase";
import { PROFILE_RECORD_SCHEMA, PROFILE_SAVE_INPUT_SCHEMA, type ProfileRecord, type ProfileSaveInput } from "../validation/profile";

const PROFILE_TABLE = "profiles";
const PROFILE_STORAGE_KEY = "nexus-talent:profile:v1";

export interface ProfileRepository {
  get(userId: string): Promise<ProfileRecord | null>;
  delete(userId: string): Promise<void>;
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

function isValidIsoDate(value: unknown) {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function normalizeProfileRecord(input: unknown, fallbackCreatedAt: string, fallbackUpdatedAt: string): ProfileRecord {
  const parsed = PROFILE_RECORD_SCHEMA.safeParse(input);

  if (parsed.success) {
    return parsed.data;
  }

  if (typeof input !== "object" || input === null) {
    throw new Error("No se pudo guardar el perfil.");
  }

  const record = input as Record<string, unknown>;
  const id = typeof record.id === "string" ? record.id.trim() : "";
  const email = typeof record.email === "string" ? record.email.trim() : "";
  const displayName = typeof record.display_name === "string" ? record.display_name.trim() : null;
  const createdAt = isValidIsoDate(record.created_at) ? record.created_at : fallbackCreatedAt;
  const updatedAt = isValidIsoDate(record.updated_at) ? record.updated_at : fallbackUpdatedAt;

  if (!id || !email) {
    throw new Error("No se pudo guardar el perfil.");
  }

  return PROFILE_RECORD_SCHEMA.parse({
    created_at: createdAt,
    display_name: displayName && displayName.length > 0 ? displayName : null,
    email,
    id,
    updated_at: updatedAt,
  });
}

function createLocalRepository(): ProfileRepository {
  return {
    async get(userId) {
      return readLocalProfiles()[userId] ?? null;
    },

    async delete(userId) {
      const profiles = readLocalProfiles();

      if (profiles[userId]) {
        delete profiles[userId];
        writeLocalProfiles(profiles);
      }
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

      const parsed = PROFILE_RECORD_SCHEMA.safeParse(data);

      return parsed.success ? parsed.data : null;
    },

    async delete(userId) {
      const { error } = await client.from(PROFILE_TABLE).delete().eq("id", userId);

      if (error) {
        throw new Error(error.message);
      }
    },

    async save(input) {
      const validated = PROFILE_SAVE_INPUT_SCHEMA.parse(input);
      const columns = "id, email, display_name, created_at, updated_at";
      const now = new Date().toISOString();

      const { data: updatedProfile, error: updateError } = await client
        .from(PROFILE_TABLE)
        .update({
          display_name: validated.displayName,
          email: validated.email,
        })
        .eq("id", validated.userId)
        .select(columns)
        .maybeSingle();

      if (updateError) {
        throw new Error(updateError.message);
      }

      if (updatedProfile) {
        return normalizeProfileRecord(updatedProfile, now, now);
      }

      const { data: insertedProfile, error: insertError } = await client
        .from(PROFILE_TABLE)
        .insert({
          display_name: validated.displayName,
          email: validated.email,
          id: validated.userId,
        })
        .select(columns)
        .maybeSingle();

      if (insertError) {
        throw new Error(insertError.message);
      }

      if (!insertedProfile) {
        throw new Error("No se pudo guardar el perfil.");
      }

      return normalizeProfileRecord(insertedProfile, now, now);
    },
  };
}

export function createProfileRepository(client: SupabaseClient | null = getSupabaseClient()): ProfileRepository {
  if (!client) {
    return createLocalRepository();
  }

  return createSupabaseRepository(client);
}