# Proposal: P3 AI Proxy

## Intent

The Groq API key (`VITE_GROQ_API_KEY`) is currently exposed in the browser bundle via `web/src/lib/ai-provider.ts`. Anyone can extract it. This change moves all Groq calls server-side through a new `/api/ai/analyze` endpoint, keeping the key in `GROQ_API_KEY` env var on the server. The architecture aligns with the mandated data flow: `Client → Zod validation → Express → Groq → Zod validation → Response`.

## Scope

### In Scope
- `POST /api/ai/analyze` endpoint — receive JD + tone, call Groq, return validated result
- Groq call via Node.js native `fetch` (zero new deps)
- Zod validation on request input (`analysisRequestSchema`) and response (`analysisResponseSchema`)
- Rate limiting (analysis: 20/min, reusing existing `rate-limiter.ts`)
- Error handling: `AppError` for Groq failures, Zod parse errors → 400/502
- Align `shared/src/schemas.ts` `analysisResponseSchema` field names with frontend `JOB_ANALYSIS_RESULT_SCHEMA`

### Out of Scope
- Local analysis engine — stays client-side in `ai-client.ts` as fallback
- GitHub enrichment — stays frontend-only (`github-client.ts`)
- UI changes — Web continues calling the same `ai-client.ts` API; only transport changes
- History persistence — covered in P4

## Capabilities

### New Capabilities
- `ai-proxy`: Server-side Groq API proxy. Client sends only the JD and tone — API key never leaves the server.

### Modified Capabilities
- `ai-orchestrator`: Client-side orchestrator now sends HTTP request to `/api/ai/analyze` instead of direct Groq. Provider adapter (`createGroqProviderAdapter`) gets a new transport that calls the backend. Response shape and Zod validation contract are preserved.
- `shared-contracts`: `analysisResponseSchema` in `shared/src/schemas.ts` needs field alignment with `web/src/schemas/job-analysis.ts` (`JOB_ANALYSIS_RESULT_SCHEMA`). Current `keywords` shape (`technical`/`soft`/`tools`) differs from frontend (`hardSkills`/`softSkills`/`domainKeywords`/`atsTerms`). Must reconcile.
- `analysis`: Add `POST /api/ai/analyze` route to the existing `analysis.router.ts`.

## API Contract

**Request**: `POST /api/ai/analyze`
```json
{
  "jobDescription": "string (1–12,000 chars)",
  "messageTone": "formal | casual | persuasive"
}
```

**Response** (200): Matches `analysisResponseSchema` in `shared/src/schemas.ts` — full `SavedJobAnalysis` shape.

**Errors**:
- `400` — Zod validation failure on input
- `429` — Rate limit exceeded (20/min)
- `502` — Groq unreachable or malformed response

## Approach

1. **Server**: Create `server/src/analysis/analysis.service.ts` — calls Groq via native `fetch` with `GROQ_API_KEY`, builds prompt from existing `buildGroqMessages()` logic. Create `analysis.controller.ts` — validates request with `validate(analysisRequestSchema)`, calls service, validates response with `analysisResponseSchema`, returns result.
2. **Client**: Swap `createGroqProviderAdapter` transport from direct Groq call to `POST /api/ai/analyze`. The fallback transport (local analysis engine) stays unchanged.
3. **Shared**: Fix `analysisResponseSchema` keywords and `recruiterMessages` to match frontend types. Re-export from `shared/src/schemas.ts`.
4. **Rate limiting**: Apply `rateLimiter({ windowMs: 60_000, max: 20 })` to the new endpoint.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `server/src/analysis/analysis.service.ts` | **New** | Groq call via native fetch |
| `server/src/analysis/analysis.controller.ts` | **New** | Request/response handling |
| `server/src/analysis/analysis.router.ts` | Modified | Add `POST /` route |
| `server/src/infra/app.ts` | Modified | Wire analysis router under `/api/ai` |
| `shared/src/schemas.ts` | Modified | Align `analysisResponseSchema` fields with frontend |
| `web/src/lib/ai-provider.ts` | Modified | New transport pointing to backend |
| `web/src/lib/ai-client.ts` | None | Same interface, no changes needed |
| `web/src/schemas/job-analysis.ts` | None | Frontend types preserved |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Groq API format change | Low | Zod validation on response catches shape drift |
| Request timeout (client used 30s, server should match) | Low | Set same 30s timeout; retry logic in controller |
| Field mismatch in `analysisResponseSchema` | Medium | Audit all consumers; create alignment PR before route work |

## Rollback Plan

1. Revert the feature branch PR to `develop`
2. Keep `VITE_GROQ_API_KEY` in Vercel env — frontend falls back to direct Groq
3. Rate limiter removal: no data migration needed

## Dependencies

- Node.js native `fetch` (available in Node 22, already in `.nvmrc`)
- `GROQ_API_KEY` env var on server (currently `VITE_GROQ_API_KEY` in Vite)

## Success Criteria

- [ ] `VITE_GROQ_API_KEY` removable from `web/` — no Groq key in browser bundle
- [ ] `POST /api/ai/analyze` returns same validated shape as current client-side call
- [ ] All existing `ai-client.test.ts` and `ai-orchestrator.test.ts` pass
- [ ] Rate limiter returns 429 after 20 req/min from same IP
- [ ] Groq unavailable → 502 with readable error, UI shows error state
