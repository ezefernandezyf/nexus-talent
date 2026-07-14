# AI Proxy Specification

## Purpose

Server-side Groq proxy. Client sends JD + tone; server holds `GROQ_API_KEY`. No API key ever reaches the browser bundle.

## Requirements

### Requirement: POST /api/ai/analyze endpoint

POST /api/ai/analyze MUST accept `analysisRequestSchema`-validated body.

| ID | Requirement |
|----|-------------|
| REQ-AI-001 | POST /api/ai/analyze MUST accept `analysisRequestSchema`-validated body |
| REQ-AI-002 | MUST call Groq with `GROQ_API_KEY` from env (never exposed to client) |
| REQ-AI-003 | MUST validate Groq response against `analysisResponseSchema` before return |
| REQ-AI-004 | MUST rate-limit: 20 req/60s per IP |
| REQ-AI-005 | MUST return 400 (bad input), 429 (rate limit), 502 (Groq failure) |
| REQ-AI-006 | MUST enforce 30s timeout on Groq fetch |
| REQ-HIST-009 | MUST persist validated result to DB after Groq returns (best-effort; save failure MUST NOT fail the analysis response) |

#### Scenario: Save succeeds after analysis
- GIVEN a valid analysis request
- WHEN Groq returns a validated response
- THEN the controller MUST call `historyService.create()` to persist the result
- AND return the analysis response normally

#### Scenario: Save fails silently
- GIVEN a valid analysis request
- WHEN Groq returns a validated response but `historyService.create()` throws
- THEN the endpoint MUST still return 200 with the analysis result
- AND MUST log the save failure for observability

#### Scenario: Valid input
- GIVEN `{ jobDescription: "Senior dev...", messageTone: "formal" }`
- WHEN POST /api/ai/analyze
- THEN 200 with validated result

#### Scenario: Invalid input
- GIVEN empty `jobDescription`
- WHEN POST /api/ai/analyze
- THEN 400 with Zod error details

#### Scenario: Key missing
- GIVEN `GROQ_API_KEY` unset
- WHEN valid request arrives
- THEN 502; key never reaches client

#### Scenario: Rate limit hit
- GIVEN 20 requests from same IP in 60s
- WHEN 21st request arrives
- THEN 429 with `Retry-After`

#### Scenario: Timeout
- GIVEN Groq does not respond within 30s
- WHEN timeout fires
- THEN 502 returned

### Requirement: Profile context enrichment (P14)

`analysis.controller.ts` MUST fetch the authenticated user's profile via `profileService.getProfileByUserId()` BEFORE calling `analysisService.analyze()`. `analysis.service.ts` MUST accept an optional `profileContext` parameter. `buildGroqMessages()` MUST inject a "Sobre el postulante" section into the system prompt when profile data exists, limited to ~200 chars.

| ID | Requirement |
|----|-------------|
| REQ-AI-P14-001 | Controller MUST fetch profile via `profileService.getProfileByUserId()` before analysis |
| REQ-AI-P14-002 | `analyze()` MUST accept optional `profileContext` param |
| REQ-AI-P14-003 | `buildGroqMessages()` MUST inject "Sobre el postulante" when profileContext non-null |
| REQ-AI-P14-004 | Profile context MUST be limited to ~200 chars |

#### Scenario: Profile injected into prompt
- GIVEN `req.userId` maps to a profile with `skills: "React, TypeScript"` and `roleTitle: "Full-Stack Developer"`
- WHEN the analysis is requested
- THEN the system prompt MUST include a section like "Sobre el postulante: Rol: Full-Stack Developer. Skills: React, TypeScript. Experiencia: ..."
- AND the profile context text MUST NOT exceed 200 characters

#### Scenario: No profile — prompt unchanged
- GIVEN user has no profile data (all fields null) OR profile fetch fails
- WHEN the analysis is requested
- THEN `buildGroqMessages()` MUST NOT modify the system prompt
- AND the existing system prompt text MUST match the pre-P14 version byte-for-byte

#### Scenario: Profile fetch fails gracefully
- GIVEN `profileService.getProfileByUserId()` throws
- WHEN the controller catches the error
- THEN analysis MUST proceed with `profileContext: null`
- AND the error MUST be logged at `warn` level
