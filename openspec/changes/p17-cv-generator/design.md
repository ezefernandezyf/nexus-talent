# Design: P17 — CV Generator

## Technical Approach

Two new Prisma models (`WorkExperience`, `Education`), a `cv/` server domain (experience/education CRUD + Groq-powered CV generation), and a `features/cv/` frontend module. Ad-hoc items are transient (request body only, never persisted). PDF export is client-side via `@react-pdf/renderer`. Groq integration reuses the `fetchGroq()` pattern from analysis service.

## Architecture Decisions

| # | Option | Tradeoff | Decision |
|---|--------|----------|----------|
| 1 | Ad-hoc items: persist vs request-body-only | Persisting = more DB models & CRUD. Transient = simpler, matches spec scope | Transient — merged into Groq prompt only, no DB model |
| 2 | Section ordering: frontend-only vs AI-respected | Frontend-only simpler but AI may reorder. Passing sectionOrder to Groq respects user intent | Send sectionOrder to AI in system prompt |
| 3 | PDF: server (Puppeteer) vs client (`@react-pdf/renderer`) | Server = consistent, heavier infra. Client = lighter, instant preview | Client-side `@react-pdf/renderer` + `window.print()` fallback |
| 4 | Ownership: middleware vs service-level | Middleware reusable but needs per-model lookup. Service-level matches existing pattern | Service-level: `findFirst({ where: { id, userId } }) → AppError(404)` |

## Data Flow

```
User builds CV → POST /api/cv/generate { sectionOrder, adHocItems, jobDescription? }
  → Server fetches: profile skills + experience + education from DB
  → Merges all into single Groq prompt (system prompt + user message)
  → fetchGroq() → parseGroqEnvelope() → Zod validate
  → Return { sections: [{heading, body}...], metadata: {...} }
  → Frontend renders sections, offers Markdown/HTML/PDF export
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `server/prisma/schema.prisma` | Modify | Add `WorkExperience` and `Education` models |
| `shared/src/schemas.ts` | Modify | Add `workExperienceSchema`, `educationSchema`, `cvGenerateRequestSchema`, `cvGenerateResponseSchema` |
| `server/src/cv/cv.router.ts` | Create | 9 routes: experience CRUD (4), education CRUD (4), generate (1) |
| `server/src/cv/cv.controller.ts` | Create | Thin handlers: parse params, call service, `next(error)` |
| `server/src/cv/cv.service.ts` | Create | CRUD with ownership enforcement + `generateCV()` with Groq |
| `server/src/infra/app.ts` | Modify | Wire `app.use("/api/cv", cvRouter)` |
| `web/src/features/cv/pages/CVPage.tsx` | Create | Generator: drag-to-reorder sections, ad-hoc items, preview, export |
| `web/src/features/cv/pages/ExperienceManagerPage.tsx` | Create | CRUD list for work experience |
| `web/src/features/cv/pages/EducationManagerPage.tsx` | Create | CRUD list for education |
| `web/src/features/cv/hooks/useExperience.ts` | Create | React Query hooks for experience CRUD |
| `web/src/features/cv/hooks/useEducation.ts` | Create | React Query hooks for education CRUD |
| `web/src/features/cv/hooks/useCVGenerate.ts` | Create | `useMutation` for POST /api/cv/generate |
| `web/src/features/cv/api/cv-repository.ts` | Create | `apiClient` wrapper for all CV endpoints |
| `web/src/features/cv/components/CVPreview.tsx` | Create | Renders sections as formatted document |
| `web/src/features/cv/components/AdHocItemForm.tsx` | Create | Inline form for adding transient items |
| `web/src/features/cv/components/SectionOrderEditor.tsx` | Create | Drag-to-reorder section list |
| `web/src/core/router.tsx` | Modify | Add `/app/cv`, `/app/cv/experience`, `/app/cv/education` routes |
| `web/src/shared/layouts/AppLayout.tsx` | Modify | Add "CV" nav item, requiresAuth |

## Interfaces / Contracts

```typescript
// Shared Zod schemas (in shared/src/schemas.ts)

export const workExperienceSchema = z.object({
  id: z.string().optional(), // omit on create, include on read/update
  company: z.string().min(1),
  role: z.string().min(1),
  startDate: z.string(), // ISO date
  endDate: z.string().nullable().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
});

export const adHocItemSchema = z.object({
  section: z.string().min(1),  // e.g. "projects", "certifications"
  title: z.string().min(1),
  subtitle: z.string().optional(),
  description: z.string().optional(),
});

export const cvGenerateRequestSchema = z.object({
  sectionOrder: z.array(z.string()).optional(),
  adHocItems: z.array(adHocItemSchema).optional().default([]),
  jobDescription: z.string().max(12000).optional(),
  tone: z.enum(["formal", "casual"]).optional().default("formal"),
});

export const cvGenerateResponseSchema = z.object({
  sections: z.array(z.object({
    heading: z.string().min(1),
    body: z.string().min(1),
  })),
  metadata: z.object({
    generatedAt: z.string(),
    sectionsIncluded: z.array(z.string()),
  }),
});
```

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| **Service (unit)** | CRUD ownership enforcement, Groq prompt building | Mock Prisma, mock fetch — test AppError 404 for not-owned, test prompt includes all data sources |
| **Router (integration)** | Auth gating, Zod validation, Groq timeout | Mock `requireAuth`, mock service methods — test 401, 400, 502 flows |
| **Hooks (frontend unit)** | React Query mutations, error handling | Mock `apiClient`, test mutation lifecycle |
| **E2E** | Happy path: create experience → generate CV → export | Playwright — single flow test |

## Migration / Rollout

- Prisma: additive migration (`prisma migrate dev --name add_work_experience_education`). No data to migrate.
- Frontend: feature behind auth gate only. No feature flag needed — nav item appears for authenticated users, route is protected.
- Rollback: drop tables, remove router wiring, delete `cv/` folders.

## Open Questions

- [ ] Do we expose CV endpoints to public profiles? (current design: auth-only, CV is personal tool — consistent with proposal scope)
- [ ] Drag-to-reorder: `@dnd-kit/core` (existing dep) or native HTML5 drag? (design defaults to `@dnd-kit/core` for consistency)
