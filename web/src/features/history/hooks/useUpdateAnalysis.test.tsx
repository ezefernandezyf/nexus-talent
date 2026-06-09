import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { type AnalysisRepository } from "../../../lib/repositories";
import { getAnalysisByIdQueryKey } from "../../analysis/hooks/useAnalysisById";
import { getAnalysisHistoryQueryKey } from "../../analysis/hooks/useAnalysisHistory";
import { useUpdateAnalysis } from "./useUpdateAnalysis";

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

function createRepository(): AnalysisRepository {
  return {
    save: vi.fn(async () => {
      throw new Error("Not used");
    }),
    getAll: vi.fn(async () => []),
    getById: vi.fn(async () => null),
    update: vi.fn(async () => ({
      createdAt: "2026-04-05T12:00:00.000Z",
      displayName: "Frontend Lead",
      id: "550e8400-e29b-41d4-a716-446655440000",
      jobDescription: "Senior React engineer",
      notes: "Prioritize product polish",
      outreachMessage: { body: "Body", subject: "Subject" },
      skillGroups: [],
      summary: "Summary",
    })),
    delete: vi.fn(async () => undefined),
  };
}

describe("useUpdateAnalysis", () => {
  it("updates a saved analysis and invalidates the history queries", async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        mutations: { retry: false },
        queries: { retry: false },
      },
    });
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const repository = createRepository();
    const wrapper = createWrapper(queryClient);
    const { result } = renderHook(() => useUpdateAnalysis({ repository, scope: "authenticated" }), { wrapper });

    await act(async () => {
      await result.current.updateAnalysisAsync({
        analysisId: "550e8400-e29b-41d4-a716-446655440000",
        patch: {
          displayName: "Frontend Lead",
          notes: "Prioritize product polish",
        },
      });
    });

    await waitFor(() => expect(repository.update).toHaveBeenCalledWith(
      "550e8400-e29b-41d4-a716-446655440000",
      {
        displayName: "Frontend Lead",
        notes: "Prioritize product polish",
      },
    ));
    await waitFor(() => expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: getAnalysisHistoryQueryKey("authenticated") }));
    await waitFor(() => expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: getAnalysisByIdQueryKey("authenticated", "550e8400-e29b-41d4-a716-446655440000"),
    }));
  });
});