# Tasks: Module 07 Auth Users

## Phase 1: Foundation
- [x] 1.1 Add `@supabase/supabase-js` and `react-router-dom` to `package.json`, then document the required `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` env vars in `README.md`.
- [x] 1.2 Create `src/lib/supabase/client.ts` with a typed Supabase client factory and fail-closed guards when env config is missing.
- [x] 1.3 Add `supabase/migrations/20260405_module_07_auth_users.sql` to scaffold `profiles`, ownership columns, and basic owner-only RLS policies.

## Phase 2: Auth Core
- [x] 2.1 Implement `src/features/auth/AuthProvider.tsx` with `getSession()` bootstrap, `onAuthStateChange` subscription, and `signIn`/`signUp`/`signOut` actions.
- [x] 2.2 Add `src/features/auth/hooks/useAuth.ts` with a typed context contract exposing `user`, `session`, `status`, and auth actions.
- [x] 2.3 Create `src/features/auth/components/AuthShell.tsx`, `SignInForm.tsx`, `SignUpForm.tsx`, and `LogoutButton.tsx` with loading, error, and success states.

## Phase 3: Routing and App Shell
- [x] 3.1 Add `src/features/auth/ProtectedRoute.tsx` and public auth route guards so unauthenticated users redirect to `/auth/sign-in` after bootstrap.
- [x] 3.2 Update `src/main.tsx` to wrap the app with `QueryClientProvider`, `AuthProvider`, and router setup.
- [x] 3.3 Refactor `src/App.tsx` into public `/auth/*` and private `/app/*` branches, keeping `AnalysisFeature` and `HistoryFeature` behind the protected shell.

## Phase 4: Testing and Verification
- [x] 4.1 Add Vitest coverage for `src/features/auth/AuthProvider.test.tsx` to verify bootstrap, session transitions, and logout behavior with a mocked Supabase client.
- [x] 4.2 Add route and form tests for `src/features/auth/ProtectedRoute.test.tsx` and the auth components to cover invalid login, existing-email signup, and reload persistence.
- [x] 4.3 Verify the migration SQL, env fallback behavior, and auth copy against the spec scenarios before handing off to implementation.
