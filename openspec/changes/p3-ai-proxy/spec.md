# P3 AI Proxy - Delta Specs

## Domain: ai-proxy (NEW)

Server-side Groq proxy. Client sends JD + tone; server holds `GROQ_API_KEY`.

| ID | Requirement |
|----|-------------|
| REQ-AI-001 | POST /api/ai/analyze MUST accept `analysisRequestSchema`-validated body |
| REQ-AI-002 | MUST call Groq with `GROQ_API_KEY` from env (never exposed to client) |
| REQ-AI-003 | MUST validate Groq response against `analysisResponseSchema` before return |
| REQ-AI-004 | MUST rate-limit: 20 req/60s per IP |
| REQ-AI-005 | MUST return 400 (bad input), 429 (rate limit), 502 (Groq failure) |
| REQ-AI-006 | MUST enforce 30s timeout on Groq fetch |

### Scenarios

**REQ-AI-001 - Valid input**
- GIVEN `{ jobDescription: "Senior dev...", messageTone: "formal" }`
- WHEN POST /api/ai/analyze
- THEN 200 with validated result

**REQ-AI-001 - Invalid input**
- GIVEN empty `jobDescription`
- WHEN POST /api/ai/analyze
- THEN 400 with Zod error details

**REQ-AI-002 - Key missing**
- GIVEN `GROQ_API_KEY` unset
- WHEN valid request arrives
- THEN 502; key never reaches client

**REQ-AI-004 - Rate limit hit**
- GIVEN 20 requests from same IP in 60s
- WHEN 21st request arrives
- THEN 429 with `Retry-After`

**REQ-AI-006 - Timeout**
- GIVEN Groq does not respond within 30s
- WHEN timeout fires
- THEN 502 returned

---

## Domain: ai-orchestrator (MODIFIED)

### ADDED

| ID | Requirement |
|----|-------------|
| REQ-AI-007 | Transport MUST call POST /api/ai/analyze via TanStack Query `useMutation` |
| REQ-AI-008 | MUST expose `isPending`, `isError`, `error` for UI state rendering |
| REQ-AI-009 | Payload MUST be `{ jobDescription, messageTone }` only |

### MODIFIED

**Integration with ai-client** - Backward-compatible transport swap from direct Groq to `POST /api/ai/analyze`. `ai-client` Zod layer unchanged.  
(Previously: orchestrator wrapped direct Groq SDK calls.)

#### Scenario: Callers unaffected
- GIVEN `useJobAnalysis` uses `ai-client` + `JobAnalysisTransport`
- WHEN transport changes to HTTP
- THEN `useJobAnalysis` works without code changes

### REMOVED

**Groq adapter as first concrete provider** - Frontend no longer calls Groq directly.  
**Migration**: Replace `createGroqProviderAdapter` with HTTP transport in `web/src/lib/ai-provider.ts`. Delete `VITE_GROQ_API_KEY`.

---

## Domain: shared-contracts (MODIFIED - no prior spec)

| ID | Requirement |
|----|-------------|
| REQ-AI-011 | `analysisResponseSchema.keywords` MUST use frontend fields: `hardSkills`, `softSkills`, `domainKeywords`, `atsTerms` |
| REQ-AI-012 | `analysisRequestSchema` MUST validate `jobDescription` (1–12 000 chars) + `messageTone` (`formal \| casual \| persuasive`) |

**REQ-AI-011 Scenario**
- GIVEN Groq returns keywords
- WHEN validated against `analysisResponseSchema`
- THEN shape matches `JOB_ANALYSIS_KEYWORDS_SCHEMA`; old `technical`/`tools` fields removed

**REQ-AI-012 Scenario**
- GIVEN `{ jobDescription: "...", messageTone: "casual" }`
- WHEN `parse()` runs
- THEN success. Missing `messageTone` → Zod error.

---

## Integration

| ID | Requirement |
|----|-------------|
| REQ-AI-013 | `ai-client.test.ts` and `ai-orchestrator.test.ts` MUST pass post-migration |
| REQ-AI-014 | Removing `VITE_GROQ_API_KEY` MUST NOT break local dev (Vite proxy → `:3001`) |

**REQ-AI-013 Scenario** - `pnpm test` in web workspace passes with zero regressions.  
**REQ-AI-014 Scenario** - Dev servers running, `GROQ_API_KEY` in `server/.env`, analysis flow reaches backend via `/api/ai` proxy.
