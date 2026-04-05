import { beforeEach, describe, expect, it, vi } from "vitest";
import { ANALYSIS_HISTORY_STORAGE_KEY } from "./analysis-repository";
import { createLocalAnalysisRepository } from "./local-analysis-repository";

const ANALYSIS_ID = "550e8400-e29b-41d4-a716-446655440000";

function buildResult(summary: string, subject: string) {
  return {
    summary,
    skillGroups: [
      {
        category: "Core stack",
        skills: [{ name: "React", level: "core" as const }],
      },
    ],
    outreachMessage: {
      subject,
      body: `${subject} body`,
    },
  };
}

describe("createLocalAnalysisRepository", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("saves, reads, and deletes analyses", async () => {
    const repository = createLocalAnalysisRepository();
    const saved = await repository.save("  Senior React engineer  ", buildResult("Summary", "Subject"));

    expect(saved.id).toMatch(/[0-9a-f-]{36}/i);
    expect(saved.createdAt).toContain("T");
    expect(saved.jobDescription).toBe("Senior React engineer");

    expect(await repository.getById(saved.id)).toEqual(saved);
    expect(await repository.getAll()).toEqual([saved]);

    await repository.delete(saved.id);
    expect(await repository.getAll()).toEqual([]);
    expect(localStorage.getItem(ANALYSIS_HISTORY_STORAGE_KEY)).toBe("[]");
  });

  it("returns null for missing analysis ids", async () => {
    const repository = createLocalAnalysisRepository();

    expect(await repository.getById("550e8400-e29b-41d4-a716-446655440000")).toBeNull();
  });

  it("returns analyses in descending createdAt order", async () => {
    const repository = createLocalAnalysisRepository();
    vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValueOnce("11111111-1111-4111-8111-111111111111").mockReturnValueOnce("22222222-2222-4222-8222-222222222222");
    vi.spyOn(Date.prototype, "toISOString")
      .mockReturnValueOnce("2026-04-05T12:00:00.000Z")
      .mockReturnValueOnce("2026-04-05T12:05:00.000Z");

    const first = await repository.save("First", buildResult("First summary", "First"));
    const second = await repository.save("Second", buildResult("Second summary", "Second"));

    expect(await repository.getAll()).toEqual([second, first]);
  });

  it("falls back to an empty collection when storage is invalid", async () => {
    localStorage.setItem(ANALYSIS_HISTORY_STORAGE_KEY, "not-json");

    const repository = createLocalAnalysisRepository();

    expect(await repository.getAll()).toEqual([]);
    expect(localStorage.getItem(ANALYSIS_HISTORY_STORAGE_KEY)).toBeNull();
  });
});