# Design: P5 - Frontend Refactor

## Technical Approach

Incremental, per-slice execution across 4 chained PRs (feature-branch-chain). Each slice targets its predecessor - no big-bang rewrites. Auth migrates from Supabase SDK to backend HTTP APIs with httpOnly cookies; data layer gets centralized Axios; dead admin code removed; history moves to server-side pagination. Settings/profile repos stay on Supabase until V1.2.1.

## Architecture Decisions

### Decision: Zustand for auth state

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Zustand | Light, AGENTS.md convention, no Provider nesting issues | ✅ Chosen |
| React Query | Already used for server state; mixing creates dual-source bugs | Rejected |
| Plain React Context | Causes re-render cascades across all consumers | Rejected |

**Rationale**: AGENTS.md mandates Zustand for UI state. Auth session is UI state - a single store avoids context-propagation re-renders. React Query stays for server data (analyses, settings).

### Decision: AuthProvider stays as thin context wrapper

**Rationale**: Existing 12+ test files already wrap AuthProvider. Changing the context shape entirely breaks every test. Instead, the new Zustand store sits underneath - AuthProvider reads from it and exposes the same `useAuth()` API shape (minus `isAdmin`, `linkIdentity`, `unlinkIdentity`).

### Decision: Axios over native fetch

**Rationale**: Interceptors eliminate per-route 401 boilerplate. With `withCredentials: true`, cookies attach automatically - no `credentials: "include"` per call site.

## Data Flow

### Slice A - Auth (PR #1)

```
App mount
  └─ AuthProvider useEffect → authStore.restoreSession()
       └─ GET /api/auth/me
            ├─ 200 → status="authenticated", user populated → guards allow /app
            └─ 401 → status="unauthenticated" → guards redirect /auth/sign-in

Login flow:
  SignInForm → authStore.login(email, password)
    └─ POST /api/auth/login → 200 + Set-Cookie → status="authenticated"

OAuth flow:
  Click "Google" → window.location = /api/auth/oauth/google
    → backend Google consent → callback → Set-Cookie → redirect to /auth/callback
    → AuthCallbackPage: GET /api/auth/me → 200 → Navigate to /app
```

### Slice B - API Client (PR #2)

```
Any hook → HttpAnalysisRepository → axiosInstance.get("/api/analyses")
                                       ├─ withCredentials: true (cookie attached)
                                       └─ 401 interceptor → authStore.clearSession() → navigate /auth/sign-in
```

### Slice D - History Pagination (PR #4)

```
HistoryPage → useHistory({ page, limit })
  └─ HttpAnalysisRepository.getAll(page, limit)
       └─ GET /api/analyses?page=1&limit=20 → { items, total, page, pageSize }
            └─ UI renders cards + prev/next
```

## Component Contracts

### Zustand Store (`web/src/auth/auth-store.ts`)

```ts
interface AuthState {
  user: { id: string; email: string; displayName: string | null } | null;
  status: "unknown" | "loading" | "authenticated" | "unauthenticated";
  restoreSession: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  clearSession: () => void;
}
```

### AuthProvider Context (after Slice A)

Same `useAuth()` API minus: `isAdmin`, `session`, `linkIdentity`, `unlinkIdentity`, `isConfigured`. Kept: `user`, `status`, `errorMessage`, `signIn`, `signUp`, `signOut`, `signInWithOAuth`.

### Axios Client (`web/src/core/api-client.ts`)

```ts
export const apiClient = axios.create({
  baseURL: "/api",
  withCredentials: true,
});
// Interceptor: 401 → authStore.getState().clearSession() + redirect
```

## File Changes

| File | Action | Slice |
|------|--------|-------|
| `web/src/auth/auth-store.ts` | Create | A |
| `web/src/core/api-client.ts` | Create | B |
| `web/src/features/auth/AuthProvider.tsx` | Modify | A |
| `web/src/features/auth/hooks/useAuth.ts` | Modify | A |
| `web/src/features/auth/pages/AuthCallbackPage.tsx` | Modify | A |
| `web/src/features/auth/ProtectedRoute.tsx` | Modify | A |
| `web/src/features/auth/PublicAuthRoute.tsx` | Modify | A |
| `web/src/features/auth/components/SignInForm.tsx` | Modify | A |
| `web/src/features/auth/components/SignUpForm.tsx` | Modify | A |
| `web/src/features/auth/index.ts` | Modify | A |
| `web/src/features/analysis/hooks/useAnalysisRepository.ts` | Modify | B |
| `web/src/lib/repositories/http-analysis-repository.ts` | Modify | B+D |
| `web/src/lib/repositories/local-analysis-repository.ts` | Delete | B |
| `web/src/lib/repositories/index.ts` | Modify | B |
| `web/src/features/auth/components/AdminRoute.tsx` | Delete | C |
| `web/src/features/auth/components/AdminRoute.test.tsx` | Delete | C |
| `web/src/router/AppRouter.tsx` | Modify | C |
| Web test files (12+) | Modify | A+B+C |

## Migration Strategy

1. **Slice A**: New Zustand store + AuthProvider rewrite deploy first. Supabase `client.ts` and `oauth-providers.ts` still exist (settings/profile need them until V1.2.1). Only auth flow changes.
2. **Slice B**: Axios replaces raw `fetch()` in `HttpAnalysisRepository`. `LocalAnalysisRepository` deleted. useAnalysisRepository simplified.
3. **Slice C**: AdminRoute, isAdmin removed. No rollback risk - just dead code.
4. **Slice D**: Pagination added. Backend already supports page/limit params from P4.
5. **Slice F (future)**: When V1.2.1 delivers settings/profile endpoints, delete `web/src/lib/supabase/` and `@supabase/supabase-js`.

## Test Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit (Slice A) | Auth store actions | Mock axios, test status transitions |
| Unit (Slice A) | Guards | Mock store state instead of AuthClientLike |
| Unit (Slice B) | Axios interceptor | Mock 401 → verify clearSession + redirect |
| Unit (Slice B) | useAnalysisRepository | Verify always returns HttpAnalysisRepository |
| Unit (Slice C) | AdminRoute removal | Delete test file |
| Unit (Slice D) | Paginated getAll | Mock axios, verify page/limit params sent |

**Test refactoring pattern**: Tests that created `AuthClientLike` mocks (AdminRoute.test.tsx, ProtectedRoute.test.tsx) get deleted or rewritten to mock Zustand store + axios. Settings/profile tests untouched.

## Open Questions

- [ ] Does the backend `GET /api/auth/me` return `role`? Current `authSessionDTOSchema` shows only `id, email, displayName`. If `role` needed, schema must be extended.
