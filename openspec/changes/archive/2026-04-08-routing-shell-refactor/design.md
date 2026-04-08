# Design: Routing & Shell Refactor

## Technical Approach
Keep `src/App.tsx` as a thin composition root and move all route definitions into `src/router/AppRouter.tsx`. `AppRouter` will use the existing JSX route style (`<Routes>/<Route>`) instead of `createBrowserRouter` because the repo already uses component-based guards and MemoryRouter tests. `AppLayout` will own the shared app chrome (header, sidebar, outlet) and pages in `src/pages/` will own feature composition. `AuthShell` stays the layout for `/auth/*`. The public landing page lives at `/` and core `/app/*` routes are no longer blocked by auth; only `/app/admin/*` remains guarded by `AdminRoute`.

## Architecture Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Router shape | Centralized `AppRouter` with JSX routes | Matches the current React Router usage and minimizes churn in tests and route guards. |
| Layout boundaries | `AppLayout` for app chrome, `AuthShell` for auth, pages for content | Prevents `App.tsx` from becoming the shell again and keeps feature UI out of the router. |
| Persistence branching | Select repositories in the data layer, not in routes | Auth state should not change UI composition; it should only affect where data is stored. |
| Cache safety | Scope analysis query keys by persistence mode/session | Avoids stale history bleeding across anonymous and authenticated sessions if storage changes. |

## Data Flow

`BrowserRouter` (in `main.tsx`) -> `AppRouter` -> layout -> page -> feature -> repository

```text
AuthProvider -> useAuth()
                |
                v
        useAnalysisRepository()
                |
      +---------+---------+
      |                   |
   local repo         future remote repo
      |                   |
      +---------+---------+
                |
        AnalysisFeature / HistoryFeature
```

The page layer will inject the chosen `AnalysisRepository` into `AnalysisFeature` and `HistoryFeature`. This keeps the UI identical for authenticated and anonymous users while allowing persistence behavior to vary below the routing layer.

## File Changes

| File | Action | Description |
|---|---|---|
| `src/App.tsx` | Modify | Reduce to a thin wrapper that renders `AppRouter`. |
| `src/router/AppRouter.tsx` | Create | Define the full route tree for `/`, `/auth/*`, `/app/*`, and the admin subtree. |
| `src/layouts/AppLayout.tsx` | Create | Shared app shell with header/sidebar/nav and `Outlet`. |
| `src/pages/LandingPage.tsx` | Create | Public homepage at `/` with CTA links into the app and auth flows. |
| `src/pages/AnalysisPage.tsx` | Create | Page wrapper for `AnalysisFeature` and the analysis hero copy. |
| `src/pages/HistoryPage.tsx` | Create | Page wrapper for `HistoryFeature`. |
| `src/pages/SettingsPage.tsx` | Create | Page wrapper for `SettingsFeature`. |
| `src/features/analysis/AnalysisFeature.tsx` | Modify | Accept repository injection so pages can select storage explicitly. |
| `src/features/analysis/hooks/useAnalysisRepository.ts` | Create | Resolve the analysis repository based on auth/persistence mode. |
| `src/features/analysis/hooks/useAnalysisHistory.ts` | Modify | Accept/query a scoped cache key so auth switches do not reuse stale data. |
| `src/features/analysis/hooks/useJobAnalysis.ts` | Modify | Invalidate the same scoped history key after saves. |
| `src/features/history/components/HistoryEmptyState.tsx` | Modify | Replace internal `<a>` navigation with React Router `Link`. |

## Interfaces / Contracts

```ts
export type AnalysisPersistenceScope = "anonymous" | "authenticated";

export interface AnalysisRepositorySelection {
  repository: AnalysisRepository;
  scope: AnalysisPersistenceScope;
}
```

`AnalysisFeature` will take an optional `repository` prop, matching `HistoryFeature` and `SettingsFeature`, so pages can inject the selected storage adapter without changing the feature internals.

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Unit | Router structure, layout chrome, public landing render | `MemoryRouter` with route assertions for `/`, `/app`, `/auth/sign-in`, and wildcard fallback. |
| Unit | Repository selection and cache scoping | Mock `useAuth` and verify anonymous/authenticated selection plus key isolation. |
| Integration | App pages using existing feature tests | Keep current loading/empty/error/success coverage; add page wrappers to prove feature composition. |
| Regression | Internal navigation | Assert `NavLink`/`Link` usage replaces plain anchors in app/history surfaces. |

## Migration / Rollout

No schema migration is required. Ship the router and page split first, keep existing URLs stable, and remove the old monolithic shell only after route tests pass. `/app` becomes publicly reachable; `/app/admin/*` keeps admin protection. The landing page at `/` becomes the new public entry point.

## Open Questions

- Should authenticated analysis persistence stay local for this phase, or should a Supabase-backed analysis repository be added later when schema work is available?
- Should `ProtectedRoute` remain only for the admin subtree, or be retired from the core app route tree entirely?
