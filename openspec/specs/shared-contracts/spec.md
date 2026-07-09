# Shared Contracts Specification

## Purpose

Zod validation schemas shared between frontend and backend, ensuring type consistency across the wire.

## Requirements

### Requirement: Analysis response schema keywords

`analysisResponseSchema.keywords` MUST use frontend fields: `hardSkills`, `softSkills`, `domainKeywords`, `atsTerms`.

| ID | Requirement |
|----|-------------|
| REQ-AI-011 | `analysisResponseSchema.keywords` MUST use frontend fields: `hardSkills`, `softSkills`, `domainKeywords`, `atsTerms` |
| REQ-AI-012 | `analysisRequestSchema` MUST validate `jobDescription` (1–12 000 chars) + `messageTone` (`formal \| casual \| persuasive`) |

#### Scenario: Keywords field alignment
- GIVEN Groq returns keywords
- WHEN validated against `analysisResponseSchema`
- THEN shape matches `JOB_ANALYSIS_KEYWORDS_SCHEMA`; old `technical`/`tools` fields removed

#### Scenario: Request validation
- GIVEN `{ jobDescription: "...", messageTone: "casual" }`
- WHEN `parse()` runs
- THEN success. Missing `messageTone` → Zod error.

### Requirement: Analysis update schema (REQ-HIST-010)

`analysisUpdateSchema` MUST validate PATCH `/api/analyses/:id` body with optional `displayName` (string, 1-200 chars) and `notes` (string, 0-5000 chars). At least one field MUST be present.

#### Scenario: Valid partial update
- GIVEN `{ displayName: "Senior Eng Role" }`
- WHEN validated against `analysisUpdateSchema`
- THEN parse succeeds

#### Scenario: Empty body rejected
- GIVEN `{}`
- WHEN validated against `analysisUpdateSchema`
- THEN parse fails with Zod error

#### Scenario: Invalid field rejected
- GIVEN `{ invalidField: true }`
- WHEN validated against `analysisUpdateSchema` (strict)
- THEN parse fails with Zod error

### Requirement: profileSchema (extended) (P14)

`profileSchema` MUST include all 10 fields: `id`, `email`, `displayName` (existing) plus `skills`, `experienceLevel`, `roleTitle`, `resumeLink`, `linkedinUrl`, `githubUrl`, `location` (all `z.string().nullable()`).

| ID | Field | Zod |
|----|-------|-----|
| REQ-SC-P01 | `skills` | `z.string().nullable()` |
| REQ-SC-P02 | `experienceLevel` | `z.string().nullable()` |
| REQ-SC-P03 | `roleTitle` | `z.string().nullable()` |
| REQ-SC-P04 | `resumeLink` | `z.string().url().nullable().or(z.literal(""))` |
| REQ-SC-P05 | `linkedinUrl` | `z.string().url().nullable().or(z.literal(""))` |
| REQ-SC-P06 | `githubUrl` | `z.string().url().nullable().or(z.literal(""))` |
| REQ-SC-P07 | `location` | `z.string().nullable()` |

#### Scenario: Full profile validated
- GIVEN a response with all 10 fields populated
- WHEN validated against `profileSchema`
- THEN `parse()` succeeds

#### Scenario: Null fields accepted
- GIVEN a response where only `id`, `email` are set; all 7 new fields are `null`
- WHEN validated against `profileSchema`
- THEN `parse()` succeeds

### Requirement: profileUpdateSchema (P14)

`profileUpdateSchema` MUST validate the PUT `/api/profile` body. All fields MUST be optional. URL fields MUST be valid URLs when non-empty. Text fields (skills, experienceLevel, roleTitle, displayName, location) MUST transform empty strings (`""`) to `undefined` so the server writes `NULL` — this gracefully handles cleared form inputs instead of rejecting them.

| ID | Requirement |
|----|-------------|
| REQ-SC-P08 | `profileUpdateSchema` validates PUT `/api/profile` body |
| REQ-SC-P09 | All fields optional — `{}` is valid |
| REQ-SC-P10 | URL fields must be valid URLs when non-empty |
| REQ-SC-P11 | Empty strings transform to `undefined` for text fields |

#### Scenario: All fields optional
- GIVEN `{}`
- WHEN validated against `profileUpdateSchema`
- THEN `parse()` succeeds — all fields are optional

#### Scenario: Valid update
- GIVEN `{ skills: "React, TypeScript", experienceLevel: "Senior 10+", linkedinUrl: "https://linkedin.com/in/user" }`
- WHEN validated against `profileUpdateSchema`
- THEN `parse()` succeeds

#### Scenario: Invalid URL
- GIVEN `{ linkedinUrl: "not-a-url" }`
- WHEN validated against `profileUpdateSchema`
- THEN `parse()` fails with Zod error

#### Scenario: Empty skills gracefully transformed
- GIVEN `{ skills: "" }`
- WHEN validated against `profileUpdateSchema`
- THEN `parse()` succeeds with `skills: undefined` — the empty string is transformed instead of rejected, so clearing the skills field in the UI saves as NULL
