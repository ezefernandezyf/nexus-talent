import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { type AnalysisRepository } from "../../../lib/repositories";
import { useAnalysisHistory } from "./useAnalysisHistory";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

function createRepository(analyses: Awaited<ReturnType<AnalysisRepository["getAll"]>>) {
  return {
    save: vi.fn(async () => analyses[0]!),
    getAll: vi.fn(async () => analyses),
    getById: vi.fn(async () => null),
    delete: vi.fn(async () => undefined),
  } satisfies AnalysisRepository;
}

describe("useAnalysisHistory", () => {
  it("exposes an empty history when no records exist", async () => {
    const repository = createRepository([]);
    const wrapper = createWrapper();
    const { result } = renderHook(() => useAnalysisHistory({ repository }), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.analyses).toEqual([]);
  });

  it("returns saved analyses sorted by recency", async () => {
    const repository = createRepository([
      {
        id: "11111111-1111-4111-8111-111111111111",
        createdAt: "2026-04-05T12:00:00.000Z",
        jobDescription: "First",
        summary: "First summary",
        skillGroups: [],
        outreachMessage: { subject: "First", body: "First body" },
      },
      {
        id: "22222222-2222-4222-8222-222222222222",
        createdAt: "2026-04-05T12:05:00.000Z",
        jobDescription: "Second",
        summary: "Second summary",
        skillGroups: [],
        outreachMessage: { subject: "Second", body: "Second body" },
      },
    ]);
    const wrapper = createWrapper();
    const { result } = renderHook(() => useAnalysisHistory({ repository }), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.analyses.map((analysis) => analysis.id)).toEqual([
      "22222222-2222-4222-8222-222222222222",
      "11111111-1111-4111-8111-111111111111",
    ]);
  });
});