# Tasks: Module 10 - Admin / Settings

## Phase 1: Database & Foundation
- [x] 1.1 Create Supabase migration file (`supabase/migrations/*_create_settings.sql`) for the `settings` table with strict columns (e.g. `maintenance_mode`, `allowed_domains`) and RLS policies restricted to `admin` role.
- [x] 1.2 Define Zod schema (`AppSettingsSchema`) and TypeScript types in `src/lib/validation/settings.ts`.
- [x] 1.3 Create `src/lib/repositories/settings-repository.ts` with methods to fetch and mutate settings, using the Zod schema for validation.

## Phase 2: Core Auth & Routing
- [x] 2.1 Update `src/features/auth/AuthProvider.tsx` and `useAuth.ts` to derive and expose `isAdmin` from `user.user_metadata.role === 'admin'`.
- [x] 2.2 Create `src/features/auth/components/AdminRoute.tsx` extending the protected route pattern to verify `isAdmin` and redirect standard users to `/app`.
- [x] 2.3 Update `src/App.tsx` to mount the `/app/admin/settings` route wrapped in `<AdminRoute>`.

## Phase 3: Settings Feature & UI
- [x] 3.1 Create `src/features/settings/hooks/useSettings.ts` using TanStack Query to wrap repository fetch and mutation calls.
- [x] 3.2 Create `src/features/settings/components/SettingsForm.tsx` with inputs mapped to the `AppSettingsSchema`. Include validation feedback.
- [x] 3.3 Create `src/features/settings/SettingsFeature.tsx` as the main container connecting the hook and the form with proper Loading, Error, and Success states.

## Phase 4: Testing & Verification
- [x] 4.1 Write unit tests for `settings-repository.ts` to verify Zod parsing (valid/invalid payloads) and Supabase mocking.
- [x] 4.2 Write unit tests for `AdminRoute.tsx` verifying redirect behavior when `isAdmin` is false vs true.
- [x] 4.3 Write integration tests for `SettingsFeature.tsx` mimicking form submission and successful TanStack Query mutation.
- [x] 4.4 Run typecheck, unit tests, and coverage to verify the CI gates stay green.