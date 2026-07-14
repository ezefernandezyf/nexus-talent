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
  // P14 additions
  skills: z.string().nullable(),
  experienceLevel: z.string().nullable(),
  roleTitle: z.string().nullable(),
  resumeLink: z.string().url().nullable().or(z.literal("")),
  linkedinUrl: z.string().url().nullable().or(z.literal("")),
  githubUrl: z.string().url().nullable().or(z.literal("")),
  location: z.string().nullable(),
});

/**
 * Profile update body for PUT /api/profile.
 * All fields are optional. URL fields validated when non-empty.
 * Empty string transforms to undefined so Prisma writes null.
 */
export const profileUpdateSchema = z.object({
  displayName: z.string().trim().optional().or(z.literal("").transform(() => undefined)),
  skills: z.string().trim().min(1).optional().or(z.literal("").transform(() => undefined)),
  experienceLevel: z.string().trim().optional().or(z.literal("").transform(() => undefined)),
  roleTitle: z.string().trim().optional().or(z.literal("").transform(() => undefined)),
  resumeLink: z.string().url().optional().or(z.literal("")),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  githubUrl: z.string().url().optional().or(z.literal("")),
  location: z.string().trim().optional().or(z.literal("").transform(() => undefined)),
});

export type ProfileUpdateDTO = z.infer<typeof profileUpdateSchema>;

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
// User Settings
// ============================================================================

/**
 * User settings DTO returned by GET /api/settings.
 */
export const userSettingsSchema = z.object({
  theme: z.enum(["light", "dark"]),
  emailDigest: z.boolean(),
  rateLimitTier: z.enum(["default", "relaxed", "strict"]),
});

/**
 * Partial update body for PUT /api/settings.
 * Any subset of fields is valid; unknown fields are rejected.
 */
export const userSettingsUpdateSchema = userSettingsSchema.partial().strict();

export type UserSettingsDTO = z.infer<typeof userSettingsSchema>;
export type UserSettingsUpdateDTO = z.infer<typeof userSettingsUpdateSchema>;

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

// ============================================================================
// CV - Work Experience & Education
// ============================================================================

export const workExperienceSchema = z.object({
  id: z.string(),
  userId: z.string(),
  company: z.string().min(1),
  role: z.string().min(1),
  startDate: z.string(),
  endDate: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
});

export const workExperienceCreateSchema = workExperienceSchema.omit({ id: true, userId: true });
export const workExperienceUpdateSchema = workExperienceCreateSchema.partial();

export const educationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  institution: z.string().min(1),
  degree: z.string().min(1),
  field: z.string().nullable().optional(),
  startDate: z.string(),
  endDate: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
});

export const educationCreateSchema = educationSchema.omit({ id: true, userId: true });
export const educationUpdateSchema = educationCreateSchema.partial();

// ============================================================================
// CV - Generation
// ============================================================================

export const cvGenerateRequestSchema = z.object({
  sectionOrder: z.array(z.string()).optional(),
  adHocItems: z.array(z.object({
    type: z.enum(["experience", "education", "project", "custom"]),
    title: z.string(),
    subtitle: z.string().optional(),
    date: z.string().optional(),
    description: z.string().optional(),
  })).optional(),
  jobDescription: z.string().max(12000).optional(),
  tone: z.enum(["professional", "casual", "persuasive"]).optional(),
});

export const cvSectionSchema = z.object({
  heading: z.string(),
  body: z.string(),
  order: z.number(),
});

export const cvGenerateResponseSchema = z.object({
  sections: z.array(cvSectionSchema),
  metadata: z.object({
    generatedAt: z.string(),
    model: z.string(),
    sectionCount: z.number(),
  }),
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
export type WorkExperienceDTO = z.infer<typeof workExperienceSchema>;
export type WorkExperienceCreateDTO = z.infer<typeof workExperienceCreateSchema>;
export type WorkExperienceUpdateDTO = z.infer<typeof workExperienceUpdateSchema>;
export type EducationDTO = z.infer<typeof educationSchema>;
export type EducationCreateDTO = z.infer<typeof educationCreateSchema>;
export type EducationUpdateDTO = z.infer<typeof educationUpdateSchema>;
export type CVGenerateRequestDTO = z.infer<typeof cvGenerateRequestSchema>;
export type CVGenerateResponseDTO = z.infer<typeof cvGenerateResponseSchema>;
