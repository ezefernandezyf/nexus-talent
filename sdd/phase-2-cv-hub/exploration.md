## Exploration: Phase 2 — CV Hub in Settings

### Current State

#### 1. Current Settings Page (`web/src/features/settings/`)

The Settings page lives at `/app/settings` and is rendered via `SettingsPage.tsx` → `SettingsFeature.tsx`. Currently it has 4 numbered sections rendered as standalone `Card` components (NOT accordion):

- **01 Account**: `SettingsForm` — display name + email editing, profile save/load with react-hook-form + Zod
- **02 Appearance**: Theme display badge only (no toggle, follows OS)
- **03 Data**: Export button, logout, OAuth linking accordion, delete account
- **04 Perfil Profesional**: `ProfileEditorCard` — role title, experience level, skills (plain string), LinkedIn, GitHub, resume link, location — saves via `useSettings` hook → `profile-repository.ts` → `PUT /api/profile`

Key files:
- `SettingsFeature.tsx` — orchestrator, 349 lines
- `pages/SettingsPage.tsx` — thin shell with `FeaturePageShell`
- `components/ProfileEditorCard.tsx` — standalone form, uses `react-hook-form` + `zodResolver(profileUpdateSchema)`
- `components/SettingsForm.tsx` — simpler form for display name only
- `hooks/useSettings.ts` — React Query hook, query key `["settings", "profile", userId]`, wraps `ProfileRepository`
- `api/profile-repository.ts` — `GET /api/profile`, `PUT /api/profile`, `DELETE /api/profile/:userId`
- `api/validation.ts` — local Zod schemas: `PROFILE_RECORD_SCHEMA` (snake_case DB shape) and `PROFILE_SAVE_INPUT_SCHEMA` (camelCase form shape)

#### 2. Existing CV Experience & Education (`web/src/features/cv/`)

Two fully built CRUD manager pages at `/app/cv/experience` and `/app/cv/education`:

**ExperienceManagerPage** (343 lines):
- Uses `useExperience()` hook → `cv-repository.ts` → `GET/POST/PUT/DELETE /api/cv/experience`
- Inline form component with: company, role, startDate, endDate, description (multiline), location
- Card-list display per entry with Edit/Delete
- Skeleton loading, error, empty, add/edit/delete states all handled
- Type: `WorkExperienceCreateDTO` / `WorkExperienceUpdateDTO` / `WorkExperienceDTO` from shared

**EducationManagerPage** (340 lines):
- Identical pattern: `useEducation()` → `GET/POST/PUT/DELETE /api/cv/education`
- Inline form: institution, degree, field, startDate, endDate, description
- Same state handling pattern

**Hooks** (`useExperience.ts`, `useEducation.ts`):
- Standard React Query hooks with separate query keys: `["cv", "experience"]` and `["cv", "education"]`
- Each exposes: query (data/isLoading/isError), `createMutation`, `updateMutation`, `deleteMutation`

**Repository** (`cv-repository.ts`):
- Clean API client functions using `apiClient` — no duplicate abstractions

#### 3. Server CV API (`server/src/cv/`)

Complete REST endpoints (`cv.router.ts`):

| Method | Path | Controller | Service |
|--------|------|-----------|---------|
| GET | `/api/cv/experience` | `listExperience` | `prisma.workExperience.findMany` |
| POST | `/api/cv/experience` | `createExperience` | `prisma.workExperience.create` |
| PUT | `/api/cv/experience/:id` | `updateExperience` | `prisma.workExperience.update` |
| DELETE | `/api/cv/experience/:id` | `deleteExperience` | `prisma.workExperience.delete` |
| GET | `/api/cv/education` | `listEducation` | `prisma.education.findMany` |
| POST | `/api/cv/education` | `createEducation` | `prisma.education.create` |
| PUT | `/api/cv/education/:id` | `updateEducation` | `prisma.education.update` |
| DELETE | `/api/cv/education/:id` | `deleteEducation` | `prisma.education.delete` |

