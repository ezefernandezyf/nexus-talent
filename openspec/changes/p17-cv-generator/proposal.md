# Proposal: P17 — CV Generator

## Intent

Users can generate tailored CVs from their profile data + AI. Currently, profile data exists (skills, experience, role) but is only used for analysis enrichment. No structured work/education history exists, and there's no way to produce a formatted CV. P17 closes this gap: users manage structured experience entries, then generate an AI-optimized CV in Markdown/HTML/PDF tailored to an optional job description.

## Scope

### In Scope
- `WorkExperience` and `Education` Prisma models + CRUD API
- Shared Zod schemas for experience/education CRUD + CV generation request/response
- `POST /api/cv/generate` — Groq-powered CV generation (reusing analysis service pattern)
- CV preview page in browser (React)
- Export: Markdown (.md), HTML, and PDF (client-side via print CSS / `@react-pdf/renderer`)
- Ad-hoc items: user can add extra entries at generation time without persisting to DB
- AI-proposed section ordering with user drag-to-rearrange before generation
- CV feature flag / entry point in app navigation

### Out of Scope
- CV history / saved CVs (ephemeral only — no new DB model for generated CVs)
- PDF generation via server (no Puppeteer — client-side only)
- ATS-scoring or job-match for the CV (analysis already covers this)
- Multiple CV templates/themes (one clean template, defer variants)
- Auto-fill from LinkedIn / resume upload parsing
- Programmatic download of another user's CV data

## Capabilities

### New Capabilities
- `cv-experience`: WorkExperience and Education CRUD — create, read, update, delete structured career entries
- `cv-generator`: AI-powered CV generation via Groq — profile + experience + education + ad-hoc items + optional JD tailoring

### Modified Capabilities
- `profile-fields`: Profile data (skills, roleTitle, experienceLevel, location) becomes input to CV generation (no schema change, usage change only)
- `ai-proxy`: Extend Groq pipeline with a new endpoint — shared fetch/parse pattern, different prompt + response schema

## Approach

1. **Prisma**: Add `WorkExperience` and `Education` models linked to `Profile` via FK
2. **Server**: New `cv/` domain with CRUD router for experience/education + generate endpoint
3. **Groq**: Reuse `fetchGroq()` from analysis service; new system prompt for CV output; `response_format: json_object`; validate against new Zod CV schema
4. **Frontend**: Settings-style pages for managing experience/education; CV generator page with preview + export
5. **PDF**: Client-side — `@react-pdf/renderer` for programmatic PDF, CSS `@media print` for browser print, standard HTML for HTML export

## Data Models

```prisma
model WorkExperience {
  id          String   @id @default(uuid())
  userId      String
  company     String
  role        String
  startDate   String   // ISO date string for simplicity
  endDate     String?  // null = current
  description String?  // bullet points or paragraph
  location    String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  profile Profile @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([userId])
}

model Education {
  id          String   @id @default(uuid())
  userId      String
  institution String
  degree      String
  field       String?
  startDate   String
  endDate     String?
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  profile Profile @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([userId])
}
```

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/cv/experience` | requireAuth | List user's work experience |
| POST | `/api/cv/experience` | requireAuth | Create work experience entry |
| PUT | `/api/cv/experience/:id` | requireAuth | Update work experience entry |
| DELETE | `/api/cv/experience/:id` | requireAuth | Delete work experience entry |
| GET | `/api/cv/education` | requireAuth | List user's education entries |
| POST | `/api/cv/education` | requireAuth | Create education entry |
| PUT | `/api/cv/education/:id` | requireAuth | Update education entry |
| DELETE | `/api/cv/education/:id` | requireAuth | Delete education entry |
| POST | `/api/cv/generate` | requireAuth | Generate CV via Groq |

## Frontend Pages

| Route | Component | Description |
|-------|-----------|-------------|
| `/cv` | `CVPage` | Generator page: reorder sections, add ad-hoc items, preview CV |
| `/cv/experience` | `ExperienceManagerPage` | CRUD list for work experience entries |
| `/cv/education` | `EducationManagerPage` | CRUD list for education entries |

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `server/prisma/schema.prisma` | New | `WorkExperience`, `Education` models |
| `server/src/cv/` | New | Controller, service, router — experience CRUD + generate |
| `server/src/infra/app.ts` | Modified | Wire `/api/cv` router |
| `server/src/infra/prisma.ts` | None | Already configured, models auto-discovered |
| `shared/src/schemas.ts` | New | `workExperienceSchema`, `educationSchema`, `cvGenerateRequestSchema`, `cvGenerateResponseSchema` |
| `web/src/features/cv/` | New | Pages, hooks, components for experience/education mgmt + CV generation |
| `web/src/App.tsx` | Modified | Add `/cv` routes |
| `web/src/shared/layouts/AppLayout.tsx` | Modified | Add CV nav entry |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Groq CV output quality inconsistent | Med | Zod validation on output + user can regenerate; structured prompt with examples |
| Missing work/education data = empty CV | Med | Show inline guidance: "Add at least one experience entry to generate a CV" |
| PDF fidelity across browsers | Low | Client-side `@react-pdf/renderer` for consistent output; `window.print()` as fallback |
| Large ad-hoc item list exceeds Groq token budget | Low | Cap total input length, warn user if approaching limit |
| User deletes an entry used in a generated CV | None | No history — CV is ephemeral, always regenerated from current data |

## Rollback Plan

- **Prisma**: Drop `WorkExperience` + `Education` tables (additive migration)
- **Server**: Remove `/api/cv` router from `app.ts`, delete `server/src/cv/`
- **Frontend**: Remove cv feature folder, revert route additions, remove nav link
- **Shared**: Remove CV schemas (no other code depends on them)

## Dependencies

- Prisma migration tooling
- `@react-pdf/renderer` (new client dependency for PDF export)
- Existing Groq API key + `llama-3.3-70b-versatile` model

## Success Criteria

- [ ] CRUD: create/read/update/delete work experience entries via API
- [ ] CRUD: create/read/update/delete education entries via API
- [ ] `POST /api/cv/generate` returns structured CV with sections, formatted via Groq
- [ ] CV preview renders in browser with correct section ordering
- [ ] Export downloads as `.md`, `.html`, and `.pdf`
- [ ] Ad-hoc items appear in generated CV without being persisted
- [ ] User can reorder sections before generation
- [ ] Zod validation rejects invalid input on all new endpoints
