# Tasks: Phase 2 — CV Hub in Settings

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~830 (across 3 PRs: ~233 + ~360 + ~240) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 Foundation → PR 2 Sections + Integration → PR 3 CRUD |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Foundation: Accordion + data model | PR 1 | ~233 lines, base=develop |
| 2 | Contact + Skills + Settings restructure | PR 2 | ~360 lines, base=develop |
| 3 | Experience + Education | PR 3 | ~240 lines, base=develop |

## Phase 1: Foundation

- [ ] 1.1 Create `web/src/shared/components/accordion/Accordion.tsx` — compound pattern (Root context + Item + Trigger + Content), CSS grid animation (`grid-template-rows: 0fr/1fr`), ARIA (`aria-expanded`, `aria-controls`, `role=region`), keyboard (Enter/Space)
- [ ] 1.2 Write `web/src/shared/components/accordion/Accordion.test.tsx` — expand/collapse, single-expand, defaultOpen, keyboard ARIA, Enter/Space on Trigger
- [ ] 1.3 Add `phone String?` + `portfolioUrl String?` to model Profile in `server/prisma/schema.prisma`, generate migration with `pnpm run prisma:migrate`
- [ ] 1.4 Add `phone: z.string().nullable()` + `portfolioUrl: z.string().url().nullable().or(z.literal(""))` to `profileSchema` and corresponding optional fields to `profileUpdateSchema` in `shared/src/schemas.ts`
- [ ] 1.5 Map `phone` + `portfolioUrl` in `server/src/profile/profile.service.ts` — add to `toProfileDTO` param type + return object
- [ ] 1.6 Add `phone` + `portfolioUrl` (snake_case) to `PROFILE_RECORD_SCHEMA` and (camelCase) to `PROFILE_SAVE_INPUT_SCHEMA` in `web/src/features/settings/api/validation.ts`

## Phase 2: Section Components (Contact + Skills)

- [ ] 2.1 Create `web/src/features/settings/components/ContactSection.tsx` — 5-field form (email readonly, phone, portfolioUrl, linkedinUrl, githubUrl), `useForm<ProfileUpdateDTO>` + zodResolver(profileUpdateSchema), save via `useSettings().saveProfile`, 4 UX states (loading skeleton, populated form, save-pending spinner, error toast), toast on success/error
- [ ] 2.2 Create `web/src/features/settings/components/SkillsSection.tsx` — controlled input + Tag display (reuse existing `Tag` from `@/shared/components/badge/Tag`), parse CSV on input change (split/trim/filter), save as `tags.join(", ")` via `useSettings().saveProfile`

## Phase 3: CRUD Sections

- [ ] 3.1 Create `web/src/features/settings/components/ExperienceSection.tsx` — inline CRUD list using `useExperience()`, 6-field form (company, role, startDate, endDate, description, location), native `<input type="date">`, confirm delete, help text + tooltip on date fields ("Formato: YYYY-MM-DD"), loading/empty states
- [ ] 3.2 Create `web/src/features/settings/components/EducationSection.tsx` — inline CRUD list using `useEducation()`, 6-field form (institution, degree, field, startDate, endDate, description), same pattern as ExperienceSection, confirm delete, help text + date tooltips

## Phase 4: Integration

- [ ] 4.1 Restructure `web/src/features/settings/SettingsFeature.tsx` — replace 4 Card wrappers with `Accordion.Root`/`Item`/`Trigger`/`Content`, import 4 new sections, remove `ProfileEditorCard` import + usage, Account (01) stays defaultOpen
- [ ] 4.2 Update `web/src/features/settings/SettingsFeature.test.tsx` — replace Card-number assertions with Accordion section assertions, verify all 7 sections render, remove ProfileEditorCard references

## Phase 5: Verification

- [ ] 5.1 `pnpm test` (server + web) — all pass
- [ ] 5.2 `tsc --noEmit` — zero type errors
- [ ] 5.3 Manual smoke — Settings loads, accordion expand/collapse works, Contact/Skills save round-trip, Experience/Education create/edit/delete, CV manager pages at `/app/cv/*` unaffected
