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
  });

  it("uses the Supabase profiles table when a client is configured", async () => {
    const maybeSingle = vi.fn(async () => ({ data: PROFILE_ROW, error: null }));
    const single = vi.fn(async () => ({ data: PROFILE_ROW, error: null }));
    const upsert = vi.fn(() => ({
      select: () => ({
        single,
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
      upsert,
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

    expect(from).toHaveBeenCalledWith("profiles");
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        display_name: "Marcus Sterling",
        email: "analyst@nexustalent.dev",
        id: "user-1",
      }),
      { onConflict: "id" },
    );
  });
});