All protected by `requireAuth` middleware. Service layer validates ownership via `findFirst({ where: { id, userId } })`.

#### 4. Profile / Contact Data (`server/prisma/schema.prisma`)

```prisma
model Profile {
  id              String   @id
  email           String   @unique
  displayName     String?
  skills          String?         // free text, comma-separated
  experienceLevel String?
  roleTitle       String?
  resumeLink      String?
  linkedinUrl     String?
  githubUrl       String?
  location        String?
  passwordHash    String?
  googleId        String?  @unique
  avatarUrl       String?
  authProvider    String   @default("email")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  // relations...
}
```

**Already exists**: `linkedinUrl`, `githubUrl`, `resumeLink`, `location`, `skills`
**Needs to be added**: `phone`, `portfolio`

Skills are stored as a single plain `String?` field. No separate skills table.

#### 5. Shared Components

**Available and ready for reuse:**
- **`<Input>`** (`web/src/shared/components/input/`) — `label`, `error`, `multiline`, `iconPrefix`/`iconSuffix`, `ref` forwarding, accessible
- **`<Label>`** (`web/src/shared/components/label/`) — simple label wrapper
- **`<Card>`** (`web/src/shared/components/card/`) — compound component
- **`<Button>`** (`web/src/shared/components/button/`) — multiple variants and sizes
- **`<Tag>`** (`web/src/shared/components/badge/Tag.tsx`) — tag chip with optional `onRemove` (perfect for skills tags)
- **`<Tooltip>`** (`web/src/shared/components/tooltip/Tooltip.tsx`) — Floating UI-based, configurable delay (reusable for experience guide hints)
- **`<Popover>`** (`web/src/shared/components/tooltip/Popover.tsx`) — click-based popover
- **`<Toast>`** system via `useToastStore`
- **`<Tabs>`** (`web/src/shared/components/tabs/`) — compound component with List/Tab/Panel

**Missing (needs to be built):**
- **Accordion component** — no reusable accordion exists. The closest is an inline accordion in `FAQ.tsx` (landing page) using CSS grid animation. A proper `Accordion` component should be built in shared components.

#### 6. Existing Skills in Profile

- Stored as free text string (`skills String?` on Profile model)
- Currently edited via a plain `<Input>` in `ProfileEditorCard` (line 207-218 of ProfileEditorCard.tsx)
- The Phase 2 requirement ("free text with tags") means: user types skill → it becomes a tag chip → stored as comma-separated text (or JSON array)
- `Tag` component already exists with `onRemove` for the visual tag display

---

### Affected Areas

- `server/prisma/schema.prisma` — Add `phone` and `portfolio` fields to Profile model
- `shared/src/schemas.ts` — Add `phone` and `portfolio` to `profileSchema` and `profileUpdateSchema`
- `server/src/profile/profile.service.ts` — Explicit mapper (`toProfileDTO`) needs new fields; Potentially needs phone/portfolio handling
- `server/src/cv/cv.service.ts` — The `buildCVPrompt` reads profile.skills for generation (already works)
- `web/src/features/settings/SettingsFeature.tsx` — Major restructure: replace 4 Cards with accordion sections
- `web/src/features/settings/pages/SettingsPage.tsx` — May need new layout
- `web/src/features/settings/components/ProfileEditorCard.tsx` — Will be replaced by individual section components
- `web/src/features/settings/hooks/useSettings.ts` — May need to integrate experience/education queries
- `web/src/features/settings/api/validation.ts` — Add phone/portfolio to schemas
- `web/src/features/cv/hooks/useExperience.ts` — Reuse as-is, or re-query-key for Settings scope
- `web/src/features/cv/hooks/useEducation.ts` — Same
- `web/src/features/cv/api/cv-repository.ts` — Reuse as-is
- `web/src/shared/components/` — New `Accordion` component to be added
- `web/src/features/cv/pages/ExperienceManagerPage.tsx` — Extract reusable form (Card + inline form patterns)
- `web/src/features/cv/pages/EducationManagerPage.tsx` — Same
- `web/src/core/router.tsx` — Drop CV experience/education routes if they move into Settings

