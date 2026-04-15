# Tasks: Module 18 - Legacy Cleanup

## Phase 1: Remove Legacy Code
- [x] 1.1 Delete `src/features/landing/pages/LandingPage.tsx` and the unused components under `src/features/landing/components/*`.
- [x] 1.2 Verify no remaining imports reference `src/features/landing/*`.

## Phase 2: Regression Checks
- [x] 2.1 Re-run `src/pages/LandingPage.test.tsx` to confirm the active landing page still renders.
- [x] 2.2 Re-run `src/router/AppRouter.test.tsx` to confirm public routing still resolves `/`, `/privacy`, and `/404`.