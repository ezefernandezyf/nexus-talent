# Tasks: Module 14 - Settings Rewrite

Scope note: keep this change limited to the user-facing settings rewrite. Defer auth social, history redesign, shell/navigation, and legacy cleanup. No Supabase migration/config task is expected for the base flow.

## Phase 1: Contracts and Feature Split

- [x] 1.1 Replace the admin-oriented shape in `src/features/settings/hooks/useSettings.ts` with a profile-focused hook surface for current user data, theme bridge state, and save status.
- [x] 1.2 Add or reshape repository helpers in `src/lib/repositories/settings-repository.ts` or a new `src/lib/repositories/profile-repository.ts` for `public.profiles` reads/writes and unavailable-state handling.
- [x] 1.3 Define the section payloads in `src/features/settings/components/*` so account, linked-account, theme, and export controls can be tested independently.

## Phase 2: Page Composition and Controls

- [x] 2.1 Rewrite `src/pages/SettingsPage.tsx` to render only `Account Information`, `Linked Accounts`, and `Danger Zone` in the reference-style shell.
- [x] 2.2 Split `src/features/settings/SettingsFeature.tsx` into section-level composition that passes auth/session metadata, profile draft state, and save callbacks to child components.
- [x] 2.3 Implement the account form in `src/features/settings/components/SettingsForm.tsx` for read-only email, editable profile fields, validation, loading/error/unavailable states, and save feedback.
- [x] 2.4 Wire the theme control to the existing shell preference from `src/layouts/AppLayout.tsx` so settings reflects and updates the same persisted theme value.
- [x] 2.5 Render linked-account status from `src/features/auth/AuthProvider.tsx` metadata and `src/lib/supabase/oauth-providers.ts`, without exposing provider onboarding or unlinking.
- [x] 2.6 Add the export action in the settings feature using current profile/session data only, keeping the payload client-scoped.
- [x] 2.7 Implement the danger-zone delete confirmation flow in the settings feature, with cancel/confirm states but no auto-delete.

## Phase 3: Validation and Persistence

- [x] 3.1 Validate profile edits with the existing Zod patterns before save and keep the UI blocked when profile storage is unavailable.
- [x] 3.2 Refresh the settings query/cache after successful persistence so the page re-renders from saved data instead of stale draft state.

## Phase 4: Testing

- [x] 4.1 Add or update `src/pages/SettingsPage.test.tsx` and `src/features/settings/SettingsFeature.test.tsx` for section composition, loading/error/unavailable states, and successful save.
- [x] 4.2 Extend `src/features/settings/components/SettingsForm.test.tsx` for read-only email, validation, and save-disabled behavior.
- [x] 4.3 Add tests for theme synchronization and linked-account detection in the relevant settings or auth helper tests.
- [x] 4.4 Add repository tests in `src/lib/repositories/settings-repository.test.ts` or a new profile repository test file for Supabase persistence and fallback handling.