---

### Approaches

1. **Accordion: Build custom `Accordion` component in shared** — single-open, animated, accessible (ARIA)
   - Pros: Reusable across the app, matches existing design system, accessible
   - Cons: Effort to build from scratch (though small)
   - Effort: Low (can reference FAQ pattern, extract to reusable component)

2. **Section data fetching: Reuse existing `useExperience`/`useEducation` hooks directly in Settings**
   - Pros: Zero new API code, hooks already tested, query cache shared with CV pages
   - Cons: Settings currently has a single `useSettings` hook — would need to compose multiple hooks
   - Effort: Low (simple composition in the feature component)

3. **Settings layout: Restructure `SettingsFeature` to use Accordion sections instead of numbered Cards**
   - A) Full replacement: New `CVHubFeature` component — clean slate
   - B) In-place evolution: Modify `SettingsFeature` to wrap existing section content in Accordion
   - Effort: Medium

4. **Skills input: Text input + Tag display for comma-separated skills**
   - Store as string (existing model), parse to array for tag display, join back on save
   - Tag component already exists — needs wrapper component for input + tag list
   - Effort: Low

5. **Contact fields: Add `phone` and `portfolio` to Prisma + Zod + UI**
   - Effort: Low (straightforward field addition, 4 layers)

---

### Recommendation

**Replace the Settings page content with an accordion CV Hub** rather than creating a new route. The current Settings sections (Account, Appearance, Data) can remain as accordion items alongside the CV-specific sections. This avoids routing changes and keeps everything in one page.

Specific recommendations:

1. **Build `Accordion` shared component** (low effort, ~100 lines) — single-expand, CSS grid animation (already proven in FAQ), accessible
2. **Add `phone` + `portfolio` to Profile** across Prisma → Zod → form layers (trivial)
3. **Create 4 section components under `settings/components/`**:
   - `EducationSection.tsx` — adapt patterns from `EducationManagerPage` (inline form, card list, useEducation)
   - `ExperienceSection.tsx` — same, from `ExperienceManagerPage`
   - `SkillsSection.tsx` — text input + Tag component → comma-separated string
   - `ContactSection.tsx` — Phone, Email (readonly), Portfolio, LinkedIn, GitHub fields (some already exist on Profile)
4. **Restructure `SettingsFeature.tsx`** to render accordion sections wrapping existing Account/Appearance/Data + new CV sections
5. **Keep existing CV manager pages as-is** (they still work as standalone routes) or redirect them to Settings
6. **Update server Prisma + Zod schemas** for `phone` and `portfolio` fields

### Risks

- **Existing CV pages vs Settings duplication**: If both routes remain, users could edit experience in both places with potential confusion. Recommend keeping CV manager pages as standalone routes OR redirecting to Settings.
- **Query key clash**: Settings uses `["settings", "profile", userId]` while CV uses `["cv", "experience"]`. No clash, but experience/education state will be fetched twice if both pages are open. Acceptable since React Query deduplicates.
- **ProfileEditorCard deprecation**: The existing "04 Perfil Profesional" card has overlapping fields (skills, LinkedIn, GitHub) with the new CV Hub sections. Must migrate data carefully.
- **Migration for existing users**: Profile data (skills, LinkedIn, etc.) is already on Profile model — no data loss. The new phone/portfolio fields will start as null.

### Ready for Proposal

**Yes** — the codebase is well-structured for this. The server endpoints and hooks for experience/education are complete and tested. The main work is UI composition: building the Accordion component, creating section wrappers, and restructuring the Settings page.
