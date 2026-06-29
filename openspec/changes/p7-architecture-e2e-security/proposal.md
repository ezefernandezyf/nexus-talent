# Proposal: P7 Architecture Reorg + E2E/Security

## Intent

The frontend (`web/src/`) does NOT scream its architecture - auth is split across `auth/` and `features/auth/`, pages live in both `pages/` and `features/{domain}/pages/`, `lib/` is a 22-file grab-bag mixing infra, AI clients, repos, Supabase legacy, and validation. The Zustand `auth-store.ts` holds server state (user, session) when it should hold only UI state. This makes E2E testing brittle and security hardening harder. Fix the architecture FIRST, then deliver the remaining P7 tasks (E2E, security, rate limiting, logging, sanitization).

## Scope

### In Scope
- **Architecture reorg**: auth store split (React Query + Zustand UI slice), `lib/` unbundling to feature domains, page moves from `pages/` → `features/{domain}/pages/`, `components/landing/` stale copy deletion, `core/` population with infra modules
- **Legacy cleanup (P5 completion)**: remove `lib/supabase/`, remove localStorage fallbacks in profile/settings repositories, switch all repositories to HTTP API via Axios
- **Path aliases**: `@/features/auth`, `@/shared/ui`, `@/core` in `vite.config.ts` + `tsconfig.json`
- **Documentation**: new standard for future devs (file structure doc)
- **P7 E2E**: Playwright smokes for auth (login/register/logout), analysis (run + view), history (view + delete)
- **P7 Security**: CSP + X-Frame-Options + X-Content-Type-Options + Referrer-Policy via Helmet, rate limiting on analysis routes, pino request logging middleware, input sanitization at Zod validation layer

### Out of Scope
- No new features (analysis, history, auth behavior unchanged)
- No backend restructuring (server screaming architecture is already clean)
- No database changes (Prisma schema untouched)
- No design system overhaul (design tokens, shared UI components stay - only relocate)
- No auth pages redesign (deferred to P8 Polish)
- No analysis/history/settings alignment to design system (P8)

## Capabilities

### New Capabilities
- `e2e-smoke-tests`: Playwright smoke test suite for auth, analysis, and history flows
- `security-hardening`: HTTP security headers (CSP, X-Frame-Options, etc.) + rate limiting + input sanitization
- `server-logging`: Structured request logging via pino middleware

### Modified Capabilities
- `auth-client`: REQ-AUTH-001 changes - Zustand store splits into React Query `useSession()` hook + thin Zustand `auth-status` slice. REQ-AUTH-002 updates - AuthProvider simplified to sync React Query session. REQ-AUTH-003/004 - login/register/logout become React Query mutations that invalidate session cache. Auth flow behavior preserved externally.

## Approach

Six sequential phases:

1. **Auth store split**: Extract `user` + session to React Query `useSession()`, keep only `status` in Zustand `auth-status.ts`. AuthProvider becomes thin sync layer. Feature branch isolation - merge only when all tests pass.
2. **`lib/` unbundling**: Move each file to its domain (`features/{domain}/api/`), infra files to `core/`, `cn.ts` to `shared/utils/`. Update all imports.
3. **Page moves**: Move `pages/AnalysisPage.tsx` → `features/analysis/pages/`, same for history, settings. Delete `pages/LandingPage.tsx` (duplicate). Move `PrivacyPage.tsx` → `features/landing/pages/`, `NotFoundPage.tsx` → `shared/pages/`.
4. **Legacy cleanup (P5)**: Delete `lib/supabase/`. Refactor `profile-repository.ts` + `settings-repository.ts` to use HTTP API (Axios) exclusively. Remove all `.env` Supabase vars.
5. **Path aliases + docs**: Configure `vite.config.ts` + `tsconfig.json` aliases. Write file-structure standard doc.
6. **P7 delivery**: E2E Playwright smokes, security headers, rate limiting, pino logging, input sanitization.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `web/src/auth/auth-store.ts` | Removed | Split into React Query (session) + Zustand (status) |
| `web/src/features/auth/` | Modified | New `api/useSession.ts`, `store/auth-status.ts`, updated `AuthProvider.tsx` |
| `web/src/lib/` | Removed | 22 files rehomed to features, core, shared |
| `web/src/pages/` | Removed | 7 pages moved to feature domains |
| `web/src/components/` | Removed | landing/ deleted, ui/ → shared/components/, ErrorBoundary → core/ |
| `web/src/core/` | Expanded | api-client + query-client + error-mapper + logger + toast + theme + ErrorBoundary |
| `web/src/shared/` | New | shared utils + truly generic UI components |
| `web/src/router/AppRouter.tsx` | Modified | Import paths update for pages |
| `web/vite.config.ts` | Modified | Add path aliases |
| `web/tsconfig.json` | Modified | Add path alias resolution |
| `server/src/infra/app.ts` | Modified | Helmet config, pino middleware |
| `server/src/analysis/analysis.router.ts` | Modified | Rate limiting |
| `server/src/infra/rate-limiter.ts` | Modified | Extend to analysis routes |
| `e2e/` | Modified | Smoke tests for auth, analysis, history |
| Total: ~60 files moved/deleted, ~15 modified | | |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Auth store split breaks protected pages | High | Feature branch isolation. Keep same public API from `features/auth/index.ts` - consuming components see no API change. Rollback = delete branch. |
| File move cascade breaks imports | Medium | Update barrel exports per feature. Run `pnpm run lint -- --fix` after each phase. |
| Missed Supabase import | Medium | `grep -r supabase web/src/` after cleanup phase. Block merge on any survivor. |
| Duplicate landing component confusion | Low | Delete `components/landing/` entirely. Active copy is in `features/landing/components/`. |
| E2E tests flaky with Playwright | Low | Ephemeral SQLite per run. Isolated test DB. |

## Rollback Plan

Two-tier rollback:

1. **Auth split failure**: Delete the feature branch. Restore `auth-store.ts` from `develop`. Zero impact to mainline.
2. **File moves cause regression**: Each phase is a separate commit. Revert individual commits via `git revert <hash>`. Barrel re-exports at old locations provide a safety net during development - remove them only at the end after verification.
3. **Full rollback**: `git checkout develop && git branch -D feat/p7-architecture-e2e-security`. All P7 work is in the branch, `develop` untouched.

## Dependencies

- `@playwright/test` in `e2e/` (already configured)
- `helmet` for security headers (server dep)
- `pino` + `pino-http` for request logging (already on server as `pino`)
- All other deps already in `package.json`

## Success Criteria

- [ ] All imports use `@/features/{domain}/`, `@/shared/`, `@/core/` path aliases (zero relative `../../` patterns)
- [ ] Every file lives in a domain folder that screams its purpose
- [ ] Zero `import ... from "@supabase/supabase-js"` in `web/src/`
- [ ] Zustand `auth-status.ts` holds only `status: AuthStatus` - no user, no session, no login/logout
- [ ] React Query `useSession()` is the single source of truth for auth state
- [ ] All existing Vitest tests pass (`pnpm --filter @nexus-talent/web test`)
- [ ] Playwright E2E smokes pass for auth, analysis, history flows
- [ ] CSP and all security headers present on every server response (verify via `curl -I`)
- [ ] Rate limiting active on both auth (5/15min) and analysis (20/1min) routes
- [ ] Pino request logs structured JSON on every request
- [ ] Input sanitization Zod schemas in every feature `api/validation.ts`
- [ ] `components/landing/` and `pages/LandingPage.tsx` no longer exist
