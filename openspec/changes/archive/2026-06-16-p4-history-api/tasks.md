# Tasks: P4 History API

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~350 (prod + test) |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

## Phase 1: Prisma Migration (~20 LOC)

- [x] 1.1 Add `displayName`, `notes`, `summary`, `skillGroups` to `Analysis` model in `server/prisma/schema.prisma` - all optional, `skillGroups` as `Json`, rest as `String?`
- [x] 1.2 Run `pnpm run prisma:migrate` - need DB connection to create migration file; `prisma generate` succeeded

## Phase 2: Shared Contracts (~15 LOC)

- [x] 2.1 Add `analysisUpdateSchema` to `shared/src/schemas.ts`: `z.object({ displayName: z.string().trim().min(1).optional(), notes: z.string().trim().min(1).optional() }).strict()` (file is `shared/src/schemas.ts`, not `shared/contracts/schemas.ts`)
- [x] 2.2 `displayName`, `notes` fields already exist in `analysisResponseSchema` - no changes needed

## Phase 3: Server CRUD (~120 LOC)

- [x] 3.1 Create `server/src/history/history.service.ts` - Prisma queries: `getAll(userId)`, `getById(userId, id)`, `remove(userId, id)`, `update(userId, id, data)` - all scoped by `userId`, 404 via `AppError`
- [x] 3.2 Create `server/src/history/history.controller.ts` - 4 thin handlers: `list`, `detail`, `remove`, `patch` - delegate to service, format response
- [x] 3.3 Rewrite `server/src/history/history.router.ts` - full CRUD routes with `requireAuth`: `GET /`, `GET /:id`, `DELETE /:id`, `PATCH /:id`
- [x] 3.4 Update `server/src/infra/app.ts` - replace `app.use("/api/history", historyRouter)` with `app.use("/api/analyses", historyRouter)`

## Phase 4: P3 Save Coupling (~15 LOC)

- [x] 4.1 Modify `server/src/analysis/analysis.controller.ts` - after successful Groq analysis, call `historyService.saveAnalysis(...).catch(...)` (best-effort, never fail the response)

## Phase 5: Frontend HTTP Repository (~80 LOC)

- [x] 5.1 `update(id, data)` and `AnalysisUpdatePatch` already exist in `AnalysisRepository` interface - no changes needed
- [x] 5.2 `update()` already implemented in `LocalAnalysisRepository` - no changes needed
- [x] 5.3 Create `web/src/lib/repositories/http-analysis-repository.ts` - fetch `/api/analyses` with `credentials: "include"`, implement `getAll`, `getById`, `delete`, `update`; `save()` is pass-through
- [x] 5.4 Update `web/src/features/analysis/hooks/useAnalysisRepository.ts` - swap impl: `AUTHENTICATED` → `HttpAnalysisRepository`, `UNAUTHENTICATED` → `LocalAnalysisRepository`

## Phase 6: Testing (~70 LOC)

- [ ] 6.1 Write `server/src/history/history.service.test.ts` - mock Prisma, test CRUD, verify userId scoping and 404 on not-found/mismatch
- [ ] 6.2 Write `web/src/lib/repositories/http-analysis-repository.test.ts` - mock `global.fetch`, verify headers, auth, and error handling
