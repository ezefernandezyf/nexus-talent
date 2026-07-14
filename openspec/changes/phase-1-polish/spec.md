# Delta Spec: Phase 1 Polish

## 1. Delta for Analysis

### REMOVED Requirements

#### Requirement: Optional GitHub repository URL input
(Reason: GitHub enrichment was never built. Removing the field simplifies the form and schema.)
(Migration: None — no user data to migrate.)

#### Requirement: Optional GitHub enrichment input
(Reason: Depends on removed GitHub URL input.)

#### Requirement: Surface detected GitHub stack
(Reason: No enrichment path exists.)

#### Requirement: Preserve core analysis when GitHub fails
(Reason: No GitHub path; fallback logic is dead code.)

**Acceptance**: `grep -r githubRepositoryUrl web/src/features/analysis/` returns zero matches. `tsc --noEmit` passes.

### MODIFIED Requirements

#### Requirement: REQ-JD-001 — Accept raw job description input

The system MUST allow the user to paste or type a raw job description and MUST validate that the trimmed input is at least 30 characters before analysis.

(Previously: validated non-empty only, no minimum length.)

| ID | Requirement |
|----|-------------|
| REQ-JD-001 | Trimmed input 1-29 chars → blocked with "Información insuficiente. La descripción debe tener al menos 30 caracteres." |
| REQ-JD-002 | `JOB_ANALYSIS_INPUT_SCHEMA` in `web/src/features/analysis/schemas/job-analysis.ts` MUST use `.min(30)` |
| REQ-JD-003 | Inputs of 30+ chars MUST pass validation as before |

##### Scenario: Short input blocked (9 chars)
- GIVEN user pastes "Front-end"
- WHEN form validates
- THEN submission blocked; error: "Información insuficiente. La descripción debe tener al menos 30 caracteres."

##### Scenario: Minimum boundary (29 chars) blocked
- GIVEN user pastes exactly 29 characters
- WHEN form validates
- THEN submission blocked; same error message

##### Scenario: Valid input (37 chars) passes
- GIVEN user pastes "Senior React engineer with TypeScript"
- WHEN form validates
- THEN submission accepted; analysis flow starts

## 2. Delta for Shared Contracts

### MODIFIED Requirements

#### Requirement: REQ-AI-012 — analysisRequestSchema

`analysisRequestSchema` MUST validate `jobDescription` (30–12 000 chars after trim) + `messageTone` (`formal | casual | persuasive`). Field `githubRepositoryUrl` MUST NOT be accepted.

(Previously: accepted `jobDescription` at 1 char minimum, included optional `githubRepositoryUrl`.)

| ID | Requirement |
|----|-------------|
| REQ-AI-012 | `analysisRequestSchema` MUST validate `jobDescription` (30–12 000 chars) + `messageTone` only |

##### Scenario: JD under 30 chars rejected
- GIVEN `{ jobDescription: "Front-end dev", messageTone: "casual" }`
- WHEN `parse()` runs
- THEN Zod error: too_small on `jobDescription`

##### Scenario: Valid request without GitHub URL
- GIVEN `{ jobDescription: "Senior React engineer…", messageTone: "persuasive" }`
- WHEN `parse()` runs
- THEN success; `githubRepositoryUrl` not expected or accepted

## 3. Cross-Cutting: Em Dash Replacement

### MODIFIED Requirements

| ID | Requirement |
|----|-------------|
| REQ-EM-001 | All em dashes (—) in user-facing strings under `web/src/features/settings/` and `web/src/features/cv/` MUST become en dashes (–) |
| REQ-EM-002 | Code comments: em dashes MUST become hyphens (-) |
| REQ-EM-003 | Test names and assertions SHOULD use hyphens |

#### Specific Replacements

| File | Line | Current | Replacement |
|------|------|---------|-------------|
| `SettingsFeature.tsx` | 176 | `"…manualmente — se adapta solo."` | `"…manualmente – se adapta solo."` |
| `CVPage.tsx` | 109 | `"Opcional — pegá la descripción…"` | `"Opcional – pegá la descripción…"` |
| `CVPage.tsx` | 191 | `"502 — Generation Failed"` | `"502 – Generation Failed"` |
| `ExperienceManagerPage.tsx` | 165-166 | `—` in date range | `–` |
| `EducationManagerPage.tsx` | 165-166 | `—` in date range | `–` |

##### Scenario: Zero em dashes after replacement
- GIVEN replacement is applied
- WHEN `grep -r '—' web/src/features/settings/ web/src/features/cv/` runs
- THEN zero matches in user-facing strings

## 4. Cross-Cutting: Remove Eyebrow Labels

### REMOVED Requirements

#### Requirement: Eyebrow labels on Settings and CV pages
(Reason: Redundant with `<h1>` headings — "Settings" and "CV Generator" already identify the page. Removing reduces visual noise.)
(Migration: None — headings remain; no navigation impact.)

| ID | Requirement |
|----|-------------|
| REQ-EB-001 | `SettingsPage.tsx` MUST NOT render `<Eyebrow>Configuración</Eyebrow>` |
| REQ-EB-002 | `CVPage.tsx` MUST NOT render `<Eyebrow>CV</Eyebrow>` |
| REQ-EB-003 | `<h1>` headings ("Settings" and "CV Generator") MUST remain |
| REQ-EB-004 | `Eyebrow` component MUST NOT be deleted from codebase |

##### Scenario: Settings page renders cleanly
- GIVEN user navigates to `/settings`
- WHEN page renders
- THEN `<h1>Settings</h1>` visible; no eyebrow text above it
- AND `tsc --noEmit` passes

##### Scenario: CV page renders cleanly
- GIVEN user navigates to `/cv`
- WHEN page renders
- THEN `<h1>CV Generator</h1>` visible; no `<Eyebrow>` element present
