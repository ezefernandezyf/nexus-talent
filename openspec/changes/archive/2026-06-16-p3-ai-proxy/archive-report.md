# Archive Report: P3 AI Proxy

**Archived**: 2026-06-16
**Change**: P3 AI Proxy - Server-side Groq Proxy
**Project**: Nexus Talent
**Phase**: P3 of V1.1 Backend Migration

---

## 1. Change Summary

Moved Groq API calls from client-side (exposed `VITE_GROQ_API_KEY` in browser bundle) to a server-side proxy endpoint (`POST /api/ai/analyze`). The API key now lives exclusively in `GROQ_API_KEY` env var on the server, with Zod validation on both request and response, rate limiting (20 req/60s per IP), and a fallback to local analysis engine when the backend is unreachable.

**Key deliverables**:
- Server-side `analysis.service.ts` - Groq fetch via native `fetch` with 30s timeout, prompt builder, response validation
- Server-side `analysis.controller.ts` - request/response handling with error wrapping
- `analysis.router.ts` - POST /analyze with rate limiter + validate middleware
- `app.ts` mount path: `/api/analysis` → `/api/ai` (backward-compatible rename)
- `createBackendProxyAdapter()` - new frontend adapter implementing `ProviderAdapter<JobAnalysisPromptInput>`
- Adapter swap in `ai-client.ts`: `createGroqProviderAdapter` → `createBackendProxyAdapter`
- `analysisResponseSchema` field alignment: keywords `{technical,soft,tools}` → `{hardSkills,softSkills,domainKeywords,atsTerms}`
- `GROQ_JOB_ANALYSIS_JSON_SCHEMA` moved from `web/` to `shared/`
- `VITE_GROQ_API_KEY` removed from web bundle

**PR**: #36 merged to develop via squash (commit 758a5f0)
**Post-merge cleanup**: b192387 - removed dead code, added adapter tests

---

## 2. Artifacts Produced

### Files Created
| Path | Description |
|------|-------------|
| `server/src/analysis/analysis.service.ts` | Groq fetch via native fetch, prompt builder, 30s timeout, response validation |
| `server/src/analysis/analysis.controller.ts` | Request/response handler, error wrapping (400/502) |

### Files Modified
| Path | Description |
|------|-------------|
| `server/src/analysis/analysis.router.ts` | Added POST /analyze with rateLimiter + validate middleware |
| `server/src/infra/app.ts` | Changed mount from `/api/analysis` to `/api/ai` |
| `shared/src/schemas.ts` | Aligned `analysisResponseSchema` keywords and recruiterMessages fields |
| `shared/src/index.ts` | Added `GROQ_JOB_ANALYSIS_JSON_SCHEMA` re-export |
| `web/src/lib/ai-provider.ts` | Added `createBackendProxyAdapter()`, removed direct Groq provider |
| `web/src/lib/ai-client.ts` | Swapped adapter: GroqProvider → BackendProxy |
| `web/src/lib/validation/job-analysis.ts` | Import `GROQ_JOB_ANALYSIS_JSON_SCHEMA` from shared |

### Tests Added
| Path | Type |
|------|------|
| Server: analysis.service.test.ts | Unit - prompt building, Groq response parsing, error handling |
| Server: analysis.controller.test.ts | Unit - error wrapping, status codes |
| Server: analysis.router.test.ts | Integration (Supertest) - full pipe |
| Web: createBackendProxyAdapter.test.ts | Unit - transport mapping, error handling, fallback |
| Web: createJobAnalysisClient.test.ts | Integration - mocked fetch, normalized output |

### SDD Artifacts (Engram Observation IDs)

| Artifact | Engram ID |
|----------|-----------|
| Proposal | #1024 |
| Spec | #1025 |
| Design | #1026 |
| Tasks | #1027 |
| Apply Progress | #1028 |
| Archive Report | *(this document)* |

---

## 3. Spec Coverage

### New Domain: `ai-proxy` (6 requirements, 5 scenarios)
- **REQ-AI-001** ✅ - POST /api/ai/analyze accepts validated body
- **REQ-AI-002** ✅ - GROQ_API_KEY never reaches client
- **REQ-AI-003** ✅ - Response validated against analysisResponseSchema
- **REQ-AI-004** ✅ - Rate limit: 20 req/60s per IP
- **REQ-AI-005** ✅ - Error codes: 400/429/502
- **REQ-AI-006** ✅ - 30s timeout on Groq fetch

### Modified Domain: `ai-orchestrator` (3 added, 1 modified, 1 removed)
- **REQ-AI-007** ✅ - Transport calls POST /api/ai/analyze via useMutation
- **REQ-AI-008** ✅ - Exposes isPending, isError, error
- **REQ-AI-009** ✅ - Payload is { jobDescription, messageTone } only
- **Integration with ai-client** ✅ - Backward-compatible transport swap
- **Groq adapter as first concrete provider** 🔄 - Removed (frontend calls backend proxy now)

### Modified Domain: `shared-contracts` (2 requirements - no prior spec)
- **REQ-AI-011** ✅ - keywords field alignment (hardSkills, softSkills, domainKeywords, atsTerms)
- **REQ-AI-012** ✅ - analysisRequestSchema validates JD (1-12K chars) + tone

### Integration Requirements
- **REQ-AI-013** ✅ - ai-client.test.ts and ai-orchestrator.test.ts pass post-migration
- **REQ-AI-014** ✅ - VITE_GROQ_API_KEY removable without breaking local dev

