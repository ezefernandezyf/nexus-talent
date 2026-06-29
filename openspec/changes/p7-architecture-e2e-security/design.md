# Design: P7 Architecture Reorg + E2E/Security

## Technical Approach

Six serial phases: (1) auth split to React Query + Zustand status slice, (2) `lib/` unbundling to feature domains, (3) page consolidation, (4) Supabase/localStorage cleanup, (5) path aliases + docs, (6) E2E smokes + security hardening + pino logging. Each phase is independently testable; barrel re-exports at old paths provide compatibility during migration. Server changes (helmet hardening, rate limits, pino middleware) are applied last - no frontend dependency.

## Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **ADR-1: Screaming Architecture** | `features/{domain}/` with `api/`, `components/`, `pages/`, `store/` per feature | Feature cohesion: all auth code lives together; new devs find everything in one folder. Eliminates `lib/` grab-bag, `pages/` vs `features/{domain}/pages/` split. Path aliases (`@/core`, `@/shared`, `@/features`) replace `../../` imports. |
| **ADR-2: Server vs UI State** | React Query for session/data, Zustand only for ephemeral UI state (`status`, form state) | React Query handles caching, invalidation, deduplication natively. Zustand is overkill for server state - manual cache invalidation leads to stale state. UI-only slices (`auth-status`, analysis viewState) stay in Zustand. |
| **ADR-3: Auth Store Replacement (no coexistence)** | Full replacement: delete `auth/auth-store.ts`, create `features/auth/api/useSession.ts` (React Query) + `features/auth/store/auth-status.ts` (Zustand). No dual-write period. | Coexistence creates two sources of truth for `user` and `status` - race conditions inevitable. Full swap with barrel re-exports at old `features/auth/index.ts` preserves public API. Feature branch isolation; rollback is `git revert`. |
| **ADR-4: Ephemeral SQLite for E2E** | `DATABASE_URL=file:./test.db` per Playwright run, prisma migrate before tests | No external Postgres dependency. Isolated test DB avoids state leakage. Matches existing Prisma setup - only env var changes. `beforeAll` hook runs migration, `afterAll` deletes file. |

## Complete File Migration Map

### Auth Domain (split + rewrite)

| CURRENT | TARGET | ACTION |
|---------|--------|--------|
| `web/src/auth/auth-store.ts` | `web/src/features/auth/store/auth-status.ts` | **REWRITE** - Zustand slice with ONLY `{ status: AuthStatus }` |
| `web/src/features/auth/api/` (new) | `web/src/features/auth/api/useSession.ts` | **CREATE** - React Query `useSession()` hook for GET /api/auth/me |
| `web/src/features/auth/api/` (new) | `web/src/features/auth/api/useLogin.ts` | **CREATE** - React Query mutation: POST /api/auth/login |
| `web/src/features/auth/api/` (new) | `web/src/features/auth/api/useRegister.ts` | **CREATE** - React Query mutation: POST /api/auth/register |
| `web/src/features/auth/api/` (new) | `web/src/features/auth/api/useLogout.ts` | **CREATE** - React Query mutation: POST /api/auth/logout |
| `web/src/features/auth/AuthProvider.tsx` | Same | **REWRITE** - thin sync: calls `useSession()`, syncs Zustand status, removes legacy `client` mock path |
| `web/src/features/auth/index.ts` | Same | **REWRITE** - re-exports new hooks (`useSession`, `useLogin`, `useLogout`, `useAuthStatus`), drops `useAuthStore` |
| `web/src/features/auth/hooks/useAuth.ts` | Same | **DEPRECATE** - replace with direct `useSession()` + `useAuthStatus()` |
| `web/src/features/auth/ProtectedRoute.tsx` | Same | **MODIFY** - reads `useSession().data` instead of `useAuth().status` |
| `web/src/features/auth/PublicAuthRoute.tsx` | Same | **MODIFY** - reads `useSession().data` instead of `useAuth().status` |
| `web/src/features/auth/components/SignInForm.tsx` | Same | **MODIFY** - calls `useLogin()` mutation |
| `web/src/features/auth/components/SignUpForm.tsx` | Same | **MODIFY** - calls `useRegister()` mutation |
| `web/src/features/auth/components/LogoutButton.tsx` | Same | **MODIFY** - calls `useLogout()` mutation |
| `web/src/features/auth/schemas/auth.ts` | Same | **KEEP** - local-form Zod schemas unchanged |

