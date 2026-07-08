import { z } from "zod";

// ============================================================================
// Auth
// ============================================================================

/**
 * Login request body.
 * Password minimum 8 chars (up from previous 6 - hardened for V1.1).
 */
export const authLoginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

/**
 * Register request body.
 * `displayName` is optional - defaults to null / email prefix on server.
 */
export const authRegisterSchema = authLoginSchema.extend({
  displayName: z.string().min(1).max(100).optional(),
});

/**
 * Session DTO returned by GET /api/auth/me.
 */
export const authSessionDTOSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string(),
    displayName: z.string().nullable(),
  }),
});

// ============================================================================
// Analysis
// ============================================================================

/**
 * Analysis request sent to POST /api/ai/analyze.
 * `messageTone` aligns with existing frontend enum values.
 * `githubRepositoryUrl` preserved from current `JOB_ANALYSIS_REQUEST_SCHEMA`.
 */
export const analysisRequestSchema = z.object({
  jobDescription: z.string().min(1).max(12_000),
  messageTone: z.enum(["formal", "casual", "persuasive"]).optional(),
  githubRepositoryUrl: z.string().optional(),
});

/**
 * Analysis response returned by POST /api/ai/analyze.
 * Covers the full SavedJobAnalysis shape from existing frontend contracts.
 */
export const analysisResponseSchema = z.object({
  id: z.string(),
  summary: z.string(),
  vacancySummary: z
    .object({
      role: z.string(),
      seniority: z.string(),
      modalityLocation: z.string(),
      responsibilities: z.array(z.string()),
      mustHave: z.array(z.string()),
      niceToHave: z.array(z.string()),
    })
    .optional(),
  skillGroups: z.array(
    z.object({
      category: z.string(),
      skills: z.array(
        z.object({
          name: z.string(),
          level: z.enum(["core", "strong", "adjacent"]),
        }),
      ),
    }),
  ),
  keywords: z
    .object({
      hardSkills: z.array(z.string()),
      softSkills: z.array(z.string()),
      domainKeywords: z.array(z.string()),
      atsTerms: z.array(z.string()),
    })
    .optional(),
  gaps: z
    .array(
      z.object({
        gap: z.string(),
        mitigation: z.string(),
        framing: z.string(),
      }),
    )
    .optional(),
  recruiterMessages: z
    .object({
      emailLinkedIn: z.object({
        subject: z.string(),
        body: z.string(),
      }),
      dmShort: z.object({
        body: z.string(),
      }),
    })
    .optional(),
  outreachMessage: z
    .object({
      subject: z.string(),
      body: z.string(),
    })
    .optional(),
  /** Applicant-facing executive summary. Uses "vos" tone. */
  applicantSummary: z.string().optional(),
  /** Draft message the applicant copies and sends to the recruiter. */
  candidateOutreach: z
    .object({
      subject: z.string(),
      body: z.string(),
    })
    .optional(),
  /** Exactly 5 actionable tips for preparing the application. */
  applicationTips: z.array(z.string()).optional(),
  matchIndex: z.number().optional(),
  jobDescription: z.string().optional(),
  displayName: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.string(),
});

// ============================================================================
// Profile
// ============================================================================

/**
 * Profile DTO returned by GET /api/profile.
 */
export const profileSchema = z.object({
  id: z.string(),
  email: z.string(),
  displayName: z.string().nullable(),
});

// ============================================================================
// History / List
// ============================================================================

/**
 * Paginated list of analyses.
 */
export const analysisListSchema = z.object({
  items: z.array(analysisResponseSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});

/**
 * Update schema for PATCH /api/analyses/:id.
 * Only `displayName` and `notes` are mutable.
 */
export const analysisUpdateSchema = z.object({
  displayName: z.string().trim().min(1).optional(),
  notes: z.string().trim().min(1).optional(),
}).strict();

export type AnalysisUpdateDTO = z.infer<typeof analysisUpdateSchema>;

// ============================================================================
// Common
// ============================================================================

/**
 * Standard error response body.
 */
export const errorResponseSchema = z.object({
  error: z.string(),
  details: z.unknown().optional(),
});

// ============================================================================
// Groq JSON Schema for structured output
// ============================================================================

/**
 * JSON Schema for Groq's `response_format.json_schema` structured output.
 * Mirrors `analysisResponseSchema` fields as a plain JSON Schema object.
 */
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
    applicantSummary: { type: "string" },
    candidateOutreach: {
      type: "object",
      additionalProperties: false,
      properties: {
        subject: { type: "string" },
        body: { type: "string" },
      },
      required: ["subject", "body"],
    },
    applicationTips: {
      type: "array",
      items: { type: "string" },
    },
  },
  required: ["summary", "vacancySummary", "skillGroups", "keywords", "gaps", "outreachMessage", "applicantSummary", "candidateOutreach", "applicationTips"],
} as const;

// ============================================================================
// Inferred Types
// ============================================================================

export type AuthLoginDTO = z.infer<typeof authLoginSchema>;
export type AuthRegisterDTO = z.infer<typeof authRegisterSchema>;
export type AuthSessionDTO = z.infer<typeof authSessionDTOSchema>;
export type AnalysisRequestDTO = z.infer<typeof analysisRequestSchema>;
export type AnalysisResponseDTO = z.infer<typeof analysisResponseSchema>;
export type ProfileDTO = z.infer<typeof profileSchema>;
export type AnalysisListDTO = z.infer<typeof analysisListSchema>;
export type ErrorResponseDTO = z.infer<typeof errorResponseSchema>;
