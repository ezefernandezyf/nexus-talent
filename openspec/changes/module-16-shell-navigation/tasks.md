# Tasks: Module 16 - Shell and Navigation

## Phase 1: Public Brand Wiring
- [x] 1.1 Update `src/components/landing/Navbar.tsx` so the Nexus Talent brand renders as a `Link` to `/` without changing the current visual style.
- [x] 1.2 Keep `src/pages/LandingPage.tsx` using the existing public drawer/actions composition so the header remains stable after the brand-link change.

## Phase 2: Shell Continuity
- [x] 2.1 Confirm `src/layouts/AppLayout.tsx` keeps the authenticated home link and drawer behavior unchanged.
- [x] 2.2 Confirm `src/router/AppRouter.tsx` still resolves `/`, `/app/*`, `/privacy`, and `/404` without adding new routes or redirects.

## Phase 3: Testing / Verification
- [x] 3.1 Extend `src/pages/LandingPage.test.tsx` to assert the brand link navigates to `/`.
- [x] 3.2 Extend `src/pages/LandingPage.test.tsx` to cover mobile drawer open/close plus public route targets (`/auth/sign-in`, `/auth/sign-up`, `/app/analysis`).
- [x] 3.3 Re-run `src/layouts/AppLayout.test.tsx` as a regression check to confirm the authenticated shell remains stable.