# Tasks: Module 25 - Settings & Account Access Hardening

## Phase 1: Access Contract (RED/GREEN/REFACTOR)

- [x] 1.1 RED: Extend `src/router/AppRouter.test.tsx` and `src/layouts/AppLayout.test.tsx` to prove `/app/settings` works for authenticated users, public visitors are redirected, and `/app/admin/settings` no longer serves personal settings.
- [x] 1.2 GREEN: Mount `/app/settings` behind `ProtectedRoute` in `src/router/AppRouter.tsx` and point shell links at the new path.
- [x] 1.3 REFACTOR: Add a redirect from `/app/admin/settings` to `/app/settings` in `src/router/AppRouter.tsx` while keeping `/app/admin/*` admin-only.

## Phase 2: Shell Navigation (RED/GREEN/REFACTOR)

- [x] 2.1 RED: Update `src/layouts/AppLayout.test.tsx` to assert Settings appears only for authenticated users in desktop nav, the account menu, and the mobile drawer.
- [x] 2.2 GREEN: Filter the Settings item in `src/layouts/AppLayout.tsx` from auth state so public shells omit it and authenticated shells link to `/app/settings`.
- [x] 2.3 REFACTOR: Centralize the settings-link source of truth in `src/layouts/AppLayout.tsx` so desktop and mobile render the same auth-aware item.

## Phase 3: Account Deletion Flow (RED/GREEN/REFACTOR)

- [x] 3.1 RED: Expand `src/features/settings/SettingsFeature.test.tsx` and `src/pages/SettingsPage.test.tsx` to cover delete confirmation, cancel, success, pending, and error states.
- [x] 3.2 GREEN: Add the delete-account operation to `src/features/settings/hooks/useSettings.ts` and wire the danger-zone confirmation in `src/features/settings/SettingsFeature.tsx` to call it and sign the user out on success.
- [x] 3.3 REFACTOR: Keep deletion feedback and session invalidation isolated in the settings hook/service layer, not the UI.

## Phase 4: Verification

- [x] 4.1 Run the focused tests for `src/features/auth/components/AdminRoute.test.tsx`, `src/layouts/AppLayout.test.tsx`, `src/features/settings/SettingsFeature.test.tsx`, and `src/pages/SettingsPage.test.tsx`.