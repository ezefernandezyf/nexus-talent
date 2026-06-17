import type { AnalysisRepository, AnalysisUpdatePatch, SavedJobAnalysis } from "./analysis-repository";
import type { JobAnalysisResult } from "../../schemas/job-analysis";

const BASE_URL = "/api/analyses";

/**
 * HTTP-based implementation of AnalysisRepository.
 * Communicates with the Express backend at /api/analyses.
 *
 * `save()` is a pass-through: the server already persists during POST /api/ai/analyze
 * (P3 coupling). This method returns a compatible shape for the caller.
 */
export function createHttpAnalysisRepository(): AnalysisRepository {
  async function request<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error((body as { error?: string }).error ?? `Request failed with status ${response.status}`);
    }

    // 204 No Content — no body to parse
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  }

  return {
    async save(_jobDescription: string, _result: JobAnalysisResult): Promise<SavedJobAnalysis> {
      // Pass-through: the server already persisted during POST /api/ai/analyze.
      // Return the result shaped as a SavedJobAnalysis so the caller can navigate.
      return {
        ..._result,
        id: (_result as Record<string, unknown>).id as string ?? crypto.randomUUID(),
        createdAt: (_result as Record<string, unknown>).createdAt as string ?? new Date().toISOString(),
        jobDescription: _jobDescription,
      } as SavedJobAnalysis;
    },

    async getAll(): Promise<SavedJobAnalysis[]> {
      const data = await request<{ items: SavedJobAnalysis[]; total: number }>(BASE_URL);
      return data.items;
    },

    async getById(id: string): Promise<SavedJobAnalysis | null> {
      try {
        return await request<SavedJobAnalysis>(`${BASE_URL}/${id}`);
      } catch {
        return null;
      }
    },

    async update(id: string, patch: AnalysisUpdatePatch): Promise<SavedJobAnalysis | null> {
      try {
        return await request<SavedJobAnalysis>(`${BASE_URL}/${id}`, {
          method: "PATCH",
          body: JSON.stringify(patch),
        });
      } catch {
        return null;
      }
    },

    async delete(id: string): Promise<void> {
      await request(`${BASE_URL}/${id}`, { method: "DELETE" });
    },
  };
}
