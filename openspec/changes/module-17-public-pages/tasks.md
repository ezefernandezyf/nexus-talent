# Tasks: Module 17 - Public Pages

## Phase 1: Verification Coverage
- [x] 1.1 Add `src/pages/PrivacyPage.test.tsx` to verify the privacy page renders and links back home.
- [x] 1.2 Add `src/pages/NotFoundPage.test.tsx` to verify the 404 page renders and exposes return links.
- [x] 1.3 Add `src/components/ui/Footer.test.tsx` to verify the shared footer links to `/privacy`.

## Phase 2: Regression Checks
- [x] 2.1 Re-run `src/router/AppRouter.test.tsx` to confirm `/privacy` and `/404` remain reachable.
- [x] 2.2 Confirm the landing and app shells still render the shared footer without route changes.