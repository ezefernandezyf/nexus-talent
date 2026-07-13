# Tasks: P17 — CV Generator

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~1,200–1,500 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 → PR 2 → PR 3 |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Prisma + shared schemas + server CRUD + tests | PR 1 | base=feat/cv-generator; standalone data mgmt |
| 2 | POST /api/cv/generate + Groq integration + tests | PR 2 | base=PR 1 branch |
| 3 | Frontend: pages, hooks, components, routes, E2E | PR 3 | base=PR 2 branch |

## Group 1: Database + Shared Schemas
- [x] **T1.1** — Prisma: `WorkExperience` + `Education` models in `server/prisma/schema.prisma`
- [x] **T1.2** — Migration: manual SQL migration `add_work_experience_education`
- [x] **T1.3** — Shared: Zod schemas in `shared/src/schemas.ts` (workExperience, education, cvGenerate request/response)

## Group 2: Server CRUD
- [x] **T2.1** — Service: `cv.service.ts` — CRUD + ownership enforcement via `findFirst({id, userId})`
- [x] **T2.2** — Controller: `cv.controller.ts` — thin handlers, `next(error)` on errors
- [x] **T2.3** — Router: `cv.router.ts` — 8 routes (GET/POST/PUT/DELETE × experience + education), `requireAuth`
- [x] **T2.4** — Wire: `app.use("/api/cv", cvRouter)` in `app.ts`
- [x] **T2.5** — Tests: ownership, 401, 400, 404 scenarios (22 tests)

## Group 3: Server Generate
- [x] **T3.1** — Service: `generateCV()` — merge data, build prompt, `fetchGroq()`, Zod validate, 502 on errors
- [x] **T3.2** — Router: `POST /api/cv/generate` with `cvGenerateRequestSchema` validation
- [x] **T3.3** — Tests: 401, 400 invalid tone, 400 jobDescription >12k, 200 empty body, 200 full payload, 502 propagation

## Group 4: Frontend Foundation
- [x] **T4.1** — API: `cv-repository.ts` — `apiClient` wrapper for all CV endpoints
- [x] **T4.2** — Hooks: `useExperience.ts`, `useEducation.ts`, `useCVGenerate.ts` — React Query mutations

## Group 5: Frontend Pages
- [x] **T5.1** — Page: `ExperienceManagerPage.tsx` — CRUD list with inline add/edit/delete
- [x] **T5.2** — Page: `EducationManagerPage.tsx` — CRUD list with inline add/edit/delete
- [x] **T5.3** — Page: `CVPage.tsx` — section ordering, ad-hoc items, preview, export

## Group 6: Frontend Components
- [x] **T6.1** — `CVPreview.tsx` — renders sections as formatted document
- [x] **T6.2** — `AdHocItemForm.tsx` — inline form for transient section items
- [x] **T6.3** — `SectionOrderEditor.tsx` — drag-to-reorder using `@dnd-kit/core`
- [x] **T6.4** — Export helpers: `.md`, `.html` download (`.pdf` deferred — no `@react-pdf/renderer` usage in this PR slice)

## Group 7: Routing + Nav
- [x] **T7.1** — Routes: `/app/cv`, `/app/cv/experience`, `/app/cv/education` in `router.tsx`
- [x] **T7.2** — Nav: "CV" nav item (requiresAuth) in `AppLayout.tsx`
- [x] **T7.3** — Deps: Install `@react-pdf/renderer`

## Group 8: E2E
- [x] **T8.1** — Playwright: create experience + education → generate CV → verify sections render