### lib/ Unbundling (22 files → features | core | shared | DELETE)

| CURRENT | TARGET | ACTION |
|---------|--------|--------|
| `web/src/lib/ai-client.ts` | `web/src/features/analysis/api/ai-client.ts` | MOVE |
| `web/src/lib/ai-orchestrator.ts` | `web/src/features/analysis/api/ai-orchestrator.ts` | MOVE |
| `web/src/lib/ai-provider.ts` | `web/src/features/analysis/api/ai-provider.ts` | MOVE |
| `web/src/lib/ai-errors.ts` | `web/src/features/analysis/api/ai-errors.ts` | MOVE |
| `web/src/lib/retry-strategy.ts` | `web/src/features/analysis/api/retry-strategy.ts` | MOVE |
| `web/src/lib/github-client.ts` | `web/src/features/analysis/api/github-client.ts` | MOVE |
| `web/src/lib/mappers/job-analysis.ts` | `web/src/features/analysis/api/mappers/job-analysis.ts` | MOVE |
| `web/src/lib/mappers/index.ts` | `web/src/features/analysis/api/mappers/index.ts` | MOVE |
| `web/src/lib/repositories/analysis-repository.ts` | `web/src/features/analysis/api/repository.ts` | MOVE |
| `web/src/lib/repositories/http-analysis-repository.ts` | `web/src/features/analysis/api/http-repository.ts` | MOVE |
| `web/src/lib/validation/job-analysis.ts` | `web/src/features/analysis/api/validation.ts` | MOVE |
| `web/src/lib/validation/history.ts` | `web/src/features/history/api/validation.ts` | MOVE |
| `web/src/lib/repositories/profile-repository.ts` | `web/src/features/settings/api/profile-repository.ts` | **REWRITE** - HTTP-only via Axios, no Supabase |
| `web/src/lib/repositories/settings-repository.ts` | `web/src/features/settings/api/settings-repository.ts` | **REWRITE** - HTTP-only via Axios, no Supabase |
| `web/src/lib/validation/profile.ts` | `web/src/features/settings/api/validation.ts` | MOVE |
| `web/src/lib/validation/settings.ts` | `web/src/features/settings/api/settings-validation.ts` | MOVE |
| `web/src/lib/validation/index.ts` | DELETE | - each feature's `api/index.ts` takes over |
| `web/src/lib/repositories/index.ts` | DELETE | - each feature's `api/index.ts` takes over |
| `web/src/lib/supabase/client.ts` | DELETE | - legacy Supabase SDK |
| `web/src/lib/supabase/index.ts` | DELETE | - legacy Supabase SDK |
| `web/src/lib/supabase/oauth-providers.ts` | DELETE | - legacy Supabase SDK |
| `web/src/lib/query-client.ts` | `web/src/core/query-client.ts` | MOVE |
| `web/src/lib/error-mapper.ts` | `web/src/core/error-mapper.ts` | MOVE |
| `web/src/lib/logger.ts` | `web/src/core/logger.ts` | MOVE |
| `web/src/lib/toast.ts` | `web/src/core/toast.ts` | MOVE |
| `web/src/lib/theme.tsx` | `web/src/core/theme.tsx` | MOVE |
| `web/src/lib/cn.ts` | `web/src/shared/utils/cn.ts` | MOVE |

### Pages Consolidation (remove `pages/`, move to features)

