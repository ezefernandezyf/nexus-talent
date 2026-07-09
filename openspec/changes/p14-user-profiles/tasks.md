# Tasks: P14 — User Profiles

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~625 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (DB + Contracts + Server) → PR 2 (Frontend Profile Editor) |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | DB migration + shared schemas + server profile endpoints + AI enrichment + server tests | PR 1 | ~260 lines — base `develop`; all server-side work including analysis pipeline and tests |
| 2 | Frontend ProfileEditorCard + validation + Settings wiring + web tests | PR 2 | ~365 lines — base `develop` or PR 1 (independent of server analysis changes, only depends on shared contracts) |

## Implementation Tasks

### Group 1: DB + Shared Contracts (Foundation)

- [ ] 1.1 **Prisma schema migration** — `server/prisma/schema.prisma`: add 7 nullable `String?` fields (`skills`, `experienceLevel`, `roleTitle`, `resumeLink`, `linkedinUrl`, `githubUrl`, `location`) to `Profile` model. Run `prisma migrate dev --name add_profile_fields`. ~10 lines schema + ~30 auto-generated migration.
- [ ] 1.2 **Expand `profileSchema`** — `shared/src/schemas.ts`: add 7 nullable fields to response schema. URL fields use `z.string().url().nullable().or(z.literal(""))`. ~15 lines.
- [ ] 1.3 **Add `profileUpdateSchema`** — `shared/src/schemas.ts`: new Zod schema, all fields optional, URL validation on URL fields, `skills` requires min 1 char. Export `ProfileUpdateDTO` type. ~20 lines.
- [ ] 1.4 **Export new schemas** — `shared/src/index.ts`: export `profileUpdateSchema` + `ProfileUpdateDTO`. ~5 lines.

### Group 2: Server (Profile Endpoints + AI Enrichment)

- [ ] 2.1 **Refactor `profile.service.ts`** — `server/src/profile/profile.service.ts`: replace `updateDisplayName()` with `updateProfile()` accepting `ProfileUpdateDTO`. Add `toProfileDTO()` helper returning all 10 fields. Update `getProfileByUserId()` to use `toProfileDTO()`. ~25 lines modified.
- [ ] 2.2 **Zod-validated PUT** — `server/src/profile/profile.router.ts`: replace inline `typeof` check with `profileUpdateSchema.safeParse()`. Wire to `updateProfile()` instead of `updateDisplayName()`. ~10 lines modified.
- [ ] 2.3 **Profile fetch in analysis controller** — `server/src/analysis/analysis.controller.ts`: import profile service, call `getProfileByUserId(req.userId!)` before `analyze()`. On failure: log warn, proceed with null context. Add `buildProfileContext()` helper. ~20 lines modified.
- [ ] 2.4 **Profile context in analysis service** — `server/src/analysis/analysis.service.ts`: add `profileContext?: string | null` param to `analyze()`. Inject into `buildGroqMessages()` system prompt when non-null. ~10 lines modified.
- [ ] 2.5 **Server tests — profile service** — new test file for `updateProfile()`: partial update, full update, empty data, 404 on missing user. `toProfileDTO()` maps all fields. ~50 lines.
- [ ] 2.6 **Server tests — profile router** — new test file for PUT: valid Zod input, invalid URL, empty skills, returns 400 with Zod issues. ~40 lines.
- [ ] 2.7 **Server tests — analysis controller** — modify existing: mock profile service, verify `getProfileByUserId()` called before `analyze()`, profile fetch failure → null context, warn log. ~30 lines.

### Group 3: Frontend (Profile Editor)

- [ ] 3.1 **Extend frontend validation schemas** — `web/src/features/settings/api/validation.ts`: add 7 new fields matching shared contracts shape (snake_case for record, camelCase for form). ~20 lines modified.
- [ ] 3.2 **Update profile repository types** — `web/src/features/settings/api/profile-repository.ts`: `ProfileRecord` gains 7 snake_case fields. `save()` sends all fields (Zod strips undefined). `ProfileSaveInput` extended. ~15 lines modified.
- [ ] 3.3 **Create ProfileEditorCard component** — `web/src/features/settings/components/ProfileEditorCard.tsx`: RHF form with `zodResolver(profileUpdateSchema)`. 7 inputs in 2-column grid (role + exp, skills + location, linkedin, github, resume). Skeleton loading state. Error banner. Toast on success. ~180 lines.
- [ ] 3.4 **Wire 4th card into SettingsFeature** — `web/src/features/settings/SettingsFeature.tsx`: add `ProfileEditorCard` after card 03 (Data). Pass profile, loading, and save handler from `useSettings`. ~25 lines modified.
- [ ] 3.5 **Update useSettings hook types** — `web/src/features/settings/hooks/useSettings.ts`: hook signature unchanged — types flow from repository. Verify `saveProfile` signature accepts new fields. ~5 lines modified.
- [ ] 3.6 **ProfileEditorCard tests** — `web/src/features/settings/components/ProfileEditorCard.test.tsx`: renders 7 inputs; skeleton on loading; values on populated; Zod rejection before API call; button shows "Guardando..."; error toast. ~100 lines.
- [ ] 3.7 **Update SettingsFeature tests** — `web/src/features/settings/SettingsFeature.test.tsx`: verify 4th card renders ("Perfil Profesional"), existing 3 cards unchanged. ~10 lines modified.

## Implementation Order

1. **Group 1 first**: DB migration must exist before server or frontend use shared schemas. Prisma client must regenerate before service layer typechecks.
2. **Group 2 second**: Profile service + router are independent of frontend. Analysis enrichment depends on profile service existing.
3. **Group 3 last**: Frontend form depends on shared schemas (for type inference) and the `PUT /api/profile` endpoint. Can run in parallel with Group 2.3–2.4 (AI enrichment) since those are server-only.

## Next Step

Forecast exceeds 400 lines (~625 total). **Decision needed**: user must choose a chain strategy before `sdd-apply` proceeds.
