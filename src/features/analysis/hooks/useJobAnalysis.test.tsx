import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createJobAnalysisClient, type JobAnalysisClient } from "../../../lib/ai-client";
import { type AnalysisRepository } from "../../../lib/repositories";
import { useJobAnalysis } from "./useJobAnalysis";

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

function createDeferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });

  return { promise, resolve, reject };
}

function createRepository(overrides: Partial<AnalysisRepository> = {}): AnalysisRepository {
  return {
    save: vi.fn(async () => ({
      id: "550e8400-e29b-41d4-a716-446655440000",
      createdAt: "2026-04-05T12:00:00.000Z",
      jobDescription: "Senior React engineer with TypeScript and testing",
      summary: "Persisted summary",
      skillGroups: [],
      outreachMessage: {
        subject: "Persisted subject",
        body: "Persisted body",
      },
    })),
    getAll: vi.fn(async () => []),
    getById: vi.fn(async () => null),
    delete: vi.fn(async () => undefined),
    ...overrides,
  };
}

describe("useJobAnalysis", () => {
  it("exposes pending and success states", async () => {
    const deferred = createDeferred<Awaited<ReturnType<JobAnalysisClient["analyzeJobDescription"]>>>();
    const client: JobAnalysisClient = {
      analyzeJobDescription: vi.fn(() => deferred.promise),
    };
    const repository = createRepository();
    const wrapper = createWrapper();
    const { result } = renderHook(() => useJobAnalysis({ client, repository }), { wrapper });

    result.current.submitAnalysis("Senior React engineer with TypeScript and testing");

    await waitFor(() => expect(result.current.isPending).toBe(true));

    deferred.resolve({
      summary: "Un rol enfocado en construir experiencias de producto.",
      skillGroups: [
        {
          category: "Stack principal",
          skills: [{ name: "React", level: "core" }],
        },
      ],
      outreachMessage: {
        subject: "Interés en el puesto",
        body: "Hola equipo,\n\nQuisiera conversar sobre la vacante.\n\nSaludos,\n[Your Name]",
      },
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.summary).toContain("rol enfocado");
    expect(repository.save).toHaveBeenCalledTimes(1);
  });

  it("surfaces network failures", async () => {
    const client: JobAnalysisClient = {
      analyzeJobDescription: vi.fn(async () => {
        throw new Error("Network unavailable");
      }),
    };
    const repository = createRepository();
    const wrapper = createWrapper();
    const { result } = renderHook(() => useJobAnalysis({ client, repository }), { wrapper });

    result.current.submitAnalysis("Senior React engineer with TypeScript and testing");

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toMatchObject({ message: "No se pudo completar el análisis." });
    expect(repository.save).not.toHaveBeenCalled();
  });

  it("surfaces invalid ai payloads", async () => {
    const client = createJobAnalysisClient({
      transport: async () => ({
        summary: "",
        skillGroups: [],
        outreachMessage: {
          subject: "",
          body: "",
        },
      }),
    });
    const repository = createRepository();
    const wrapper = createWrapper();
    const { result } = renderHook(() => useJobAnalysis({ client, repository }), { wrapper });

    result.current.submitAnalysis("Senior React engineer with TypeScript and testing");

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toContain("La respuesta de IA no es válida");
    expect(repository.save).not.toHaveBeenCalled();
  });
});