| CURRENT | TARGET | ACTION |
|---------|--------|--------|
| `web/src/pages/AnalysisPage.tsx` + `.test.tsx` | `web/src/features/analysis/pages/AnalysisPage.tsx` | MOVE |
| `web/src/pages/HistoryPage.tsx` + `.test.tsx` | `web/src/features/history/pages/HistoryPage.tsx` | MOVE |
| `web/src/pages/HistoryDetailPage.tsx` + `.test.tsx` | `web/src/features/history/pages/HistoryDetailPage.tsx` | MOVE |
| `web/src/pages/SettingsPage.tsx` + `.test.tsx` | `web/src/features/settings/pages/SettingsPage.tsx` | MOVE |
| `web/src/pages/PrivacyPage.tsx` + `.test.tsx` | `web/src/features/landing/pages/PrivacyPage.tsx` | MOVE |
| `web/src/pages/NotFoundPage.tsx` + `.test.tsx` | `web/src/shared/pages/NotFoundPage.tsx` | MOVE |
| `web/src/pages/LandingPage.tsx` + `.test.tsx` | DELETE | - duplicate of `features/landing/pages/LandingPage.tsx` |
| `web/src/pages/` | DELETE | - directory removed entirely |

### Components Relocation

| CURRENT | TARGET | ACTION |
|---------|--------|--------|
| `web/src/components/ui/*` (15 files) | `web/src/shared/components/*` | MOVE |
| `web/src/components/ErrorBoundary.tsx` + test | `web/src/core/components/ErrorBoundary.tsx` | MOVE |
| `web/src/components/landing/*` (10 files) | DELETE | - stale duplicate of `features/landing/components/` |
| `web/src/components/__tests__/ErrorBoundary.test.tsx` | `web/src/core/components/__tests__/ErrorBoundary.test.tsx` | MOVE |
| `web/src/components/ui/Footer.tsx` | DELETE (landing already has it) | - unused stale copy |
| `web/src/components/ui/Hero.tsx` | DELETE (landing already has it) | - unused stale copy |
| `web/src/components/` | DELETE | - directory removed entirely |

### Router + Core + Schemas

| CURRENT | TARGET | ACTION |
|---------|--------|--------|
| `web/src/router/AppRouter.tsx` + test | `web/src/core/router.tsx` | MOVE - update all page imports to `@/features/{domain}/pages/` |
| `web/src/layouts/AppLayout.tsx` + test | `web/src/shared/layouts/AppLayout.tsx` | MOVE |
| `web/src/schemas/job-analysis.ts` | `web/src/features/analysis/schemas/job-analysis.ts` | MOVE - domain-specific, not truly shared |
| `web/src/schemas/` | DELETE | - single file rehomed |
| `web/src/core/api-client.ts` | Same | **MODIFY** - 401 interceptor calls `queryClient.setQueryData(["auth","session"], null)` + `useAuthStatus().setStatus("unauthenticated")` instead of `useAuthStore.getState().clearSession()` |

## Path Alias Configuration

### vite.config.ts (add resolve.alias)
```typescript
import { resolve } from "node:path";
// add to defineConfig:
resolve: {
  alias: {
    "@": resolve(__dirname, "src"),
    "@/core": resolve(__dirname, "src/core"),
    "@/shared": resolve(__dirname, "src/shared"),
    "@/features": resolve(__dirname, "src/features"),
  },
},
```

### tsconfig.app.json (add paths)
```jsonc
"paths": {
  "@/*": ["src/*"],
  "@/core/*": ["src/core/*"],
  "@/shared/*": ["src/shared/*"],
  "@/features/*": ["src/features/*"]
}
```

**Before → After examples**:
```typescript
// Before
import { useAuthStore } from "../../auth/auth-store";
import { cn } from "../../lib/cn";
// After
import { cn } from "@/shared/utils/cn";
import { useSession } from "@/features/auth";
```

## Auth State Separation - Detailed Design

### New Hook: `features/auth/api/useSession.ts`
```typescript
export function useSession() {
  return useQuery({
    queryKey: ["auth", "session"],
    queryFn: () => apiClient.get("/auth/me").then(r => r.data),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
```

