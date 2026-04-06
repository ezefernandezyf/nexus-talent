import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
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

function createGitHubClient(overrides: Partial<GitHubClient> = {}): GitHubClient {
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

  it("enriches the analysis when github lookup succeeds", async () => {
    const deferred = createDeferred<Awaited<ReturnType<JobAnalysisClient["analyzeJobDescription"]>>>();
    const client: JobAnalysisClient = {
      analyzeJobDescription: vi.fn(() => deferred.promise),
    };
    const repository = createAnalysisRepository();
    const githubClient = createGitHubClient();
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
});