# Proposal: P15 — Settings Backend

## Intent

Add per-user settings persistence (theme, notifications), OAuth identity linking, and configurable rate limits. Currently theme is localStorage-only, OAuth linking is stubbed with `ACCOUNT_LINKING_AVAILABLE=false`, and rate limiting is fixed IP-based with no per-user tiers.

## Scope

### In Scope
- New `UserSettings` table (1:1 with Profile) via Prisma migration + seed defaults
- GET/PUT `/api/settings` endpoints for user preferences
- OAuth linking via `?link=true` on existing Google flow
- Frontend `useAppSettings` hook (separate from `useSettings`)
- Theme persistence sync (localStorage → server on change)
- Notification preference model (email digest, analysis-complete)
- Per-user rate limit tier configuration

### Out of Scope
- LinkedIn OAuth provider (deferred)
- Admin override of per-user settings (global Settings stays admin-only)
- Notification delivery infrastructure (email/SMS senders)
- Settings UI redesign — uses existing SettingsPage cards

## Capabilities

### New Capabilities
- `user-settings`: Per-user preferences CRUD — theme, notifications, rate-limit tier
- `oauth-linking`: Explicit Google account link/unlink through existing OAuth flow

### Modified Capabilities
- `auth`: OAuth callback supports `?link=true` to associate Google identity with current session user
- `ai-proxy`: Rate limiter checks per-user `rateLimitTier` before falling back to IP-based defaults

## Approach

1. **Prisma**: Add `UserSettings` table (`userId` PK/FK → Profile.id, `theme`, `notifications` JSON, `rateLimitTier`, `createdAt`, `updatedAt`)
2. **Server**: New `settings/` domain controller + service + router; `GET /api/settings` returns defaults if no row, `PUT /api/settings` upserts with Zod validation
3. **OAuth linking**: `googleLogin` accepts `?link=true`, passed through state cookie; callback detects linking mode, calls `oauthService.linkIdentity()` instead of `findOrCreateGoogleUser()`
4. **Rate limit**: `rate-limiter.ts` accepts optional `userId`; middleware queries `UserSettings.rateLimitTier` if present
5. **Frontend**: `useAppSettings` hook — theme change writes to API, reads from server on mount, localStorage as offline cache

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `server/prisma/schema.prisma` | New | `UserSettings` model added |
| `server/src/settings/` | New | Controller, service, router for user settings |
| `server/src/auth/auth.controller.ts` | Modified | OAuth linking mode on `googleLogin`/`googleCallback` |
| `server/src/auth/oauth.service.ts` | Modified | `linkIdentity()` for explicit account linking |
| `server/src/infra/rate-limiter.ts` | Modified | Per-user tier resolution |
| `server/src/infra/app.ts` | Modified | Wire settings router |
| `web/src/features/settings/hooks/` | New | `useAppSettings` hook |
| `web/src/core/theme.tsx` | Modified | Sync theme to server on change |
| `shared/contracts/` | New | `userSettingsSchema`, `oauthLinkSchema` |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| OAuth link flow breaks existing login | Low | Linking only when `?link=true` passed; default path unchanged |
| Theme flicker on reload if API is slow | Med | localStorage as fast cache, API as background sync |
| Migration rollback complexity | Low | Additive table only, no column drops or data transforms |

## Rollback Plan

- **Prisma**: Drop `UserSettings` table (additive migration)
- **Server**: Remove settings router wiring from `app.ts`, revert OAuth link logic
- **Frontend**: Revert `theme.tsx` to localStorage-only, remove `useAppSettings`

## Dependencies

- Prisma migration tooling
- Existing Google OAuth credentials (no new provider setup)

## Success Criteria

- [ ] GET `/api/settings` returns per-user preferences (or defaults)
- [ ] PUT `/api/settings` persists changes across page reloads
- [ ] OAuth `?link=true` links Google account to existing session user
- [ ] OAuth `?link=true` without session returns 401
- [ ] Rate limiter respects per-user `rateLimitTier` when set
- [ ] Theme value persists across devices after change
