import type { JobAnalysisResult, SavedJobAnalysis } from "../../schemas/job-analysis";

export const ANALYSIS_HISTORY_STORAGE_KEY = "nexus-talent:analysis-history:v1";

export interface AnalysisUpdatePatch {
  displayName?: string;
  notes?: string;
}

export interface AnalysisPage {
  page?: number;
  limit?: number;
}

export interface AnalysisPageResult {
  items: SavedJobAnalysis[];
  total: number;
}

export interface AnalysisRepository {
  save(jobDescription: string, result: JobAnalysisResult): Promise<SavedJobAnalysis>;
  getAll(params?: AnalysisPage): Promise<AnalysisPageResult>;
  getById(id: string): Promise<SavedJobAnalysis | null>;
  update(id: string, patch: AnalysisUpdatePatch): Promise<SavedJobAnalysis | null>;
  delete(id: string): Promise<void>;
}

export type { SavedJobAnalysis };