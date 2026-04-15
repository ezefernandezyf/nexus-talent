import { z } from "zod";
import {
  ANALYSIS_HISTORY_STORAGE_KEY,
  type AnalysisUpdatePatch,
  type AnalysisRepository,
} from "./analysis-repository";
import { SAVED_JOB_ANALYSIS_SCHEMA, type JobAnalysisResult, type SavedJobAnalysis } from "../../schemas/job-analysis";

const SAVED_ANALYSIS_COLLECTION_SCHEMA = z.array(SAVED_JOB_ANALYSIS_SCHEMA);

function getStorage() {
  try {
    return globalThis.localStorage;
  } catch {
    return null;
  }
}

function createIdentifier() {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `analysis-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function sortByCreatedAtDesc(left: SavedJobAnalysis, right: SavedJobAnalysis) {
  return right.createdAt.localeCompare(left.createdAt);
}

function readPersistedAnalyses(storage: Storage | null) {
  if (!storage) {
    return [] as SavedJobAnalysis[];
  }

  const rawValue = storage.getItem(ANALYSIS_HISTORY_STORAGE_KEY);
  if (!rawValue) {
    return [] as SavedJobAnalysis[];
  }

  try {
    const parsed = JSON.parse(rawValue) as unknown;
    const validated = SAVED_ANALYSIS_COLLECTION_SCHEMA.safeParse(parsed);

    if (!validated.success) {
      storage.removeItem(ANALYSIS_HISTORY_STORAGE_KEY);
      return [] as SavedJobAnalysis[];
    }

    return [...validated.data].sort(sortByCreatedAtDesc);
  } catch {
    storage.removeItem(ANALYSIS_HISTORY_STORAGE_KEY);
    return [] as SavedJobAnalysis[];
  }
}

function writePersistedAnalyses(storage: Storage | null, analyses: SavedJobAnalysis[]) {
  if (!storage) {
    return;
  }

  storage.setItem(ANALYSIS_HISTORY_STORAGE_KEY, JSON.stringify(analyses));
}

function applyAnalysisPatch(analysis: SavedJobAnalysis, patch: AnalysisUpdatePatch) {
  return SAVED_JOB_ANALYSIS_SCHEMA.parse({
    ...analysis,
    ...(patch.displayName !== undefined ? { displayName: patch.displayName } : {}),
    ...(patch.notes !== undefined ? { notes: patch.notes } : {}),
  });
}

function buildSavedAnalysis(jobDescription: string, result: JobAnalysisResult): SavedJobAnalysis {
  return {
    ...result,
    id: createIdentifier(),
    createdAt: new Date().toISOString(),
    jobDescription: jobDescription.trim(),
  };
}

export function createLocalAnalysisRepository(): AnalysisRepository {
  return {
    async save(jobDescription, result) {
      const storage = getStorage();
      const savedAnalysis = buildSavedAnalysis(jobDescription, result);
      const existingAnalyses = readPersistedAnalyses(storage);
      const nextAnalyses = [savedAnalysis, ...existingAnalyses].sort(sortByCreatedAtDesc);

      writePersistedAnalyses(storage, nextAnalyses);

      return savedAnalysis;
    },

    async getAll() {
      return readPersistedAnalyses(getStorage());
    },

    async getById(id) {
      return readPersistedAnalyses(getStorage()).find((analysis) => analysis.id === id) ?? null;
    },

    async update(id, patch) {
      const storage = getStorage();
      const existingAnalyses = readPersistedAnalyses(storage);
      const index = existingAnalyses.findIndex((analysis) => analysis.id === id);

      if (index < 0) {
        return null;
      }

      const updatedAnalysis = applyAnalysisPatch(existingAnalyses[index], patch);
      const nextAnalyses = [...existingAnalyses];
      nextAnalyses[index] = updatedAnalysis;

      writePersistedAnalyses(storage, nextAnalyses);

      return updatedAnalysis;
    },

    async delete(id) {
      const storage = getStorage();
      const existingAnalyses = readPersistedAnalyses(storage);
      const nextAnalyses = existingAnalyses.filter((analysis) => analysis.id !== id);

      if (nextAnalyses.length === existingAnalyses.length) {
        return;
      }

      writePersistedAnalyses(storage, nextAnalyses);
    },
  };
}