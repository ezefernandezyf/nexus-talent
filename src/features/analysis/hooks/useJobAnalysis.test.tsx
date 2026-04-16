import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createAIOrchestratorError, AI_ERROR_CODES } from "../../../lib/ai-errors";
import { createJobAnalysisClient, type JobAnalysisClient } from "../../../lib/ai-client";
import { type GitHubClient } from "../../../lib/github-client";
import { createAnalysisRequest, createAnalysisRepository, createQueryClientWrapper } from "../../../test/factories/analysis";
import { useJobAnalysis } from "./useJobAnalysis";

function createDeferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });

  return { promise, resolve, reject };
}

function createGitHubClientStub(overrides: Partial<GitHubClient> = {}): GitHubClient {
  return {
    lookupRepository: vi.fn(async () => ({
      description: "React app with TypeScript",
      fullName: "ezefernandezyf/nexus-talent",
      languages: [{ name: "TypeScript", bytes: 1200 }],
      name: "nexus-talent",
      owner: "ezefernandezyf",
      primaryLanguage: "TypeScript",
      repositoryUrl: "https://github.com/ezefernandezyf/nexus-talent",
      topics: ["react"],
      warnings: [],
    })),
    ...overrides,
  };
}

describe("useJobAnalysis", () => {
  it("falls back to the built-in dependencies when no overrides are provided", () => {
    const wrapper = createQueryClientWrapper();
    const { result } = renderHook(() => useJobAnalysis(), { wrapper });

    expect(result.current.isIdle).toBe(true);
  });

  it("exposes pending and success states", async () => {
    const deferred = createDeferred<Awaited<ReturnType<JobAnalysisClient["analyzeJobDescription"]>>>();
    const client: JobAnalysisClient = {
      analyzeJobDescription: vi.fn(() => deferred.promise),
    };
    const repository = createAnalysisRepository();
    const wrapper = createQueryClientWrapper();
    const { result } = renderHook(() => useJobAnalysis({ client, repository }), { wrapper });

    result.current.submitAnalysis(createAnalysisRequest());

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

  it("discards late results from a previous vacancy and keeps the active vacancy visible", async () => {
    const firstDeferred = createDeferred<Awaited<ReturnType<JobAnalysisClient["analyzeJobDescription"]>>>();
    const secondDeferred = createDeferred<Awaited<ReturnType<JobAnalysisClient["analyzeJobDescription"]>>>();
    const client: JobAnalysisClient = {
      analyzeJobDescription: vi
        .fn()
        .mockImplementationOnce(() => firstDeferred.promise)
        .mockImplementationOnce(() => secondDeferred.promise),
    };
    const repository = createAnalysisRepository();
    const wrapper = createQueryClientWrapper();
    const { result } = renderHook(() => useJobAnalysis({ client, repository }), { wrapper });

    result.current.submitAnalysis(createAnalysisRequest({ jobDescription: "Vacancy A" }));

    await waitFor(() => expect(result.current.isPending).toBe(true));

    result.current.submitAnalysis(createAnalysisRequest({ jobDescription: "Vacancy B" }));

    await waitFor(() => expect(result.current.isPending).toBe(true));

    firstDeferred.resolve({
      summary: "Resultado antiguo para la vacante A.",
      skillGroups: [
        {
          category: "Stack principal",
          skills: [{ name: "React", level: "core" }],
        },
      ],
      outreachMessage: {
        subject: "Vacancy A",
        body: "A",
      },
    });

    await waitFor(() => expect(result.current.isPending).toBe(true));
    expect(result.current.data).toBeUndefined();
    expect(repository.save).not.toHaveBeenCalledWith(
      "Vacancy A",
      expect.objectContaining({ summary: "Resultado antiguo para la vacante A." }),
    );

    secondDeferred.resolve({
      summary: "Resultado vigente para la vacante B.",
      skillGroups: [
        {
          category: "Stack principal",
          skills: [{ name: "TypeScript", level: "strong" }],
        },
      ],
      outreachMessage: {
        subject: "Vacancy B",
        body: "B",
      },
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.summary).toContain("vacante B");
    expect(repository.save).toHaveBeenCalledTimes(1);
    expect(repository.save).toHaveBeenCalledWith(
      "Vacancy B",
      expect.objectContaining({ summary: "Resultado vigente para la vacante B." }),
    );
  });

  it("surfaces network failures", async () => {
    const client: JobAnalysisClient = {
      analyzeJobDescription: vi.fn(async () => {
        throw new Error("Network unavailable");
      }),
    };
    const repository = createAnalysisRepository();
    const wrapper = createQueryClientWrapper();
    const { result } = renderHook(() => useJobAnalysis({ client, repository }), { wrapper });

    result.current.submitAnalysis(createAnalysisRequest());

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toMatchObject({ message: "No se pudo completar el análisis." });
    expect(repository.save).not.toHaveBeenCalled();
  });

  it("surfaces AI orchestrator errors as-is", async () => {
    const client: JobAnalysisClient = {
      analyzeJobDescription: vi.fn(async () => {
        throw createAIOrchestratorError(AI_ERROR_CODES.TRANSIENT_FAILURE, "Gateway throttled");
      }),
    };
    const repository = createAnalysisRepository();
    const wrapper = createQueryClientWrapper();
    const { result } = renderHook(() => useJobAnalysis({ client, repository }), { wrapper });

    result.current.submitAnalysis(createAnalysisRequest());

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error).toMatchObject({ message: "Gateway throttled", name: "AIOrchestratorError" });
    expect(repository.save).not.toHaveBeenCalled();
  });

  it("preserves the schema validation message when the client path throws it", async () => {
    const client: JobAnalysisClient = {
      analyzeJobDescription: vi.fn(async () => {
        throw new Error("Pegá una descripción del puesto antes de ejecutar el análisis.");
      }),
    };
    const repository = createAnalysisRepository();
    const wrapper = createQueryClientWrapper();
    const { result } = renderHook(() => useJobAnalysis({ client, repository }), { wrapper });

    result.current.submitAnalysis(createAnalysisRequest());

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe("Pegá una descripción del puesto antes de ejecutar el análisis.");

    await expect(
      result.current.mutateAsync(createAnalysisRequest({ jobDescription: "" })),
    ).rejects.toThrow(/No se pudo completar el análisis/i);

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
    const repository = createAnalysisRepository();
    const wrapper = createQueryClientWrapper();
    const { result } = renderHook(() => useJobAnalysis({ client, repository }), { wrapper });

    result.current.submitAnalysis(createAnalysisRequest());

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toContain("La respuesta de IA no es válida");
    expect(repository.save).not.toHaveBeenCalled();
  });

  it("ignores stale errors from a previous vacancy", async () => {
    const firstDeferred = createDeferred<Awaited<ReturnType<JobAnalysisClient["analyzeJobDescription"]>>>();
    const secondDeferred = createDeferred<Awaited<ReturnType<JobAnalysisClient["analyzeJobDescription"]>>>();
    const client: JobAnalysisClient = {
      analyzeJobDescription: vi
        .fn()
        .mockImplementationOnce(() => firstDeferred.promise)
        .mockImplementationOnce(() => secondDeferred.promise),
    };
    const repository = createAnalysisRepository();
    const wrapper = createQueryClientWrapper();
    const { result } = renderHook(() => useJobAnalysis({ client, repository }), { wrapper });

    result.current.submitAnalysis(createAnalysisRequest({ jobDescription: "Vacancy A" }));

    await waitFor(() => expect(result.current.isPending).toBe(true));

    result.current.submitAnalysis(createAnalysisRequest({ jobDescription: "Vacancy B" }));

    await waitFor(() => expect(result.current.isPending).toBe(true));

    firstDeferred.reject(new Error("Old analysis failed"));

    await waitFor(() => expect(result.current.isPending).toBe(true));
    expect(result.current.error).toBeNull();

    secondDeferred.resolve({
      summary: "Resultado vigente para la vacante B.",
      skillGroups: [
        {
          category: "Stack principal",
          skills: [{ name: "TypeScript", level: "strong" }],
        },
      ],
      outreachMessage: {
        subject: "Vacancy B",
        body: "B",
      },
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.summary).toContain("vacante B");
    expect(repository.save).toHaveBeenCalledTimes(1);
  });

  it("skips GitHub enrichment when no repository URL is provided", async () => {
    const deferred = createDeferred<Awaited<ReturnType<JobAnalysisClient["analyzeJobDescription"]>>>();
    const client: JobAnalysisClient = {
      analyzeJobDescription: vi.fn(() => deferred.promise),
    };
    const repository = createAnalysisRepository();
    const githubClient = createGitHubClientStub();
    const wrapper = createQueryClientWrapper();
    const { result } = renderHook(() => useJobAnalysis({ client, repository, githubClient }), { wrapper });

    result.current.submitAnalysis(createAnalysisRequest({ githubRepositoryUrl: undefined }));

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
    expect(githubClient.lookupRepository).not.toHaveBeenCalled();
    expect(result.current.data?.githubEnrichment).toBeUndefined();
  });

  it("normalizes whitespace GitHub URLs before analysis", async () => {
    const deferred = createDeferred<Awaited<ReturnType<JobAnalysisClient["analyzeJobDescription"]>>>();
    const client: JobAnalysisClient = {
      analyzeJobDescription: vi.fn(() => deferred.promise),
    };
    const repository = createAnalysisRepository();
    const githubClient = createGitHubClientStub();
    const wrapper = createQueryClientWrapper();
    const { result } = renderHook(() => useJobAnalysis({ client, repository, githubClient }), { wrapper });

    result.current.submitAnalysis(createAnalysisRequest({ githubRepositoryUrl: "   " }));

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
    expect(githubClient.lookupRepository).not.toHaveBeenCalled();
    expect(repository.save).toHaveBeenCalledTimes(1);
  });

  it("enriches the analysis when github lookup succeeds", async () => {
    const deferred = createDeferred<Awaited<ReturnType<JobAnalysisClient["analyzeJobDescription"]>>>();
    const client: JobAnalysisClient = {
      analyzeJobDescription: vi.fn(() => deferred.promise),
    };
    const repository = createAnalysisRepository();
    const githubClient = createGitHubClientStub();
    const wrapper = createQueryClientWrapper();
    const { result } = renderHook(() => useJobAnalysis({ client, repository, githubClient }), { wrapper });

    result.current.submitAnalysis({
      ...createAnalysisRequest(),
      githubRepositoryUrl: "https://github.com/ezefernandezyf/nexus-talent",
    });

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
    expect(result.current.data?.githubEnrichment?.repositoryName).toBe("ezefernandezyf/nexus-talent");
    expect(result.current.data?.githubEnrichment?.detectedStack).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "TypeScript" }),
      ]),
    );
    expect(repository.save).toHaveBeenCalledTimes(1);
    expect(repository.save).toHaveBeenCalledWith(
      "Senior React engineer with TypeScript and testing",
      expect.objectContaining({
        githubEnrichment: expect.objectContaining({ repositoryName: "ezefernandezyf/nexus-talent" }),
      }),
    );
  });

  it("surfaces GitHub warnings when the repository metadata includes them", async () => {
    const deferred = createDeferred<Awaited<ReturnType<JobAnalysisClient["analyzeJobDescription"]>>>();
    const client: JobAnalysisClient = {
      analyzeJobDescription: vi.fn(() => deferred.promise),
    };
    const repository = createAnalysisRepository();
    const githubClient: GitHubClient = {
      lookupRepository: vi.fn(async () => ({
        description: "",
        fullName: "ezefernandezyf/empty-repo",
        languages: [],
        name: "empty-repo",
        owner: "ezefernandezyf",
        primaryLanguage: null,
        repositoryUrl: "https://github.com/ezefernandezyf/empty-repo",
        topics: [],
        warnings: ["Repo archived"],
      })),
    };
    const wrapper = createQueryClientWrapper();
    const { result } = renderHook(() => useJobAnalysis({ client, repository, githubClient }), { wrapper });

    result.current.submitAnalysis({
      ...createAnalysisRequest(),
      githubRepositoryUrl: "https://github.com/ezefernandezyf/empty-repo",
    });

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
    expect(result.current.data?.githubEnrichment?.warningMessage).toContain("Repo archived");
    expect(result.current.data?.githubEnrichment?.detectedStack).toEqual([]);
  });

  it("adds a fallback warning when GitHub metadata has no stack signals", async () => {
    const deferred = createDeferred<Awaited<ReturnType<JobAnalysisClient["analyzeJobDescription"]>>>();
    const client: JobAnalysisClient = {
      analyzeJobDescription: vi.fn(() => deferred.promise),
    };
    const repository = createAnalysisRepository();
    const githubClient: GitHubClient = {
      lookupRepository: vi.fn(async () => ({
        description: "",
        fullName: "ezefernandezyf/empty-repo",
        languages: [],
        name: "empty-repo",
        owner: "ezefernandezyf",
        primaryLanguage: null,
        repositoryUrl: "https://github.com/ezefernandezyf/empty-repo",
        topics: [],
        warnings: [],
      })),
    };
    const wrapper = createQueryClientWrapper();
    const { result } = renderHook(() => useJobAnalysis({ client, repository, githubClient }), { wrapper });

    result.current.submitAnalysis({
      ...createAnalysisRequest(),
      githubRepositoryUrl: "https://github.com/ezefernandezyf/empty-repo",
    });

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
    expect(result.current.data?.githubEnrichment?.warningMessage).toContain("No se detectaron señales claras");
    expect(result.current.data?.githubEnrichment?.detectedStack).toEqual([]);
  });

  it("keeps the base analysis when github lookup fails", async () => {
    const deferred = createDeferred<Awaited<ReturnType<JobAnalysisClient["analyzeJobDescription"]>>>();
    const client: JobAnalysisClient = {
      analyzeJobDescription: vi.fn(() => deferred.promise),
    };
    const repository = createAnalysisRepository();
    const githubClient: GitHubClient = {
      lookupRepository: vi.fn(async () => {
        throw new Error("GitHub unavailable");
      }),
    };
    const wrapper = createQueryClientWrapper();
    const { result } = renderHook(() => useJobAnalysis({ client, repository, githubClient }), { wrapper });

    result.current.submitAnalysis({
      ...createAnalysisRequest(),
      githubRepositoryUrl: "https://github.com/ezefernandezyf/nexus-talent",
    });

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
    expect(result.current.data?.githubEnrichment?.warningMessage).toContain("GitHub unavailable");
    expect(result.current.data?.githubEnrichment?.detectedStack).toEqual([]);
    expect(repository.save).toHaveBeenCalledTimes(1);
  });

  it("falls back to the default GitHub error message for non-error rejections", async () => {
    const deferred = createDeferred<Awaited<ReturnType<JobAnalysisClient["analyzeJobDescription"]>>>();
    const client: JobAnalysisClient = {
      analyzeJobDescription: vi.fn(() => deferred.promise),
    };
    const repository = createAnalysisRepository();
    const githubClient: GitHubClient = {
      lookupRepository: vi.fn(async () => {
        return Promise.reject("timeout");
      }),
    };
    const wrapper = createQueryClientWrapper();
    const { result } = renderHook(() => useJobAnalysis({ client, repository, githubClient }), { wrapper });

    result.current.submitAnalysis({
      ...createAnalysisRequest(),
      githubRepositoryUrl: "https://github.com/ezefernandezyf/nexus-talent",
    });

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
    expect(result.current.data?.githubEnrichment?.warningMessage).toBe("No se pudo completar la consulta a GitHub.");
    expect(result.current.data?.githubEnrichment?.detectedStack).toEqual([]);
  });
});