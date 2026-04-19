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
    vacancySummary: {
      type: "object",
      additionalProperties: false,
      properties: {
        role: { type: "string" },
        seniority: { type: "string" },
        modalityLocation: { type: "string" },
        responsibilities: { type: "array", minItems: 1, maxItems: 5, items: { type: "string" } },
        mustHave: { type: "array", minItems: 1, items: { type: "string" } },
        niceToHave: { type: "array", minItems: 1, items: { type: "string" } },
      },
      required: ["role", "seniority", "modalityLocation", "responsibilities", "mustHave", "niceToHave"],
    },
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
    keywords: {
      type: "object",
      additionalProperties: false,
      properties: {
        hardSkills: { type: "array", minItems: 1, items: { type: "string" } },
        softSkills: { type: "array", minItems: 1, items: { type: "string" } },
        domainKeywords: { type: "array", minItems: 1, items: { type: "string" } },
        atsTerms: { type: "array", minItems: 1, items: { type: "string" } },
      },
      required: ["hardSkills", "softSkills", "domainKeywords", "atsTerms"],
    },
    gaps: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          gap: { type: "string" },
          mitigation: { type: "string" },
          framing: { type: "string" },
        },
        required: ["gap", "mitigation", "framing"],
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
    recruiterMessages: {
      type: "object",
      additionalProperties: false,
      properties: {
        emailLinkedIn: {
          type: "object",
          additionalProperties: false,
          properties: {
            subject: { type: "string" },
            body: { type: "string" },
          },
          required: ["subject", "body"],
        },
        dmShort: {
          type: "object",
          additionalProperties: false,
          properties: {
            body: { type: "string", maxLength: 600 },
          },
          required: ["body"],
        },
      },
      required: ["emailLinkedIn", "dmShort"],
    },
  },
  required: ["summary", "vacancySummary", "skillGroups", "keywords", "gaps", "outreachMessage", "recruiterMessages"],
} as const;

export function validateJobAnalysisResult(payload: unknown): JobAnalysisResult {
  return JOB_ANALYSIS_RESULT_SCHEMA.parse(payload);
}

export type { JobAnalysisResult, JobAnalysisSkillLevel };