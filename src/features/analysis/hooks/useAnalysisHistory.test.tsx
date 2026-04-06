import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createAnalysisRepository, createQueryClientWrapper, createSavedAnalysis } from "../../../test/factories/analysis";
import { useAnalysisHistory } from "./useAnalysisHistory";

describe("useAnalysisHistory", () => {
  it("defaults to an empty list before the query resolves", () => {
    const repository = createAnalysisRepository({ analyses: [] });
    const wrapper = createQueryClientWrapper();
    const { result } = renderHook(() => useAnalysisHistory({ repository }), { wrapper });

    expect(result.current.analyses).toEqual([]);
  });

  it("exposes an empty history when no records exist", async () => {
    const repository = createAnalysisRepository({ analyses: [] });
    const wrapper = createQueryClientWrapper();
    const { result } = renderHook(() => useAnalysisHistory({ repository }), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.analyses).toEqual([]);
  });

  it("returns saved analyses sorted by recency", async () => {
    const repository = createAnalysisRepository({
      analyses: [
        createSavedAnalysis({
          id: "11111111-1111-4111-8111-111111111111",
          createdAt: "2026-04-05T12:00:00.000Z",
          jobDescription: "First",
          summary: "First summary",
          skillGroups: [],
          outreachMessage: { subject: "First", body: "First body" },
        }),
        createSavedAnalysis({
          id: "22222222-2222-4222-8222-222222222222",
          createdAt: "2026-04-05T12:05:00.000Z",
          jobDescription: "Second",
          summary: "Second summary",
          skillGroups: [],
          outreachMessage: { subject: "Second", body: "Second body" },
        }),
      ],
    });
    const wrapper = createQueryClientWrapper();
    const { result } = renderHook(() => useAnalysisHistory({ repository }), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.analyses.map((analysis) => analysis.id)).toEqual([
      "22222222-2222-4222-8222-222222222222",
      "11111111-1111-4111-8111-111111111111",
    ]);
  });
});