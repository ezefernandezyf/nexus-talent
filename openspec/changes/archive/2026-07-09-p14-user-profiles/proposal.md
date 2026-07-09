# Proposal: P14 — User Profiles

## Intent

Add professional profile fields (skills, experience, role, resume, LinkedIn, GitHub, location) to the user record so the AI analysis can generate personalized outreach messages that reference the applicant's actual background instead of a generic template. The profile lives in Settings as a 4th card, not a separate route.

## Scope

### In Scope
- DB: 7 nullable string fields on `Profile` model (skills, experienceLevel, roleTitle, resumeLink, linkedinUrl, githubUrl, location)
- Shared: `profileUpdateSchema` (Zod) + expanded `profileSchema` response DTO
- Server: PUT `/api/profile` with Zod validation replacing inline typeof check
- Frontend: Profile card in Settings using React Hook Form + `@hookform/resolvers/zod`
- Prompt enrichment: controller fetches profile, passes context to `analysis.service.ts` → Groq system prompt includes applicant's skills/role/experience
- Tests: server unit tests for profile service + router, web tests for Profile form card

### Out of Scope
- Avatar upload (Cloudinary integration deferred to P15)
- LinkedIn scraping/OAuth
- Separate `/app/profile` route (profile stays in Settings)
- Profile picture field (use existing `avatarUrl`)

## Capabilities

### New Capabilities
- `profile-fields`: Enriched profile with professional identity fields; update via Zod-validated PUT
- `profile-editor`: Profile card form in Settings using RHF + Zod resolver

### Modified Capabilities
- `ai-proxy`: `analysis.service.ts` accepts profile context to personalize Groq prompts
- `shared-contracts`: `profileSchema` extended, `profileUpdateSchema` added

## Approach

**Layer 1 — DB + Contracts**: Prisma migration adds 7 columns to `Profile` (all `String?`). Shared package gets `profileUpdateSchema` and expanded `profileSchema`. Server-side Zod validation replaces inline typeof check.

**Layer 2 — Server**: `profile.service.ts` `updateProfile()` reads/writes all new fields. `analysis.controller.ts` calls `profileService.getProfileByUserId()` before analysis, passes profile context to `analyze()`. `buildGroqMessages()` appends a "Sobre el postulante" section when profile data exists.

**Layer 3 — Frontend**: New `ProfileEditorCard` component (4th Settings card) with RHF + `@hookform/resolvers/zod`. Reuses existing `Input`, `Label`, `Button`, `Badge` primitives. Skeleton states for loading. Existing Account card unchanged.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `server/prisma/schema.prisma` | Modified | +7 fields on Profile |
| `shared/src/schemas.ts` | Modified | +profileUpdateSchema, expanded profileSchema |
| `server/src/profile/*` | Modified | PUT with Zod, full-field update |
| `server/src/analysis/analysis.service.ts` | Modified | Accept profile context for prompt enrichment |
| `server/src/analysis/analysis.controller.ts` | Modified | Fetch profile before analysis |
| `web/src/features/settings/` | New + Modified | +ProfileEditorCard, wire into SettingsFeature |
| `web/src/features/settings/api/validation.ts` | Modified | Expanded validation schemas |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Groq prompt grows beyond effective context window | Low | Profile context ~200 chars max; trim if needed |
| Migration on existing rows with NULL defaults safe | Low | All new columns are nullable — no data loss |
| RHF + Zod adoption adds bundle weight (~12KB gzip) | Low | Already installed; tree-shaken by Vite |

## Rollback Plan

Revert migration (`prisma migrate dev --name rollback-p14`), revert shared schema changes, remove Profile card from Settings. Profile GET endpoint remains backward-compatible (new fields are optional).

## Dependencies

- Existing RHF + `@hookform/resolvers` already in `web/package.json` (P11quin)
- `GROQ_API_KEY` env var (unchanged)
- `requireAuth` middleware on `/api/profile` (unchanged)

## Success Criteria

- [ ] `PUT /api/profile` accepts skills, experience, role, resume, linkedin, github, location and validates via Zod
- [ ] `GET /api/profile` returns all 7 new fields
- [ ] Profile card renders in Settings with RHF form, saves successfully
- [ ] Analysis results include applicant-specific language when profile is populated
- [ ] `pnpm test` passes (server + web), typecheck clean
- [ ] Existing settings page (Account, Appearance, Data) unchanged