### Specs Synced to Main
| Domain | Action | Details |
|--------|--------|---------|
| ai-proxy | **Created** | New spec - 6 requirements, 5 scenarios |
| ai-orchestrator | **Updated** | Added 3 requirements, modified integration section, removed Groq-adapter-first scenario |
| shared-contracts | **Created** | New spec - 2 requirements, 2 scenarios |

---

## 4. Test Results

### Final Test Count
- **57 test files**, **213 tests passing**
- All test suites green: server unit, server integration, web unit, web integration
- Zero regressions in existing test suite (REQ-AI-013 verified)

### Test Types
| Category | Count | Key Files |
|----------|-------|-----------|
| Server unit | ~25 | analysis.service.test.ts, analysis.controller.test.ts |
| Server integration | ~10 | analysis.router.test.ts (Supertest) |
| Web proxy adapter | ~12 | createBackendProxyAdapter.test.ts |
| Web ai-client | ~8 | ai-client.test.ts (unchanged interface) |
| Web orchestrator | ~6 | ai-orchestrator.test.ts (unchanged interface) |
| Other (preexisting) | ~152 | Auth, rate limiter, middleware, etc. |

### CI
- **Green** - GitHub Actions: lint, type-check, test all pass
- **Verified**: Full `pnpm test` in both `web/` and `server/` workspaces

### Security
- ✅ `VITE_GROQ_API_KEY` removed from client bundle
- ✅ `GROQ_API_KEY` now server-only env var
- ✅ No API key leaks via bundle analysis

### Coverage Notes
- Critical logic paths covered: prompt building, Groq response parsing, error classification, fallback trigger
- Coverage thresholds met per project standards

---

## 5. Deviations

| Deviation | Detail | Justification |
|-----------|--------|---------------|
| Post-merge fix | Error message text changed from "contra Groq" to "de análisis" in one test assertion | Adapter swap changed provider name; test updated to match actual error message |
| `web/.env.example` | No change needed - `VITE_GROQ_API_KEY` was already absent | Already cleaned in prior work |
| Adapter timeout | Design had open question (30s vs 8s); implemented with 30s to match orchestrator default | Consistency with existing timeout config |

No intentional deviations from the spec or design that required exception approval.

---

## 6. Lessons Learned

### Gotchas
1. **Error message localization**: When swapping adapters, error messages changed because the provider name changed. The test `"rethrows unexpected transport errors as-is"` had to be updated from `"contra Groq"` to `"de análisis"` - a mechanical change but easy to miss.
2. **Barrel exports**: `web/src/lib/validation/index.ts` re-exports from `job-analysis.ts`. When `job-analysis.ts` changed to re-export from shared, the barrel chain remained intact - no additional changes needed.
3. **`web/.env.example` state**: The file already had no `VITE_GROQ_API_KEY` entry, likely cleaned in an earlier module. Always verify actual file state against assumptions.
4. **PR merge strategy**: Squash merge into develop is the standard. Post-merge cleanup (dead code removal, additional adapter tests) was committed separately as a direct develop commit (b192387).

### What Went Well
- Single PR was the right strategy (~210-250 lines, within budget)
- Adapter pattern paid off: orchestrator and ai-client interfaces unchanged
- Shared Zod schemas meant alignment was a mechanical field rename
- Rate limiter reuse avoided reinventing middleware
- Fallback transport to local analysis engine preserved resilience

---

## 7. Remaining Work / Future Improvements

### P4 - History API
- [ ] GET /api/analyses (list, paginated)
- [ ] GET /api/analyses/:id (detail)
- [ ] DELETE /api/analyses/:id
- [ ] PATCH /api/analyses/:id (edit summary/notes)
- [ ] Repository pattern preserved (HTTP client in web)

### Warnings from Apply/Verify
- No critical issues found in verification
- Minor: adapter timeout open question (30s vs 8s) resolved pragmatically with 30s
- `GROQ_API_KEY` env var must be set on Render before the proxy works in production
- The analysis mount path change (`/api/analysis` → `/api/ai`) is a breaking change for any direct `/api/analysis/test` callers - only affects internal health checks

### Security Reminders
- Rate limiting (20/min) is per-process in-memory - scale concerns if running multiple instances without a shared store
- `VITE_GROQ_API_KEY` should be removed from Vercel/Render env vars to prevent confusion

---

## 8. Source of Truth Updated

The following main specs now reflect the P3 AI Proxy behavior:

| Spec Path | Action |
|-----------|--------|
| `openspec/specs/ai-proxy/spec.md` | **Created** - new domain |
| `openspec/specs/ai-orchestrator/spec.md` | **Updated** - added backend proxy requirements, removed Groq-adapter-first |
| `openspec/specs/shared-contracts/spec.md` | **Created** - shared Zod contract requirements |

---

## 9. Archive Verification

- [x] Main specs updated correctly (3 domains)
- [x] Change folder moved to archive: `openspec/changes/archive/2026-06-16-p3-ai-proxy/`
- [x] Archive contains all artifacts: proposal, spec, design, tasks
- [x] Tasks complete: 10/10 implementation tasks marked `[x]`
- [x] Active changes directory no longer has `p3-ai-proxy`

---

## SDD Cycle Complete

The change has been fully planned, proposed, specified, designed, implemented, verified, and archived. Ready for **P4: History API**.
