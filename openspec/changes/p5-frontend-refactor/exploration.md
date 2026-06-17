## Exploration: P5 — Frontend Refactor

### Current State

The web frontend is in a hybrid state: the backend (Express 5 + Prisma) is fully built (P1-P4), but the frontend still uses **Supabase SDK directly** for auth, settings, and profile CRUD. Analysis CRUD already uses HTTP via `/api/analyses`, but many hooks still default to localStorage. AI analysis already routes through the backend proxy (`POST /api/ai/analyze`).

### Affected Areas

#### 1. Auth Flow — Supabase SDK → Backend API

**Current** (`web/src/features/auth/AuthProvider.tsx`):
- Creates Supabase client via `createClient()` from `@supabase/supabase-js`
- Session check: `client.auth.getSession()` + `onAuthStateChange()` listener
- Sign in: `client.auth.signInWithPassword(email, password)`
- Sign up: `client.auth.signUp(email, password)`
- Sign out: `client.auth.signOut()`
- OAuth: `client.auth.signInWithOAuth({ provider: "google" })` — uses Supabase's own OAuth flow
- Identity linking/unlinking: `client.auth.linkIdentity()`, `client.auth.unlinkIdentity()`
- **Admin detection**: `user?.user_metadata?.role === "admin"` or `user?.app_metadata?.role === "admin"`
- Context type: uses `Session` and `User` from `@supabase/supabase-js`

**Target**:
- Zustand store (`web/src/auth/auth-store.ts`): `session`, `user`, `status` (authenticated | unauthenticated | unknown)
- New `AuthProvider`: calls `GET /api/auth/me` on mount to hydrate session
- Sign in: `POST /api/auth/login` with email/password → sets httpOnly cookie
- Sign up: `POST /api/auth/register` → sets httpOnly cookie
- Sign out: `POST /api/auth/logout` → clears cookie
- Google OAuth: redirect to `GET /api/auth/google` → backend handles flow → redirects with session cookie
- No Supabase `Session`/`User` types — use local DTOs
- Admin detection: from backend response (e.g., `GET /api/auth/me` returns `{ user: { role: "admin" } }`)

#### 2. API Client — Axios with `withCredentials: true`

**Current**: No centralized HTTP client. Uses raw `fetch()`:
- `web/src/lib/repositories/http-analysis-repository.ts`: `fetch(url, { credentials: "include" })`
- `web/src/lib/ai-provider.ts`: `fetch("/api/ai/analyze", ...)`

**Target**: Create Axios instance in `web/src/core/api-client.ts`:
- `withCredentials: true` for cookie-based auth
- Base URL already proxied by Vite (`/api` → `localhost:3001`)
- Response interceptor for global error handling (401 → redirect to login, etc.)

#### 3. Repository Pattern

**Current analysis repositories**:
- `createHttpAnalysisRepository()` — works, uses `fetch()` to `/api/analyses`, `credentials: "include"`
- `createLocalAnalysisRepository()` — localStorage fallback using key `nexus-talent:analysis-history:v1`
- `useAnalysisRepository()` hook — switches between HTTP (authenticated) and localStorage (anonymous)

**Problem**: Many hooks default to localStorage directly, bypassing the switch:
- `web/src/features/analysis/hooks/useAnalysisHistory.ts` → `createLocalAnalysisRepository()` as default
- `web/src/features/analysis/hooks/useAnalysisById.ts` → `createLocalAnalysisRepository()` as default
- `web/src/features/history/hooks/useUpdateAnalysis.ts` → `createLocalAnalysisRepository()` as default
- `web/src/features/history/hooks/useDeleteAnalysis.ts` → `createLocalAnalysisRepository()` as default
- `web/src/features/analysis/hooks/useJobAnalysis.ts` → `createLocalAnalysisRepository()` as default

**Settings and Profile repositories** — still use Supabase client directly:
- `settings-repository.ts`: Attempts Supabase query first, falls back to localStorage
- `profile-repository.ts`: Attempts Supabase query first, falls back to localStorage
- No HTTP-based implementations exist

**Target**:
- Create `HttpProfileRepository` and `HttpSettingsRepository` (need backend endpoints)
- Remove `LocalAnalysisRepository` (or keep as fallback but never default)
- Update default repositories in hooks from localStorage to HTTP

#### 4. Route Guards

**Current**: `ProtectedRoute`, `PublicAuthRoute`, `AdminRoute` all use `useAuth()` from Supabase-based context. Structure is fine — only the underlying auth needs to change.

**Target**: Keep the same guard structure. The guards just need the new Zustand-based auth context to work.

#### 5. Supabase Dependency Surface

**Direct `@supabase/supabase-js` imports** (12 files):

| File | Import |
|------|--------|
| `web/src/lib/supabase/client.ts` | `createClient`, `Session`, `SupabaseClient`, `UserIdentity` |
| `web/src/lib/repositories/settings-repository.ts` | `SupabaseClient` |
| `web/src/lib/repositories/profile-repository.ts` | `SupabaseClient` |
| `web/src/features/auth/AuthProvider.tsx` | `Session`, `User` |
| `web/src/features/auth/AuthProvider.test.tsx` | `Session`, `User` |
| `web/src/features/settings/settings-export.ts` | `Session`, `User` |
| `web/src/features/settings/hooks/useSettings.test.tsx` | `Session`, `User` |
| `web/src/features/auth/components/SignUpForm.test.tsx` | `Session`, `User` |
| `web/src/features/auth/components/SignInForm.test.tsx` | `Session`, `User` |
| `web/src/features/auth/components/AdminRoute.test.tsx` | `Session`, `User` |
| `web/src/features/auth/ProtectedRoute.test.tsx` | `Session`, `User` |
| `web/src/router/AppRouter.test.tsx` | `Session`, `User` |

