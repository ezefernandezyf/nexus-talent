# Tasks: Routing & Shell Refactor

## Phase 1: Foundation

- [x] 1.1 Create `src/router/AppRouter.tsx` with routes for `/`, `/auth/*`, `/app/*`, and `/app/admin/settings`.
- [x] 1.2 Create `src/layouts/AppLayout.tsx` with shared shell chrome, `Outlet`, and the current header/sidebar structure.
- [x] 1.3 Create `src/pages/LandingPage.tsx`, `AnalysisPage.tsx`, `HistoryPage.tsx`, and `SettingsPage.tsx` as thin wrappers.

## Phase 2: Core Implementation

- [x] 2.1 Reduce `src/App.tsx` to a thin composition root that renders `AppRouter` only.
- [x] 2.2 Move the current private shell markup from `src/App.tsx` into `AppLayout.tsx` and keep `/app/admin/*` behind `AdminRoute`.
- [x] 2.3 Add `src/features/analysis/hooks/useAnalysisRepository.ts` and scope `useAnalysisHistory.ts` keys so anonymous/authenticated sessions do not share stale cache.
- [x] 2.4 Thread repository selection through `AnalysisPage.tsx`, `HistoryPage.tsx`, and `SettingsPage.tsx` without changing visible UI.

## Phase 3: Wiring

- [x] 3.1 Wire `LandingPage` to `/` and mount `AnalysisPage`, `HistoryPage`, and `SettingsPage` under `/app/*`.
- [x] 3.2 Keep `/auth/*` on `AuthShell` and ensure `/app` stays reachable for anonymous users while `AdminRoute` still protects `/app/admin/settings`.
- [x] 3.3 Replace internal anchors in `src/App.tsx` and `src/features/history/components/HistoryEmptyState.tsx` with `NavLink`/`Link`.

## Phase 4: Testing

- [x] 4.1 Add `src/router/AppRouter.test.tsx` for `/`, `/app/analysis`, `/auth/sign-in`, and the wildcard redirect.
- [x] 4.2 Update route/guard coverage for public `/app` access and preserved admin protection.
- [x] 4.3 Add layout/page tests for `src/layouts/AppLayout.tsx` and `src/pages/LandingPage.tsx` to verify shell chrome and CTA navigation.

## Phase 5: Cleanup

- [x] 5.1 Remove dead shell helpers and unused imports from `src/App.tsx` after the router split.
- [x] 5.2 Audit new files for Material UI usage and keep the implementation on existing `Button`, `Card`, and Tailwind primitives.
