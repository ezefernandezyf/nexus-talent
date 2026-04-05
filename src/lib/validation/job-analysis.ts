import {
  JOB_ANALYSIS_RESULT_SCHEMA,
  type JobAnalysisResult,
  type JobAnalysisSkillLevel,
} from "../../schemas/job-analysis";

export const GROQ_JOB_ANALYSIS_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    summary: { type: "string" },
    skillGroups: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          category: { type: "string" },
          skills: {
            type: "array",
            minItems: 1,
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                name: { type: "string" },
                level: { type: "string", enum: ["core", "strong", "adjacent"] },
              },
              required: ["name", "level"],
            },
          },
        },
        required: ["category", "skills"],
      },
    },
    outreachMessage: {
      type: "object",
      additionalProperties: false,
      properties: {
        subject: { type: "string" },
        body: { type: "string" },
      },
      required: ["subject", "body"],
    },
  },
  required: ["summary", "skillGroups", "outreachMessage"],
} as const;

export function validateJobAnalysisResult(payload: unknown): JobAnalysisResult {
  return JOB_ANALYSIS_RESULT_SCHEMA.parse(payload);
}

export type { JobAnalysisResult, JobAnalysisSkillLevel };