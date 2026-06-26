# Design: P3 AI Proxy

## Technical Approach

Move Groq API calls server-side through `POST /api/ai/analyze`. Client sends only JD + tone — API key never leaves server. Shared Zod schemas align with frontend contract. Existing orchestrator/retry infrastructure stays intact; only the transport adapter swaps.

## Data Flow

```
Client (useMutation) → ai-client.ts → orchestrator → BackendProxyAdapter.execute()
    → POST /api/ai/analyze → validate(analysisRequestSchema) → analysis.service.ts
    → Groq API (native fetch + GROQ_API_KEY env) → validate(analysisResponseSchema) → JSON 200
    ← orchestrator.parseResponse() ← ai-client.normalize + validate ← React Query cache
```

Fallback path (backend unreachable):
```
BackendProxyAdapter.execute() → network error → fallbackTransport (local analysis engine)
```

## Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Groq transport | Node native `fetch` (zero deps) | Node 22 `.nvmrc` guarantees availability. Same pattern as existing Google OAuth server-side fetch. |
| Adapter pattern | New `createBackendProxyAdapter` replacing `createGroqProviderAdapter` | Same `ProviderAdapter<JobAnalysisPromptInput>` interface — orchestrator unchanged. |
| Fallback trigger | Inside adapter's `execute()`, after single backend attempt fails | Matches existing Groq adapter fallback pattern (triggers when precondition fails). No changes to `ai-client.ts` or `ai-orchestrator.ts`. |
| Rate limiter | Reuse existing `rateLimiter({ windowMs: 60_000, max: 20 })` | Same middleware, different window. Already IP-based with standard headers. |
| Schema alignment | Fix `analysisResponseSchema` in shared to match frontend field names | Single source of truth. Frontend `JOB_ANALYSIS_KEYWORDS_SCHEMA` and `JOB_ANALYSIS_RECRUITER_MESSAGES_SCHEMA` are authoritative. |
| Groq JSON schema | Move `GROQ_JOB_ANALYSIS_JSON_SCHEMA` from `web/src/lib/validation/job-analysis.ts` to `shared/src/schemas.ts` | Server needs it for structured output enforcement. Eliminates duplication. |
| Server-generated fields | `id` = `crypto.randomUUID()`, `createdAt` = `new Date().toISOString()` | Response shape (`SavedJobAnalysis`) requires these. P4 history API will provide real persistence later. |

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `server/src/analysis/analysis.router.ts` | Modify | Add `POST /analyze` with rateLimiter + validate middleware; keep existing `GET /test` |
| `server/src/analysis/analysis.controller.ts` | **Create** | Handler: validate request via middleware, call service, wrap errors in `AppError` (400/502) |
| `server/src/analysis/analysis.service.ts` | **Create** | Build prompt (ported `buildGroqMessages` logic), call Groq via native fetch with 30s timeout, parse + validate response |
| `server/src/infra/app.ts` | Modify | Change mount: `app.use("/api/analysis", …)` → `app.use("/api/ai", analysisRouter)` |
| `shared/src/schemas.ts` | Modify | Fix `analysisResponseSchema`: keywords `{technical,soft,tools}` → `{hardSkills,softSkills,domainKeywords,atsTerms}`; recruiterMessages `{linkedIn,email,dmShort:string}` → `{emailLinkedIn:{subject,body}, dmShort:{body}}`. Add `GROQ_JOB_ANALYSIS_JSON_SCHEMA` export. |
| `web/src/lib/ai-provider.ts` | Modify | Add `createBackendProxyAdapter()` — POSTs to `/api/ai/analyze`, maps HTTP errors to `AIOrchestratorError`, falls back to `fallbackTransport` on network failure |
| `web/src/lib/ai-client.ts` | Modify | Swap adapter: `createGroqProviderAdapter({…})` → `createBackendProxyAdapter({ fallbackTransport })` |
| `web/src/lib/validation/job-analysis.ts` | Modify | Import `GROQ_JOB_ANALYSIS_JSON_SCHEMA` from `@nexus-talent/shared` instead of local definition |

## Interfaces / Contracts

**Request** (Zod — already in shared):
```ts
analysisRequestSchema = z.object({
  jobDescription: z.string().min(1).max(12_000),
  messageTone: z.enum(["formal","casual","persuasive"]).optional(),
  githubRepositoryUrl: z.string().optional(),
})
```

**Response** (Zod — fixed fields shown):
```ts
keywords: z.object({
  hardSkills: z.array(z.string()),     // was: technical
  softSkills: z.array(z.string()),     // was: soft
  domainKeywords: z.array(z.string()), // was: tools
  atsTerms: z.array(z.string()),       // NEW
})
recruiterMessages: z.object({
  emailLinkedIn: z.object({ subject: z.string(), body: z.string() }), // was: linkedIn:string + email:string
  dmShort: z.object({ body: z.string() }),                            // was: dmShort:string
})
```

## Error Handling Flow

| Condition | Status | Mechanism |
|-----------|--------|-----------|
| Zod input validation fails | 400 | `validate(analysisRequestSchema)` middleware |
| Rate limit exceeded (20/min) | 429 | `rateLimiter({ windowMs: 60_000, max: 20 })` |
| Groq API unreachable | 502 | `AppError` from service → error handler |
| Groq returns malformed JSON | 502 | `JSON.parse` failure → `AppError(502)` |
| Groq response fails Zod validation | 502 | `analysisResponseSchema.safeParse()` in service |
| Network timeout (30s) | 502 | AbortController + `AppError(502)` |
| Backend unreachable (client) | Fallback | Adapter catches → `fallbackTransport` (local engine) |

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit (server) | `analysis.service.ts` — prompt building, Groq response parsing | Mock `fetch`. Test prompt content per tone. Test JSON parse errors → `AppError`. |
| Unit (server) | `analysis.controller.ts` — error wrapping | Mock service. Assert 400 on missing JD, 502 on service throw. |
| Integration (server) | `POST /api/ai/analyze` — full pipe | Supertest. Mock Groq response. Assert validated output shape. Test rate limiter returns 429. |
| Unit (web) | `createBackendProxyAdapter` — transport mapping | Mock `fetch`. Assert POST body, error → `AIOrchestratorError` mapping. |
| Unit (web) | Existing `ai-client.test.ts` and `ai-orchestrator.test.ts` | Must pass unchanged. They test the interface, not the transport. |
| Integration (web) | `createJobAnalysisClient` with backend proxy | Mock `fetch` returning valid SavedJobAnalysis. Assert normalized output. |

## Open Questions

- [ ] Confirm `GROQ_API_KEY` env var exists on Render (currently `VITE_GROQ_API_KEY` in Vite). Server needs `process.env.GROQ_API_KEY`.
- [ ] Decide adapter timeout: orchestrator default is 30s. Backend proxy should match or be shorter (8s?) since it's local HTTP.
