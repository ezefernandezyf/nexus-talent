import { z } from "zod/v4";

// ============================================================================
// Auth
// ============================================================================

/**
 * Login request body.
 * Password minimum 8 chars (up from previous 6 — hardened for V1.1).
 */
export const authLoginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

/**
 * Register request body.
 * `displayName` is optional — defaults to null / email prefix on server.
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
      technical: z.array(z.string()),
      soft: z.array(z.string()),
      tools: z.array(z.string()),
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
      linkedIn: z.string(),
      email: z.string(),
      dmShort: z.string(),
    })
    .optional(),
  outreachMessage: z
    .object({
      subject: z.string(),
      body: z.string(),
    })
    .optional(),
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
