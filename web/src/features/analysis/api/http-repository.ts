import { apiClient } from "../../../core/api-client";
import type {
  AnalysisPage,
  AnalysisPageResult,
  AnalysisRepository,
  AnalysisUpdatePatch,
  SavedJobAnalysis,
} from "./repository";
import type { JobAnalysisResult } from "../schemas/job-analysis";

const BASE_URL = "/analyses";

/**
 * HTTP-based implementation of AnalysisRepository.
 * Communicates with the Express backend at /api/analyses.
 *
 * `save()` is a pass-through: the server already persists during POST /api/ai/analyze
 * (P3 coupling). This method returns a compatible shape for the caller.
 */
export function createHttpAnalysisRepository(): AnalysisRepository {
  return {
    async save(_jobDescription: string, _result: JobAnalysisResult): Promise<SavedJobAnalysis> {
      return {
        ..._result,
        id: (_result as Record<string, unknown>).id as string ?? crypto.randomUUID(),
        createdAt: (_result as Record<string, unknown>).createdAt as string ?? new Date().toISOString(),
        jobDescription: _jobDescription,
      } as SavedJobAnalysis;
    },

    async getAll(params?: AnalysisPage): Promise<AnalysisPageResult> {
      const query: Record<string, string> = {};

      if (params?.page !== undefined) {
        query.page = String(params.page);
      }

      if (params?.limit !== undefined) {
        query.limit = String(params.limit);
      }

      const { data } = await apiClient.get<AnalysisPageResult>(BASE_URL, { params: query });
      return data;
    },

    async getById(id: string): Promise<SavedJobAnalysis | null> {
      try {
        const { data } = await apiClient.get<SavedJobAnalysis>(`${BASE_URL}/${id}`);
        return data;
      } catch {
        return null;
      }
    },

    async update(id: string, patch: AnalysisUpdatePatch): Promise<SavedJobAnalysis | null> {
      try {
        const { data } = await apiClient.patch<SavedJobAnalysis>(`${BASE_URL}/${id}`, patch);
        return data;
      } catch {
        return null;
      }
    },

    async delete(id: string): Promise<void> {
      await apiClient.delete(`${BASE_URL}/${id}`);
    },
  };
}
