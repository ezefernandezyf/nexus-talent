# Tasks: P5 — Frontend Refactor

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~500–650 across 4 PRs |
| 400-line budget risk | Low (each PR under budget) |
| Chained PRs recommended | Yes |
| Suggested split | PR #1 (Auth) → PR #2 (API Client) → PR #3 (Admin) → PR #4 (Pagination) |
| Delivery strategy | Chained PRs |
| Chain strategy | feature-branch-chain |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Auth: Zustand store + AuthProvider rewrite + guard/forms migration | PR #1 | Base=`feat/p5-frontend-refactor` — no Supabase auth in components |
| 2 | API client: Axios instance + repo swap + localStorage removal | PR #2 | Base=PR #1 branch — all CRUD through HTTP |
| 3 | Admin cleanup: delete AdminRoute + isAdmin dead code | PR #3 | Base=PR #2 branch — route + component removal |
| 4 | History pagination: backend params + UI update | PR #4 | Base=PR #3 branch — server-driven pagination |

## PR #1 — Slice A: Auth (targets `feat/p5-frontend-refactor`)

- [ ] 1.1 **Create `web/src/auth/auth-store.ts`** — Zustand store: `user`, `status` (unknown/loading/authenticated/unauthenticated), `restoreSession()`, `login()`, `register()`, `logout()`, `clearSession()`. ~40 LOC. Deps: none. Verify: `pnpm lint && pnpm -F web test -- --run src/auth/`
- [ ] 1.2 **Rewrite `AuthProvider.tsx`** — remove Supabase SDK, read from Zustand store, expose same `useAuth()` minus `isAdmin`/`linkIdentity`/`unlinkIdentity`. ~90 LOC. Deps: 1.1. Verify: AuthProvider tests pass.
- [ ] 1.3 **Modify `hooks/useAuth.ts`** — re-export store types, drop Supabase imports. ~5 LOC. Deps: 1.2. Verify: `pnpm tsc --noEmit -p web/tsconfig.json`
- [ ] 1.4 **Rewrite `AuthCallbackPage.tsx`** — call `authStore.restoreSession()` (GET /api/auth/me) after OAuth redirect. ~15 LOC. Deps: 1.1. Verify: callback renders without Supabase.
- [ ] 1.5 **Update `SignInForm.tsx`** — replace `supabase.signInWithPassword` with `authStore.login()`. ~10 LOC. Deps: 1.1. Verify: SignInForm tests pass.
- [ ] 1.6 **Update `SignUpForm.tsx`** — replace `supabase.signUp` with `authStore.register()`. ~10 LOC. Deps: 1.1. Verify: SignUpForm tests pass.
- [ ] 1.7 **Update `ProtectedRoute.tsx`** — read status from Zustand store. ~15 LOC. Deps: 1.2. Verify: guard tests pass.
- [ ] 1.8 **Update `PublicAuthRoute.tsx`** — read status from Zustand store. ~10 LOC. Deps: 1.2. Verify: guard tests pass.
- [ ] 1.9 **Update `features/auth/index.ts`** — export store. ~2 LOC. Deps: 1.1. Verify: imports resolve.
- [ ] 1.10 **Update test files** — AuthProvider, ProtectedRoute, SignInForm, SignUpForm mocks from AuthClientLike → Zustand mocks. ~60 LOC. Deps: 1.2-1.8. Verify: `pnpm -F web test`

## PR #2 — Slice B: API Client + Repo Swap (targets PR #1 branch)

- [ ] 2.1 **Create `web/src/core/api-client.ts`** — Axios instance: `baseURL: "/api"`, `withCredentials: true`, 401 intercept → `authStore.clearSession()` + redirect `/auth/sign-in`. ~35 LOC. Deps: PR #1. Verify: `pnpm lint`
- [ ] 2.2 **Modify `http-analysis-repository.ts`** — replace `fetch()` with `apiClient`. Prep pagination sig. ~70 LOC. Deps: 2.1. Verify: HTTP repo tests pass.
- [ ] 2.3 **Delete `local-analysis-repository.ts`** — remove file. Deps: 2.2. Verify: no remaining imports exist.
- [ ] 2.4 **Delete `local-analysis-repository.test.ts`** — remove test. Deps: 2.3. Verify: `pnpm test`
- [ ] 2.5 **Modify `lib/repositories/index.ts`** — remove `createLocalAnalysisRepository` export. ~3 LOC. Deps: 2.3. Verify: build succeeds.
- [ ] 2.6 **Modify `useAnalysisRepository.ts`** — always return `createHttpAnalysisRepository()`, drop scope logic. ~20 LOC. Deps: 2.2. Verify: analysis hooks test passes.
- [ ] 2.7 **Update test mocks** — Supabase → Axios in affected test files. ~50 LOC. Deps: 2.1. Verify: `pnpm -F web test`

## PR #3 — Slice C: Admin Cleanup (targets PR #2 branch)

- [ ] 3.1 **Delete `AdminRoute.tsx`** — remove file. Deps: PR #2. Verify: no imports remain.
- [ ] 3.2 **Delete `AdminRoute.test.tsx`** — remove test. Deps: 3.1. Verify: `pnpm test`
- [ ] 3.3 **Modify `features/auth/index.ts`** — remove `AdminRoute` export. ~2 LOC. Deps: 3.1. Verify: index compiles.
- [ ] 3.4 **Modify `AppRouter.tsx`** — remove `AdminRoute` import + `/app/admin` route block. ~10 LOC. Deps: 3.1. Verify: `pnpm lint && pnpm test`

## PR #4 — Slice D: History Pagination (targets PR #3 branch)

- [ ] 4.1 **Modify `http-analysis-repository.ts`** — `getAll(page?, limit?)` appends params to URL. ~20 LOC. Deps: PR #3. Verify: repo tests pass.
- [ ] 4.2 **Modify `HistoryFeature.tsx`** — remove client-side `visibleAnalyses` slice, pass `page`/`limit` to hooks, render server `total` page count. ~60 LOC. Deps: 4.1. Verify: history feature tests pass.
- [ ] 4.3 **Update `useAnalysisHistory`** — pass pagination params through to `getAll()`. ~15 LOC. Deps: 4.2. Verify: hook tests pass.
- [ ] 4.4 **Update history test files** — mock paginated response `{ items, total }`. ~30 LOC. Deps: 4.2-4.3. Verify: `pnpm -F web test`
