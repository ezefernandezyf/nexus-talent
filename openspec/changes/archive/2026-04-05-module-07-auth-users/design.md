# Design: Module 07 Auth Users

## Technical Approach

Implement an incremental Auth shell around the current app using Supabase Auth as the source of truth for session state. The app will boot the session eagerly, keep auth state in a single `AuthProvider`, and use route boundaries to split public sign-in/sign-up screens from the protected analysis/history experience. Existing local history storage stays untouched for this phase to avoid data-loss risk.

The Supabase work is intentionally minimal: client setup, auth UI, session bootstrap, protected routing, and basic RLS scaffolding for future user-owned tables. No history migration and no RBAC beyond the basic ownership boundary.

## Architecture Decisions

| Decision | Choice | Alternatives considered | Rationale |
|---|---|---|---|
| Route model | Add `react-router-dom` and split public `/auth/*` from private `/app/*` routes | Keep a single screen and conditionally render auth vs app | Explicit route protection matches the requirement and keeps future auth flows predictable. |
| Session ownership | Central `AuthProvider` with `getSession()` bootstrap and `onAuthStateChange` subscription | Query Supabase from each screen or hook | One provider prevents duplicated session logic and avoids inconsistent redirects during reload. |
| Data migration | Defer local history migration completely | Copy local storage data into Supabase now | The approved direction prioritizes zero data-loss risk; history can remain local until the persistence/auth plan is ready. |
| RLS scope | Create basic ownership scaffolding only | Introduce full RBAC now | RBAC is out of scope and would widen the schema and policy surface before the auth shell is stable. |

## Data Flow

```text
App start
  -> AuthProvider bootstraps session from Supabase
  -> Router resolves public/private branch
  -> ProtectedRoute waits for loading to finish
      -> no session: redirect to /auth/sign-in
      -> session: render /app shell

Sign in / sign up
  -> Auth form submits credentials
  -> AuthProvider calls Supabase Auth
  -> Supabase emits auth state change
  -> Provider updates session/user/status
  -> Router shows private app
```

The current `AnalysisFeature` and `HistoryFeature` remain the private app shell. Public auth screens should use the same visual language but stay lighter than the product shell.

## File Changes

| File | Action | Description |
|---|---|---|
| `src/lib/supabase/client.ts` | Create | Supabase client factory reading `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. |
| `src/features/auth/AuthProvider.tsx` | Create | Owns bootstrap, subscription, session state, and auth actions. |
| `src/features/auth/components/*` | Create | Sign-in, sign-up, logout, and auth shell UI. |
| `src/features/auth/hooks/useAuth.ts` | Create | Typed context accessor for auth state/actions. |
| `src/features/auth/ProtectedRoute.tsx` | Create | Redirects unauthenticated users after bootstrap completes. |
| `src/App.tsx` | Modify | Move current analysis/history shell behind private routing. |
| `src/main.tsx` | Modify | Wrap app with router and `AuthProvider`. |
| `package.json` | Modify | Add `@supabase/supabase-js` and `react-router-dom`. |
| `supabase/migrations/20260405_module_07_auth_users.sql` | Create | Basic auth-ready profile/RLS scaffolding. |

## Interfaces / Contracts

```ts
type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  status: AuthStatus;
  signIn(email: string, password: string): Promise<void>;
  signUp(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
}
```

The migration should scaffold a `profiles` table keyed by `auth.users.id` with RLS enabled and owner-only select/update policies. That creates the auth boundary now without forcing any history migration.

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Unit | Auth status transitions, provider actions, redirect gating | Vitest with mocked Supabase client and context consumers. |
| Integration | Bootstrap on reload, sign-in/sign-up, sign-out, protected redirect | Component tests around `AuthProvider` + `ProtectedRoute` + auth forms. |
| E2E | Auth shell smoke path | Deferred unless the project already has browser automation wired in. |

## Migration / Rollout

No migration required for local history. Rollout is safe as long as Supabase env vars are present; if they are missing, the app should fail closed into the public auth shell instead of exposing private routes.

## Open Questions

- [ ] Should sign-up land on the private app immediately or wait for email verification messaging?
- [ ] Should `/auth` render a combined sign-in/sign-up shell, or separate routes for each form?
