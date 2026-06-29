# Tasks: P3 AI Proxy - Server-side Groq Proxy

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~210–250 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Low

## Phase 1: Schema & Foundation

- [x] **T1: Align `analysisResponseSchema` fields with frontend** (c0b6eed)
  - `shared/src/schemas.ts` - keywords: `{hardSkills, softSkills, domainKeywords, atsTerms}`; recruiterMessages: `{emailLinkedIn:{subject,body}, dmShort:{body}}`
  - **Verify**: `analysisResponseSchema` shape matches `JOB_ANALYSIS_KEYWORDS_SCHEMA` from web schemas

- [x] **T2: Move `GROQ_JOB_ANALYSIS_JSON_SCHEMA` to shared** (~10 lines)
  - REQ-AI-011, REQ-AI-012
  - `shared/src/schemas.ts` (MODIFIED) - add JSON schema object export
  - `shared/src/index.ts` (MODIFIED) - re-export `GROQ_JOB_ANALYSIS_JSON_SCHEMA`
  - `web/src/lib/validation/job-analysis.ts` (MODIFIED) - remove local definition, import from `@nexus-talent/shared`
  - `web/src/lib/validation/index.ts` (MODIFIED) - ensure export chain intact
  - **Verify**: `pnpm test` in web passes; shared exports `GROQ_JOB_ANALYSIS_JSON_SCHEMA`

## Phase 2: Server - Core Implementation

- [x] **T3: Create `analysis.service.ts` - Groq fetch + prompt builder** (~60 lines)
  - REQ-AI-002, REQ-AI-003, REQ-AI-006
  - `server/src/analysis/analysis.service.ts` (NEW)
  - Port `buildGroqMessages()` from `web/src/lib/ai-provider.ts` into service
  - Native `fetch` with `AbortController` (30s timeout) targeting Groq API
  - Validate Groq response with `analysisResponseSchema.safeParse()`
  - Generate `id` via `crypto.randomUUID()`, `createdAt` via `new Date().toISOString()`
  - Throw `AppError(502)` on network errors, parse failures, or Zod validation failures
  - **Verify**: Unit test with mocked `fetch` - valid Groq response returns parsed `AnalysisResponseDTO`; invalid JSON throws `AppError(502)`

- [x] **T4: Create `analysis.controller.ts` - request/response handling** (~40 lines)
  - REQ-AI-001, REQ-AI-005
  - `server/src/analysis/analysis.controller.ts` (NEW)
  - Handler receives validated body from middleware, calls `analysisService.analyze(input)`
  - Catches `AppError` from service, re-throws; catches unexpected errors as `AppError(502)`
  - **Verify**: Unit test - 400 on missing JD, 502 on service failure, 200 on success

- [x] **T5: Wire `analysis.router.ts` - POST /analyze endpoint** (~20 lines)
  - REQ-AI-001, REQ-AI-004, REQ-AI-005
  - `server/src/analysis/analysis.router.ts` (MODIFIED)
  - Import `validate(analysisRequestSchema)` from `infra/validate.ts`
  - Import `rateLimiter({ windowMs: 60_000, max: 20 })` from `infra/rate-limiter.ts`
  - Add `router.post("/analyze", rateLimiter, validate(analysisRequestSchema), controller.analyze)`
  - Preserve existing `GET /test` route
  - **Verify**: Supertest integration - POST returns 200 with valid body, 400 with empty JD, 429 after 20 requests

- [x] **T6: Update `app.ts` mount path** (~2 lines)
  - `server/src/infra/app.ts` (MODIFIED)
  - Change `app.use("/api/analysis", analysisRouter)` → `app.use("/api/ai", analysisRouter)`
  - **Verify**: `POST /api/ai/analyze` returns 200; `GET /api/analysis/test` becomes `GET /api/ai/test`

## Phase 3: Frontend - Backend Proxy Adapter

- [x] **T7: Add `createBackendProxyAdapter()` in `ai-provider.ts`** (~60 lines)
  - REQ-AI-007, REQ-AI-009
  - `web/src/lib/ai-provider.ts` (MODIFIED)
  - New `createBackendProxyAdapter(options)` implementing `ProviderAdapter<JobAnalysisPromptInput>`
  - `buildRequest()` → `POST /api/ai/analyze` via native `fetch` with `{ jobDescription, messageTone }`
  - On non-OK response, map HTTP status to `AIOrchestratorError` (400→PermanentFailure, 429→RateLimit, 502→TransientFailure)
  - On network/fetch error, trigger `fallbackTransport` (same pattern as Groq adapter)
  - `parseResponse()` - pass through (server already returns validated `SavedJobAnalysis`-shaped JSON)
  - **Verify**: Unit test with mocked fetch - 200 returns parsed payload; 502 triggers `fallbackTransport`; 400 throws `AIOrchestratorError`

- [x] **T8: Swap adapter in `ai-client.ts`** (~5 lines)
  - REQ-AI-008, REQ-AI-013
  - `web/src/lib/ai-client.ts` (MODIFIED)
  - Replace `createGroqProviderAdapter({ fallbackTransport })` → `createBackendProxyAdapter({ fallbackTransport })`
  - Remove `createGroqProviderAdapter` import, add `createBackendProxyAdapter` import
  - **Verify**: `ai-client.test.ts` and `ai-orchestrator.test.ts` pass unchanged (REQ-AI-013)

## Phase 4: Cleanup & Verification

- [x] **T9: Remove `VITE_GROQ_API_KEY` from web/** (~10 lines)
  - REQ-AI-014
  - `web/.env.example` (MODIFIED) - remove `VITE_GROQ_API_KEY` entry
  - Any remaining `import.meta.env.VITE_GROQ_API_KEY` references in `web/src/lib/ai-provider.ts` - remove (no longer needed since adapter swaps to backend)
  - **Verify**: `VITE_GROQ_API_KEY` not referenced anywhere in `web/` (grep returns empty)

- [x] **T10: Verify existing test suite** (REQ-AI-013)
  - Run `pnpm test` in `web/` - all existing tests must pass
  - Run `pnpm test` in `server/` - no regressions
  - **Verify**: CI-equivalent test pass with zero failures
