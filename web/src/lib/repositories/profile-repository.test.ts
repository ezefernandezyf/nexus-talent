import { beforeEach, describe, expect, it, vi } from "vitest";
import { createProfileRepository } from "./profile-repository";

const PROFILE_ROW = {
  created_at: "2026-04-05T12:00:00.000Z",
  display_name: "Marcus Sterling",
  email: "analyst@nexustalent.dev",
  id: "user-1",
  updated_at: "2026-04-05T12:00:00.000Z",
};

describe("createProfileRepository", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("falls back to local storage when no Supabase client is available", async () => {
    const repository = createProfileRepository(null);

    await expect(repository.get("user-1")).resolves.toBeNull();

    const saved = await repository.save({
      displayName: "Marcus Sterling",
      email: "analyst@nexustalent.dev",
      userId: "user-1",
    });

    expect(saved.display_name).toBe("Marcus Sterling");
    expect(JSON.parse(localStorage.getItem("nexus-talent:profile:v1") ?? "{}")).toMatchObject({
      "user-1": {
        display_name: "Marcus Sterling",
        email: "analyst@nexustalent.dev",
        id: "user-1",
      },
    });

    await repository.delete("user-1");
    await expect(repository.get("user-1")).resolves.toBeNull();
  });

  it("uses the Supabase profiles table when a client is configured", async () => {
    const maybeSingle = vi.fn(async () => ({ data: PROFILE_ROW, error: null }));
    const updateMaybeSingle = vi.fn(async () => ({ data: PROFILE_ROW, error: null }));
    const insertMaybeSingle = vi.fn(async () => ({ data: PROFILE_ROW, error: null }));
    const deleteRow = vi.fn(async () => ({ error: null }));
    const update = vi.fn(() => ({
      eq: () => ({
        select: () => ({
          maybeSingle: updateMaybeSingle,
        }),
      }),
    }));
    const insert = vi.fn(() => ({
      select: () => ({
        maybeSingle: insertMaybeSingle,
      }),
    }));
    const from = vi.fn(() => ({
      eq: () => ({
        maybeSingle,
      }),
      delete: () => ({
        eq: deleteRow,
      }),
      select: () => ({
        eq: () => ({
          maybeSingle,
        }),
      }),
      update,
      insert,
    }));

    const repository = createProfileRepository({ from } as never);

    await expect(repository.get("user-1")).resolves.toMatchObject({
      display_name: "Marcus Sterling",
      email: "analyst@nexustalent.dev",
    });

    await expect(
      repository.save({
        displayName: "Marcus Sterling",
        email: "analyst@nexustalent.dev",
        userId: "user-1",
      }),
    ).resolves.toMatchObject({
      id: "user-1",
    });

    await expect(repository.delete("user-1")).resolves.toBeUndefined();

    expect(from).toHaveBeenCalledWith("profiles");
    expect(update).toHaveBeenCalledWith({
      display_name: "Marcus Sterling",
      email: "analyst@nexustalent.dev",
    });
    expect(insert).not.toHaveBeenCalled();
    expect(deleteRow).toHaveBeenCalledWith("id", "user-1");
  });

  it("normalizes Supabase timestamps that include an offset", async () => {
    const offsetRow = {
      ...PROFILE_ROW,
      created_at: "2026-04-05T12:00:00+00:00",
      updated_at: "2026-04-05T12:00:00+00:00",
    };
    const maybeSingle = vi.fn(async () => ({ data: offsetRow, error: null }));
    const from = vi.fn(() => ({
      eq: () => ({
        maybeSingle,
      }),
      select: () => ({
        eq: () => ({
          maybeSingle,
        }),
      }),
    }));

    const repository = createProfileRepository({ from } as never);

    await expect(repository.get("user-1")).resolves.toMatchObject({
      created_at: "2026-04-05T12:00:00.000Z",
      updated_at: "2026-04-05T12:00:00.000Z",
    });
  });

  it("falls back to insert when the profile row does not exist", async () => {
    const maybeSingle = vi.fn(async () => ({ data: PROFILE_ROW, error: null }));
    const updateMaybeSingle = vi.fn(async () => ({ data: null, error: null }));
    const insertMaybeSingle = vi.fn(async () => ({ data: PROFILE_ROW, error: null }));
    const update = vi.fn(() => ({
      eq: () => ({
        select: () => ({
          maybeSingle: updateMaybeSingle,
        }),
      }),
    }));
    const insert = vi.fn(() => ({
      select: () => ({
        maybeSingle: insertMaybeSingle,
      }),
    }));
    const from = vi.fn(() => ({
      eq: () => ({
        maybeSingle,
      }),
      select: () => ({
        eq: () => ({
          maybeSingle,
        }),
      }),
      update,
      insert,
    }));

    const repository = createProfileRepository({ from } as never);

    await expect(
      repository.save({
        displayName: "Marcus Sterling",
        email: "analyst@nexustalent.dev",
        userId: "user-1",
      }),
    ).resolves.toMatchObject({
      id: "user-1",
    });

    expect(update).toHaveBeenCalledTimes(1);
    expect(insert).toHaveBeenCalledWith({
      display_name: "Marcus Sterling",
      email: "analyst@nexustalent.dev",
      id: "user-1",
    });
  });

  it("ignores malformed Supabase rows instead of breaking settings", async () => {
    const maybeSingle = vi.fn(async () => ({
      data: {
        created_at: "not-a-date",
        display_name: "Marcus Sterling",
        email: "analyst@nexustalent.dev",
        id: "user-1",
        updated_at: "still-not-a-date",
      },
      error: null,
    }));
    const from = vi.fn(() => ({
      eq: () => ({
        maybeSingle,
      }),
      select: () => ({
        eq: () => ({
          maybeSingle,
        }),
      }),
    }));

    const repository = createProfileRepository({ from } as never);

    await expect(repository.get("user-1")).resolves.toBeNull();
  });
});