### New Store: `features/auth/store/auth-status.ts`
```typescript
export const useAuthStatus = create<{ status: AuthStatus }>(() => ({
  status: "unknown",
}));
// Updated by AuthProvider on session query resolution
```

### Simplified AuthProvider
- Mount: calls `queryClient.ensureQueryData(["auth", "session"])`
- On success: `useAuthStatus.setState({ status: "authenticated" })`
- On 401: `useAuthStatus.setState({ status: "unauthenticated" })`
- `signIn`, `signUp`, `signOut` become thin wrappers that invalidate `["auth", "session"]`
- Legacy `client` mock path removed; tests use MSW + `queryClient.setQueryData`
- Deprecated `linkIdentity`/`unlinkIdentity` removed

### Guard Changes
- `ProtectedRoute`: checks `useSession().data` is `null` → redirect
- `PublicAuthRoute`: checks `useSession().data` is not `null` → redirect
- Loading state: `useSession().isLoading` + `useAuthStatus().status === "loading"`

### Component Changes
- `SignInForm`: `useLogin().mutate({ email, password })` → invalidates session
- `SignUpForm`: `useRegister().mutate({ email, password, name })` → invalidates session
- `LogoutButton`: `useLogout().mutate()` → clears session cache, resets status
- `AppLayout`: reads `useSession().data?.email` instead of `useAuth().user`

## Data Flow Diagrams

### Before
```
AuthProvider(onMount) → auth_store.restoreSession() → fetch("/api/auth/me") → Zustand.set(user,status)
Components → useAuth() → AuthContext(reads Zustand)
SignInForm → useAuth().signIn() → auth_store.login() → fetch("/api/auth/login") → Zustand.set(user,status)
```

### After
```
AuthProvider(onMount) → queryClient.ensureQueryData(["auth","session"]) → GET /api/auth/me
                       → onSuccess: authStatus.setState({ status: "authenticated" })
                       → onError:   authStatus.setState({ status: "unauthenticated" })

Components → useSession() → React Query cache ["auth","session"] (server state)
Components → useAuthStatus() → Zustand { status } (UI state only)

SignInForm → useLogin().mutate() → POST /api/auth/login → onSuccess: invalidate(["auth","session"])
LogoutButton → useLogout().mutate() → POST /api/auth/logout → onSuccess: clear ["auth","session"], reset status
```

## Migration Strategy

### Phase Order & Dependencies
1. **Auth split** (isolated feature branch). Tests: update auth tests to use React Query wrappers. Barrel: old `features/auth/index.ts` re-exports new hooks under old names temporarily.
2. **lib/ unbundling** (mechanical moves). Each moved file gets a barrel re-export at old path. Run `pnpm lint -- --fix` after.
3. **Pages consolidation** + duplicate landing deletion. Router updates page import paths.
4. **Supabase/localStorage cleanup**: `grep -r supabase web/src/` must return empty. Profile/settings repos rewritten to use `apiClient` (Axios).
5. **Path aliases**: update `vite.config.ts` + `tsconfig.app.json`. Run `pnpm lint` to catch broken imports.
6. **E2E + Security + Logging**: server-side changes (helmet, rate limits, pino) applied independently. E2E tests written against final structure.

### Keeping Tests Passing Between Phases
- Barrel re-exports at old paths (`lib/ai-client.ts` → `export * from "@/features/analysis/api/ai-client"`)
- Remove barrels only after ALL imports updated and tests pass
- Each phase is one commit → individual `git revert` possible

## E2E Test Design

### Playwright Config (additions to existing `e2e/playwright.config.ts`)
```typescript
webServer: [
  { command: "pnpm --filter @nexus-talent/server dev:e2e", port: 3001, env: { DATABASE_URL: "file:./test.db", NODE_ENV: "test" } },
  { command: "pnpm --filter @nexus-talent/web dev", port: 5173 },
],
globalSetup: "./global-setup.ts", // prisma migrate + seed
```

