# Tasks: P15 — Settings Backend

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~580–650 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1: Settings Module → PR 2: OAuth Linking → PR 3: Rate Limiter → PR 4: Frontend |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Prisma + Shared + Settings server | PR 1 | Base: develop; service, router, app wiring, tests included |
| 2 | OAuth linking + unlink + callback | PR 2 | Base: PR 1 branch; depends on completed settings module |
| 3 | Rate limiter per-user tiers | PR 3 | Base: PR 2 branch; depends on settings service |
| 4 | Frontend useAppSettings + theme sync | PR 4 | Base: PR 3 branch; depends on all server endpoints |

## Phase 1: Foundation — Prisma + Shared Schemas

- [x] 1.1 Add `UserSettings` model to `server/prisma/schema.prisma` (userId PK/FK → Profile, theme, emailDigest, rateLimitTier, createdAt, updatedAt)
- [x] 1.2 Run `pnpm exec prisma migrate dev --name add_user_settings`
- [x] 1.3 Add `userSettingsSchema`, `userSettingsUpdateSchema`, types to `shared/src/schemas.ts`
- [x] 1.4 Export new schemas + types from `shared/src/index.ts`

## Phase 2: Settings Server Module

- [x] 2.1 Create `server/src/settings/settings.service.ts` — `getOrCreate(userId)` + `upsert(userId, data)`
- [x] 2.2 Create `server/src/settings/settings.router.ts` — GET `/` (requireAuth), PUT `/` (requireAuth + validate)
- [x] 2.3 Register `settingsRouter` at `/api/settings` in `server/src/infra/app.ts`
- [x] 2.4 Create `server/src/settings/settings.router.test.ts` — 401, 200 auto-create, partial update, 400 on bad enum

## Phase 3: OAuth Linking

- [x] 3.1 Modify `auth.router.ts` — inject `requireAuth` before `googleLogin` when `?link=true`
- [x] 3.2 Modify `auth.controller.ts` `googleLogin` — encode `link:` prefix in state cookie
- [x] 3.3 Add `linkIdentity(code, userId)` to `oauth.service.ts` — exchange code, update Profile.googleId + avatarUrl
- [x] 3.4 Modify `googleCallback` — detect `link:` state prefix, call `linkIdentity`, redirect to `/app/settings?linked=google`
- [x] 3.5 Add `DELETE /api/auth/oauth/google` to `auth.router.ts` — requireAuth, clear googleId, 200 idempotent
- [x] 3.6 Update `google-callback.test.ts` — link mode calls linkIdentity, redirects to settings

## Phase 4: Rate Limiter per-User Tiers

- [x] 4.1 Add `TIER_LIMITS` map + `IP_FALLBACK` to `rate-limiter.ts`
- [x] 4.2 Add `getUserRateLimitTier(userId)` to `settings.service.ts` (already existed as `getRateLimitTier`)
- [x] 4.3 Extend rate-limiter key resolution — auth'd with tier → `${userId}:${tier}`, else IP
- [x] 4.4 Modify `analysis.router.ts` to pass `getTier: getRateLimitTier` to rate limiter
- [x] 4.5 Write rate-limiter test — per-user key, tier resolution, IP fallback (18 tests)

## Phase 5: Frontend + OAuth UI Enable

- [x] 5.1 Create `web/src/features/settings/hooks/useAppSettings.ts` — React Query fetch/sync, localStorage cache
- [x] 5.2 Add theme API sync in `ThemeProvider` — on theme change, call background `syncSettings({ theme })`
- [x] 5.3 Set `ACCOUNT_LINKING_AVAILABLE = true` in `useSettings.ts`
- [x] 5.4 Write test for `useAppSettings` — localStorage fallback, API sync on theme change, authenticated guard
