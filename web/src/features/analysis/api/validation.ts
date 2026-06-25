import { GROQ_JOB_ANALYSIS_JSON_SCHEMA } from "@nexus-talent/shared/schemas";
import {
  JOB_ANALYSIS_RESULT_SCHEMA,
  type JobAnalysisResult,
  type JobAnalysisSkillLevel,
} from "../schemas/job-analysis";

export { GROQ_JOB_ANALYSIS_JSON_SCHEMA };

export function validateJobAnalysisResult(payload: unknown): JobAnalysisResult {
  return JOB_ANALYSIS_RESULT_SCHEMA.parse(payload);
}

export type { JobAnalysisResult, JobAnalysisSkillLevel };