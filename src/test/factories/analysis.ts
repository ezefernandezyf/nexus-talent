import { vi } from "vitest";
import { type AnalysisRepository } from "../../lib/repositories";
import {
  JOB_ANALYSIS_MESSAGE_TONE,
  JOB_ANALYSIS_SKILL_LEVEL,
  type JobAnalysisRequest,
  type JobAnalysisResult,
  type SavedJobAnalysis,
} from "../../schemas/job-analysis";
import { createQueryClientWrapper } from "../mocks/query-client";

export function createAnalysisRequest(overrides: Partial<JobAnalysisRequest> = {}): JobAnalysisRequest {
  return {
    jobDescription: "Senior React engineer with TypeScript and testing",
    messageTone: JOB_ANALYSIS_MESSAGE_TONE.FORMAL,
    githubRepositoryUrl: undefined,
    ...overrides,
  };
}

export function createAnalysisResult(overrides: Partial<JobAnalysisResult> = {}): JobAnalysisResult {
  return {
    summary: "Un rol enfocado en construir experiencias de producto.",
    skillGroups: [
      {
        category: "Stack principal",
        skills: [{ name: "React", level: JOB_ANALYSIS_SKILL_LEVEL.CORE }],
      },
    ],
    outreachMessage: {
      subject: "Interés en el puesto",
      body: "Hola equipo,\n\nRevisé la vacante.\n\nSaludos,\n[Your Name]",
    },
    ...overrides,
  };
}

export function createSavedAnalysis(overrides: Partial<SavedJobAnalysis> = {}): SavedJobAnalysis {
  return {
    id: "550e8400-e29b-41d4-a716-446655440000",
    createdAt: "2026-04-05T12:00:00.000Z",
    jobDescription: "Senior React engineer with TypeScript and testing",
    ...createAnalysisResult(),
    ...overrides,
  };
}

interface CreateAnalysisRepositoryOptions {
  analyses?: SavedJobAnalysis[];
  savedAnalysis?: SavedJobAnalysis;
  overrides?: Partial<AnalysisRepository>;
}

export function createAnalysisRepository(options: CreateAnalysisRepositoryOptions = {}): AnalysisRepository {
  const analyses = options.analyses ?? [createSavedAnalysis()];
  const savedAnalysis = options.savedAnalysis ?? analyses[0] ?? createSavedAnalysis();

  return {
    save: vi.fn(async (jobDescription, result) => ({
      ...savedAnalysis,
      jobDescription,
      ...result,
    })),
    getAll: vi.fn(async () => analyses),
    getById: vi.fn(async (id) => analyses.find((analysis) => analysis.id === id) ?? null),
    delete: vi.fn(async () => undefined),
    ...options.overrides,
  };
}

export { createQueryClientWrapper } from "../mocks/query-client";