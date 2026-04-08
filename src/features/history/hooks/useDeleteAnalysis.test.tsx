import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { type AnalysisRepository } from "../../../lib/repositories";
import { useDeleteAnalysis } from "./useDeleteAnalysis";
import { getAnalysisHistoryQueryKey } from "../../analysis/hooks/useAnalysisHistory";

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
    delete: vi.fn(async () => undefined),
  };
}

describe("useDeleteAnalysis", () => {
  it("deletes an analysis and invalidates the shared history query", async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        mutations: { retry: false },
        queries: { retry: false },
      },
    });
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const repository = createRepository();
    const wrapper = createWrapper(queryClient);
    const { result } = renderHook(() => useDeleteAnalysis({ repository, scope: "authenticated" }), { wrapper });

    await act(async () => {
      result.current.deleteAnalysis("550e8400-e29b-41d4-a716-446655440000");
    });

    await waitFor(() => expect(repository.delete).toHaveBeenCalledWith("550e8400-e29b-41d4-a716-446655440000"));
    await waitFor(() => expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: getAnalysisHistoryQueryKey("authenticated") }));
  });
});