**Supabase lib module imports** (9 files):
- `web/src/features/auth/AuthProvider.tsx` — `createSupabaseClient`, `getOAuthProviderConfig`, `getOAuthRedirectTo`, `AuthClientLike`, `OAuthProviderKey`
- `web/src/features/settings/SettingsFeature.tsx` — `getOAuthProviderConfig`
- `web/src/features/settings/settings-export.ts` — `getOAuthProviderConfig`, `OAuthProviderKey`
- `web/src/features/settings/hooks/useSettings.ts` — `OAuthProviderKey`
- Test files: `AuthClientLike`

#### 6. AI Proxy — Already Migrated

The AI client (`web/src/lib/ai-client.ts`) already uses `createBackendProxyAdapter()` which calls `POST /api/ai/analyze`. Local fallback engine exists but only activates when the server is unreachable.

**This area does NOT need P5 work.**

#### 7. VITE_GROQ_API_KEY

**Not found** anywhere in web code, `.env`, or `.env.example`. Groq is entirely server-side now (`GROQ_API_KEY` in root `.env`). **No action needed.**

#### 8. VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY

Still in `web/.env.example` and root `.env`. Used by `web/src/lib/supabase/client.ts` for creating Supabase client. **Can be removed after migration is complete.**

### Approaches

1. **Incremental — replace providers one by one**
   - Start with Zustand auth store + new AuthProvider
   - Then Axios client
   - Then repository defaults
   - Then clean up Supabase
   - Pros: Safe, each step testable, can ship incrementally
   - Cons: More phases, temporary dead code
   - Effort: Medium

2. **Big bang — rewrite all at once**
   - Create all new files, swap everything, then delete Supabase
   - Pros: Clean cut, no dead code
   - Cons: Large diff (difficult review), higher risk of regression
   - Effort: High

3. **Recommended: Hybrid — grouped slices**
   - **Slice A**: Zustand store + new AuthProvider + AuthCallbackPage update + guards (auth flow)
   - **Slice B**: Axios client + repository defaults swap (data layer)
   - **Slice C**: Remove Supabase lib, clean up deps, update tests
   - Pros: Reviewable chunks, each slice is independently verifiable, no dead code linger
   - Cons: Slightly more planning overhead
   - Effort: Medium

### Recommendation

**Approach 3 (Hybrid/Sliced)**: Split into 3 reviewable PR slices:
1. **Auth slice** — Zustand store (`auth-store.ts`), new `AuthProvider` calling `GET /api/auth/me`, update guards, update Login/Signup forms, update LogoutButton, update OAuth flow (redirect to `GET /api/auth/google`), remove `AuthCallbackPage` reliance on Supabase
2. **Data layer slice** — Axios client, swap repository defaults from localStorage to HTTP, create HTTP implementations for settings/profile (if backend endpoints exist)
3. **Cleanup slice** — Remove `web/src/lib/supabase/` entirely, remove `@supabase/supabase-js` from `package.json`, remove `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` from env, update all test mocks, remove `linkIdentity`/`unlinkIdentity` from AuthProvider

### Risks

1. **Missing backend endpoints**: Settings and profile CRUD endpoints may not exist yet in the backend (P1-P4 covered auth, AI proxy, and analysis CRUD). Profile (`PUT /api/profile`) and settings are listed as V1.2.1. Need to either create endpoints or keep Supabase fallback for those features.

2. **OAuth callback flow**: The current `AuthCallbackPage` expects to work with Supabase's URL hash fragment (`#access_token=...`). The new backend's Google OAuth likely uses query parameters and a server-side callback. Need to verify the backend's OAuth callback response and update the page accordingly.

3. **Identity linking/unlinking**: `linkIdentity` and `unlinkIdentity` are Supabase SDK features for managing multiple OAuth providers on a single account. The backend may not support this. These features should be removed or conditionally hidden.

4. **Admin detection**: Currently depends on Supabase user_metadata. Need the backend `GET /api/auth/me` to return `user.role` to determine admin status.

5. **Test mocks**: 12+ test files import Supabase types. Every test for auth/settings will need new mocks for the Axios-based flow. Significant test refactoring required.

6. **React Router v7 vs v6**: AGENTS.md says React Router 7 but `package.json` shows `react-router-dom@^6.30.3`. The `v7_startTransition` and `v7_relativeSplatPath` flags are enabled. This could cause friction with future React Router v7 upgrade.

### Ready for Proposal

**Yes** — but with the blocking question: **Do backend endpoints for profile and settings exist?** If not, Slice C (cleanup) cannot fully remove Supabase for settings/profile until V1.2.1. The auth slice and analysis data layer slice can proceed independently.

The orchestrator should also verify:
- Does `GET /api/auth/me` return `{ user: { id, email, role, displayName } }`?
- Does `POST /api/auth/register` return a session cookie immediately (like login)?
- Does `GET /api/auth/google/callback` redirect to the frontend with a session cookie already set?
