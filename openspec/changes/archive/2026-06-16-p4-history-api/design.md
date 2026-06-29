# Design: P4 History API

## Technical Approach

Add CRUD endpoints under `/api/analyses` (Express router → controller → service → Prisma), scoped by `req.userId`. Add 4 fields to `Analysis` model. Couple `POST /api/ai/analyze` to persist results via best-effort try/catch. On the frontend, create `HttpAnalysisRepository` (fetch + `credentials: "include"`) and swap it in `useAnalysisRepository` when auth status is `AUTHENTICATED`.

## Architecture Decisions

| Decision | Option A | Option B | Choice | Rationale |
|----------|----------|----------|--------|-----------|
| Router path | `/api/history` (current stub) | `/api/analyses` | **B** | Matches REST convention for resource; `/api/history` already exists as stub but P4 replaces it |
| Save mechanism | POST /api/analyses (explicit) | Server-side during `POST /api/ai/analyze` (P3 coupling) | **B** | Avoids double HTTP roundtrip; analysis result already has `id` and `createdAt` from Groq response |
| HttpAnalysisRepository.save() | POST to /api/analyses | Pass-through - return shaped result | **Pass-through** | Server already saved it via P3 coupling; frontend save is redundant for auth users |
| Auth on /api/analyses | `optionalAuth` | `requireAuth` | **requireAuth** | All history endpoints are authenticated; anonymous falls back to localStorage on client |
| Prisma field types | `outreachMessage: String` (JSON-serialized) | Migrate to `Json` | **Keep String** | Existing code serializes/deserializes; migration risk not justified. New `skillGroups` uses `Json` natively |

## Data Flow

```
POST /api/ai/analyze (auth user)
  ├─ analysisService.analyze(jd) → Groq → validated result
  ├─ [NEW] try { historyService.saveAnalysis(userId, result) } catch (warn)
  └─ Response: { id, summary, skillGroups, ...createdAt }

GET /api/analyses (auth user)
  └─ historyService.getAll(userId) → Prisma.findMany({ where: { userId }, orderBy: { createdAt: "desc" } })
       └─ Map: deserialize JSON strings to objects for response

PATCH /api/analyses/:id
  └─ validate(analysisUpdateSchema) → historyService.update(userId, id, patch)
       └─ Prisma.findFirst({ where: { id, userId } }) → 404 if not found → update

UI layer:
  useAnalysisRepository() → status === AUTHENTICATED ? HttpAnalysisRepository : LocalAnalysisRepository
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `server/src/history/history.router.ts` | **Rewrite** | Full CRUD: GET `/`, GET `/:id`, DELETE `/:id`, PATCH `/:id` - all `requireAuth` |
| `server/src/history/history.controller.ts` | **New** | 4 handlers: list, detail, remove, patch - thin delegation to service |
| `server/src/history/history.service.ts` | **New** | Prisma queries scoped to `userId`; `AppError(404)` for not found |
| `server/prisma/schema.prisma` | **Modify** | Add `summary`, `skillGroups`, `displayName`, `notes` to Analysis |
| `server/src/infra/app.ts` | **Modify** | Replace `app.use("/api/history", historyRouter)` with `app.use("/api/analyses", historyRouter)` |
| `server/src/analysis/analysis.controller.ts` | **Modify** | After `analyze()` succeeds, `try { historyService.saveAnalysis(...) } catch` |
| `shared/src/schemas.ts` | **Modify** | Add `analysisUpdateSchema`: `z.object({ displayName: z.string().optional(), notes: z.string().optional() })` |
| `web/src/lib/repositories/http-analysis-repository.ts` | **New** | Implements `AnalysisRepository`; fetch to `/api/analyses` with `credentials: "include"` |
| `web/src/lib/repositories/index.ts` | **Modify** | Export `createHttpAnalysisRepository` |
| `web/src/features/analysis/hooks/useAnalysisRepository.ts` | **Modify** | Swap impl: auth user → `createHttpAnalysisRepository()`, anon → `createLocalAnalysisRepository()` |

## Interfaces / Contracts

```typescript
// analysisUpdateSchema (shared/src/schemas.ts)
export const analysisUpdateSchema = z.object({
  displayName: z.string().trim().min(1).optional(),
  notes: z.string().trim().min(1).optional(),
}).strict();

// HttpAnalysisRepository.save() - pass-through, no HTTP call
async save(jobDescription, result): Promise<SavedJobAnalysis> {
  return { ...result, jobDescription, id: result.id, createdAt: result.createdAt };
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit (server) | `history.service.ts` CRUD with mocked Prisma | Vitest + mock Prisma client |
| Unit (web) | `HttpAnalysisRepository` fetch calls | Vitest + `vi.fn()` on global fetch |
| Integration (server) | `/api/analyses` endpoints with real DB | Supertest + test DB |
| Integration (web) | `useAnalysisRepository` hook swap | Vitest + mock useAuth status |

## Migration / Rollout

Prisma migration adds nullable/optional fields with defaults - no data loss. Rollback: revert migration + code changes. `LocalAnalysisRepository` untouched as fallback.

## Open Questions

- [ ] Should `HttpAnalysisRepository.save()` fully POST to a new endpoint, or pass-through? (Design chooses pass-through - P3 coupling handles persistence.)
- [ ] P3's `POST /api/ai/analyze` currently doesn't require auth - should anonymous analyses also be persisted server-side? (Proposal says no - anonymous stays localStorage.)
