# Proposal: Routing & Shell Refactor

## Intent

Establish a scalable, feature-based routing architecture that supports both public and private usage of the app seamlessly. We are migrating away from the monolithic `App.tsx` shell to a proper `AppRouter` with dedicated pages, layouts, and a new public landing page, enabling unauthenticated users to trial the core experience.

## Scope

### In Scope
- Extract routing logic into `src/router/AppRouter.tsx`.
- Create a `src/pages/` directory for page-level components (Landing, Analysis, History, Settings).
- Create a `src/layouts/AppLayout.tsx` (Shared "Deep Space" UI for both public/private).
- Implement a Public Landing/Homepage at the index route (`/`).
- Enable generic public/private shared app experience (unauthenticated usability).
- Migrate plain `<a>` tags to React Router `NavLink`/`Link`.

### Out of Scope
- Implementation of Material UI (Strictly forbidden; using custom Tailwind).
- Changes to the underlying AI analysis logic or Supabase schema.
- Full refactor of the History into a full-page view (deferred/optional).

## Approach

We will adopt the **Full Router + Pages Pattern** combined with a generic **Layout Component Pattern**.
`App.tsx` will become a thin entry point mounting `AppRouter`.
The `AppRouter` will define:
- `/` -> `LandingPage`
- `/app` -> wrapped in `AppLayout` (header + sidebar).
Both authenticated and unauthenticated users can access `/app`, but unauthenticated usage will bypass Supabase persistence gracefully in the background, keeping the UI exactly the same. We will strictly adhere to the `DESIGN.md` "Deep Space" system.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/App.tsx` | Modified | Stripped down to just render `AppRouter`. |
| `src/router/` | New | `AppRouter.tsx` defines all routes. |
| `src/pages/` | New | Page wrappers (e.g., `AnalysisPage`, `LandingPage`). |
| `src/layouts/` | New | `AppLayout.tsx` containing the shell. |
| `src/features/` | Modified | Update navigation links to `NavLink`. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Auth Guard logic blocking public usage | High | Refactor route guards to allow public access to `/app`, branching logic in the data layer instead of routing. |
| Provider Ordering in main.tsx | Med | Ensure `BrowserRouter` correctly wraps `AuthProvider` without breaking layout state. |
| UI breaking | Low | Strictly rely on `DESIGN.md` tokens; avoid introducing external UI libraries. |

## Rollback Plan

Revert the Git commit introducing the router architecture, restoring `src/App.tsx` to its previous monolithic state.

## Success Criteria

- [ ] `/` renders a public landing page.
- [ ] Users can access `/app/analysis` without being logged in.
- [ ] Architecture cleanly separated into router, pages, and layouts.
- [ ] ZERO usage of Material UI.
