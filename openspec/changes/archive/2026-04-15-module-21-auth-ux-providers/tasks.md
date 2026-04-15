# Tasks: Module 21 - Auth UX and Social Providers

## Phase 1: Validation and Forms
- [x] 1.1 Add `confirmPassword` to `src/features/auth/schemas/auth.ts` and reject mismatches before submit.
- [x] 1.2 Update `src/features/auth/components/SignUpForm.tsx` to render and validate the confirm-password field.
- [x] 1.3 Fix OAuth button contrast in `src/features/auth/components/SignInForm.tsx` and `src/features/auth/components/SignUpForm.tsx` for light mode.

## Phase 2: Auth Shell and Providers
- [x] 2.1 Replace or remove the placeholder help control in `src/features/auth/components/AuthShell.tsx`.
- [x] 2.2 Keep `src/lib/supabase/oauth-providers.ts` explicit about which providers are enabled and how LinkedIn is handled.
- [x] 2.3 Document the Supabase provider enablement dependency for GitHub and Google.

## Phase 3: Regression Checks
- [x] 3.1 Re-run `src/features/auth/components/SignUpForm.test.tsx` after the validation changes.
- [x] 3.2 Re-run `src/features/auth/components/SignInForm.test.tsx` and any auth shell coverage after the UI updates.
- [x] 3.3 Verify provider-not-enabled messaging paths with the current auth tests.
