# Tasks: P7 Architecture Reorg + E2E/Security

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~3,400 (across 6 phases) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1: Phase 1 (Auth split) — PR 2: Phases 2+3+4 (File reorg) — PR 3: Phase 5+7 (Aliases+Docs) — PR 4: Phase 6 (E2E+Security) |
| Delivery strategy | ask-always |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Auth State Separation | PR 1 | Highest risk, isolated, testable independently |
| 2 | File Reorganization + Cleanup | PR 2 | Phases 2+3+4 — mechanical moves with barrel safety |
| 3 | Path Aliases + Docs | PR 3 | Depends on final directory structure |
| 4 | E2E + Security + Logging | PR 4 | Server changes + Playwright tests, independent of frontend reorg |

## Phase 1: Auth State Separation (~640 lines)

- [ ] 1.1 Create `features/auth/api/useSession.ts` — React Query `useQuery` for GET /api/auth/me
- [ ] 1.2 Create `features/auth/api/useLogin.ts` — React Query `useMutation` for POST /api/auth/login
- [ ] 1.3 Create `features/auth/api/useRegister.ts` — React Query `useMutation` for POST /api/auth/register
- [ ] 1.4 Create `features/auth/api/useLogout.ts` — React Query mutation, clears session cache on success
- [ ] 1.5 Create `features/auth/store/auth-status.ts` — Zustand slice: `{ status: AuthStatus }` only
- [ ] 1.6 Rewrite `features/auth/AuthProvider.tsx` — thin sync layer via `useSession()`, remove legacy client path
- [ ] 1.7 Update `features/auth/ProtectedRoute.tsx` — redirect on `useSession().data === null`
- [ ] 1.8 Update `features/auth/PublicAuthRoute.tsx` — redirect on `useSession().data !== null`
- [ ] 1.9 Update SignInForm, SignUpForm, LogoutButton — use React Query mutations
- [ ] 1.10 Update barrel `features/auth/index.ts` — re-export new hooks
- [ ] 1.11 Delete `auth/auth-store.ts` — full replacement, no dual-write period
- [ ] 1.12 Update `core/api-client.ts` — 401 interceptor uses `queryClient.setQueryData` + `useAuthStatus`
- [ ] 1.13 Run all existing auth tests; update test wrappers to use MSW + QueryClientProvider
- [ ] 1.14 Verify: `pnpm --filter @nexus-talent/web test` passes

## Phase 2: lib/ Unbundling (~1,200 lines) ✅

- [x] 2.1 Move AI files (ai-client, ai-orchestrator, ai-provider, ai-errors, retry-strategy, github-client) to `features/analysis/api/`
- [x] 2.2 Move mappers (mappers/job-analysis, mappers/index) to `features/analysis/api/mappers/`
- [x] 2.3 Move analysis repos + HTTP repos to `features/analysis/api/`
- [x] 2.4 Move analysis validation to `features/analysis/api/validation.ts`
- [x] 2.5 Move history validation to `features/history/api/validation.ts`
- [x] 2.6 Rewrite profile-repository.ts → `features/settings/api/` — HTTP-only via Axios, no Supabase
- [x] 2.7 Rewrite settings-repository.ts → `features/settings/api/` — HTTP-only via Axios, no Supabase
- [x] 2.8 Move profile/settings validation to `features/settings/api/`
- [x] 2.9 Move query-client, error-mapper, logger, toast, theme to `core/`
- [x] 2.10 Move cn.ts to `shared/utils/cn.ts`
- [x] 2.11 Create barrel re-exports at old lib/ paths for migration safety
- [x] 2.12 Update all imports across codebase referencing old lib/ paths
- [x] 2.13 Run `pnpm lint -- --fix` and verify build

## Phase 3: Page Moves (~500 lines) ✅

- [x] 3.1 Move AnalysisPage to `features/analysis/pages/`
- [x] 3.2 Move HistoryPage + HistoryDetailPage to `features/history/pages/`
- [x] 3.3 Move SettingsPage to `features/settings/pages/`
- [x] 3.4 Move PrivacyPage to `features/landing/pages/`
- [x] 3.5 Move NotFoundPage to `shared/pages/`
- [x] 3.6 Delete pages/LandingPage.tsx (duplicate of features/landing/pages/LandingPage.tsx)
- [x] 3.7 Move components/ui/* (15 files) to `shared/components/`
- [x] 3.8 Move ErrorBoundary + test to `core/components/`
- [x] 3.9 Delete components/landing/ (10 stale duplicate files)
- [x] 3.10 Delete unused ui/Footer.tsx, ui/Hero.tsx
- [x] 3.11 Move AppLayout to `shared/layouts/`
- [x] 3.12 Move AppRouter to `core/router.tsx`, update all page import paths
- [x] 3.13 Move schemas/job-analysis.ts to `features/analysis/schemas/`
- [x] 3.14 Delete empty pages/, components/, router/, layouts/, schemas/ directories

## Phase 4: Legacy Cleanup (~200 lines) ✅

- [x] 4.1 Delete lib/supabase/ (3 files)
- [x] 4.2 `grep -r "supabase" web/src/` — zero imports (only data strings/comments remain)
- [x] 4.3 Remove localStorage fallback calls from all repository files (repositories are now HTTP-only)
- [x] 4.4 Remove barrel re-exports at old lib/ paths (created in Phase 2)
- [x] 4.5 Run full test suite to confirm no broken imports

## Phase 5: Path Aliases + Docs (~250 lines)

- [x] 5.1 Update `vite.config.ts` — add `resolve.alias` for `@/`, `@/core`, `@/shared`, `@/features`, `@/test`
- [x] 5.2 Update `tsconfig.app.json` — add `paths` mapping matching aliases
- [x] 5.3 Replace all relative `../../` imports with `@/features/`, `@/shared/`, `@/core/` aliases
- [x] 5.4 Verify `pnpm --filter @nexus-talent/web build` succeeds
- [x] 5.5 Write `web/ARCHITECTURE.md` — folder conventions, path alias reference, screaming architecture guide

## Phase 6: E2E + Security + Logging (~600 lines)

- [x] 6.1 Configure Playwright: ephemeral SQLite via `DATABASE_URL=file:./test.db`, globalSetup with prisma migrate
- [x] 6.2 Write auth E2E: signup.spec.ts, login.spec.ts, logout.spec.ts
- [x] 6.3 Write analysis E2E: submit.spec.ts, validation.spec.ts
- [x] 6.4 Write history E2E: list.spec.ts, delete.spec.ts
- [x] 6.5 Add custom security headers middleware to `server/src/infra/app.ts` — CSP + X-Frame-Options + X-Content-Type-Options + Referrer-Policy (manual, no `helmet` dependency)
- [x] 6.6 Update analysis rate limit in `analysis.router.ts` from max:20 to max:10 per spec
- [x] 6.7 Add pino-http request logging middleware to `app.ts`
- [x] 6.8 Add auth event logging to `auth.controller.ts` (login_success, login_failure, register, logout)
- [x] 6.9 Add analysis request logging to `analysis.controller.ts` (analysis_request with userId + inputLength)
- [x] 6.10 Verify: `pnpm --filter @nexus-talent/e2e test` passes (all 8 tests)
- [x] 6.11 Verify: `curl -I` shows all security headers on every response
