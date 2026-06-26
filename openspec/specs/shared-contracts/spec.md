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
