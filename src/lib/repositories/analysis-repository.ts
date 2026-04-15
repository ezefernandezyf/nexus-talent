import type { JobAnalysisResult, SavedJobAnalysis } from "../../schemas/job-analysis";

export const ANALYSIS_HISTORY_STORAGE_KEY = "nexus-talent:analysis-history:v1";

export interface AnalysisUpdatePatch {
  displayName?: string;
  notes?: string;
}

export interface AnalysisRepository {
  save(jobDescription: string, result: JobAnalysisResult): Promise<SavedJobAnalysis>;
  getAll(): Promise<SavedJobAnalysis[]>;
  getById(id: string): Promise<SavedJobAnalysis | null>;
  update(id: string, patch: AnalysisUpdatePatch): Promise<SavedJobAnalysis | null>;
  delete(id: string): Promise<void>;
}

export type { SavedJobAnalysis };