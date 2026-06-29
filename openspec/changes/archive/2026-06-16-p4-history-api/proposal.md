# Proposal: P4 History API

## Intent

Move analysis history from localStorage to server-side persistence (Prisma/Supabase). Enables cross-device sync, survives browser clears, and sets the foundation for authenticated user data.

## Scope

### In Scope
- CRUD endpoints under `/api/analyses` (list, detail, delete, patch)
- Prisma migration: add `displayName`, `notes`, `summary`, `skillGroups` to Analysis model
- `HttpAnalysisRepository` implementing `AnalysisRepository` + `update()` method
- Repository injection swap: HTTP for auth users, localStorage fallback for anonymous
- P3 save coupling: `POST /api/ai/analyze` persists to DB after Groq returns
- `shared-contracts` schemas: `analysisUpdateSchema`, `displayName`/`notes` in response

### Out of Scope
- Pagination overhaul (stays client-side - low data volume)
- Anonymous server storage (localStorage remains fallback)
- UI refresh or component changes
- Cross-device sync UX (infra ready, UI deferred)

## Capabilities

### New
- `history-api`: REST CRUD - list, detail, delete, patch under `/api/analyses`

### Modified
- `persistence`: Add `update()` to `AnalysisRepository`; allow local + HTTP implementations
- `shared-contracts`: Add `analysisUpdateSchema`; `displayName`, `notes` in response
- `analysis`: P3 save coupling - persist to DB after Groq returns
- `history`: Data source changes from localStorage to HTTP API (UI behavior unchanged)

## API Contract

| Method | Route | Auth | Request | Response |
|--------|-------|------|---------|----------|
| GET | `/api/analyses` | required | - | `{ items: Analysis[], total: number }` |
| GET | `/api/analyses/:id` | required | - | `Analysis` |
| DELETE | `/api/analyses/:id` | required | - | `204` |
| PATCH | `/api/analyses/:id` | required | `{ displayName?, notes? }` | `Analysis` |

All scoped to `req.userId`.

## Approach

Direct HTTP swap. `HttpAnalysisRepository` implements the same `AnalysisRepository` (plus `update`). `useAnalysisRepository.ts` picks impl based on auth status. Zero UI changes. Backend: `history.router.ts` → `controller` → `service` → Prisma. P3 coupling: `analysis.controller.ts` calls `historyService.create()` after Groq validates.

Client-side pagination: `getAll()` loads all, UI paginates (same as today).

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `server/prisma/schema.prisma` | Modified | Add 4 fields to Analysis |
| `server/src/history/*` | New | 4 files (router, controller, service, test) |
| `server/src/analysis/analysis.controller.ts` | Modified | Save to DB after Groq |
| `server/src/infra/app.ts` | Modified | Mount `/api/analyses` |
| `shared/src/schemas.ts` | Modified | Add PATCH schema, new response fields |
| `web/src/lib/repositories/http-analysis-repository.ts` | New | HTTP client |
| `web/src/lib/repositories/analysis-repository.ts` | Modified | Add `update()` |
| `web/src/lib/repositories/local-analysis-repository.ts` | Modified | Implement `update()` |
| `web/src/features/analysis/hooks/useAnalysisRepository.ts` | Modified | Swap impl by auth |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Migration breaks existing analysis data | Low | Test locally first, backup DB |
| Auth middleware not applied to new routes | Low | `requireAuth` on every endpoint |
| P3 save coupling breaks analysis response | Med | Isolate in try/catch, never fail the response |
| `getAll()` loads all rows - perf on large datasets | Low | Revisit if users exceed 500 analyses |

## Rollback Plan

Revert Prisma migration. Revert all server/web files. `LocalAnalysisRepository` is untouched and still works as fallback.

## Dependencies

- Prisma migration must run before endpoints work
- P3 (AI Proxy) already deployed ✅
- Supabase Analysis table exists from P1

## Success Criteria

- [ ] All 4 CRUD endpoints return correct data per `userId`
- [ ] `HttpAnalysisRepository` passes same test suite as `LocalAnalysisRepository`
- [ ] `POST /api/ai/analyze` persists to DB after Groq returns
- [ ] Anonymous users see localStorage history; auth users see server data
- [ ] No UI regressions in HistoryFeature