### Auth Fixtures
```typescript
export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    await page.goto("/auth/sign-up");
    await page.fill("[data-testid=email-input]", "test@e2e.dev");
    await page.fill("[data-testid=password-input]", "Test123!");
    await page.click("[data-testid=submit-button]");
    await page.waitForURL("/app/analysis");
    await use(page);
  },
});
```

### Test Structure (under `e2e/tests/`)
- `auth/signup.spec.ts`: register → redirect to /app/analysis → cookie set
- `auth/login.spec.ts`: login with seeded user → redirect → cookie set
- `auth/logout.spec.ts`: authenticated → click logout → redirect to /auth/sign-in → cookie cleared
- `analysis/submit.spec.ts`: authenticated → fill JD form → submit → loading state → result renders
- `analysis/validation.spec.ts`: authenticated → empty submission blocked → error visible
- `history/list.spec.ts`: authenticated with seed data → navigate to /app/history → cards visible
- `history/delete.spec.ts`: authenticated → navigate to history → delete item → card removed

Run: `pnpm --filter @nexus-talent/e2e test`

## Security Hardening Design

### Helmet Configuration (`server/src/infra/app.ts`)
Already partially configured. Hardening additions:
```typescript
helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // needed for Tailwind
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"], // API calls
      fontSrc: ["'self'"],
    },
  },
  xFrameOptions: { action: "deny" },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
})
```

### Rate Limiting
- Already exists on auth routes (5 req / 15 min window) - no change
- Analysis router: update `max: 20` → `max: 10` per spec
- Apply to `/api/ai/analyze` only (already present in analysis.router.ts at line 17)

### Input Sanitization
- Strategy: **Zod validation at API layer** - all input goes through `validate(schema)` middleware
- XSS: Zod `.trim().max()` constraints + existing `shared/src/schemas.ts` schemas already reject script content
- SQL injection: Prisma parameterized queries provide innate protection
- No additional sanitization library needed - Zod `.refine()` with regex strip is the approach
- Per spec: each feature's `api/validation.ts` exposes a Zod schema; server validates input BEFORE processing

## Server Logging Design

### Pino Setup (already exists at `server/src/infra/logger.ts`)
Current: pino with `pino-pretty` in dev. Production-ready as-is.

### Request Logging Middleware (`server/src/infra/app.ts` - add before routes)
```typescript
import pinoHttp from "pino-http";
import { logger } from "./logger.js";
app.use(pinoHttp({ logger }));
```

### Log Format (JSON structure)
```json
{ "level": 30, "time": "2026-06-22T10:00:00.000Z", "pid": 1234, "hostname": "...", "req": { "method": "POST", "url": "/api/auth/login" }, "res": { "statusCode": 401 }, "responseTime": 45, "msg": "request completed" }
```

### Auth Event Logging
Added in `auth.controller.ts`: `logger.info({ event: "login_success", userId }, "User logged in")`, `logger.warn({ event: "login_failure", email }, "Failed login attempt")`.

### Analysis Request Logging
Added in `analysis.controller.ts`: `logger.info({ event: "analysis_request", userId, inputLength }, "Analysis requested")`.

### Error Handling
- Development: `pino-pretty` transport (colorized, stack traces)
- Production: raw JSON, sanitized messages (no file paths)

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit (Vitest) | Auth hooks, AuthProvider, guards, stores | `@testing-library/react` + MSW for API mocking + custom `queryClient` wrapper |
| Unit (Vitest) | Moved files (validation, repos, mappers) | Tests move with source files; imports updated to new aliases |
| Integration (Vitest) | Server auth, analysis, history controllers | `supertest` against Express app with ephemeral SQLite |
| E2E (Playwright) | Auth flows (login/register/logout), analysis submit/view, history list/delete | Playwright with ephemeral SQLite, auth fixtures, `data-testid` selectors |

## Open Questions

- [ ] Should `NotFoundPage.tsx` live in `shared/pages/` or `core/components/`? Current decision: `shared/pages/` since it has no domain coupling.
- [ ] Should `AppLayout.tsx` stay in `shared/layouts/` or move to `core/`? Current decision: `shared/layouts/` - it composes shared UI components.
