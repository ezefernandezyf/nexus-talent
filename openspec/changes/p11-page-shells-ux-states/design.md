# Design: P11 — Page Shells + UX States

## Technical Approach

Incremental refactor: fix ErrorBoundary (safety net), migrate AppLayout + z-index tokens, add per-route error boundaries, replace 50+ dangling classes, create skeletons + empty states, redesign AuthShell + LandingPage, consolidate footer. Each page passes `/impeccable critique`.

## Architecture Decisions

### ErrorBoundary: per-route `errorElement` + shared fallback

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Wrap each route in `<ErrorBoundary>` component | Boilerplate per route; no React Router 7 API usage | ❌ |
| React Router 7 `errorElement` on route config | Zero boilerplate; `useRouteError()` gives native error; layout shell stays intact on crash | ✅ |
| Keep class component + redirect | `null` render on error; no fallback UI; breaks UX-01 | ❌ |

**Rationale**: React Router 7's `errorElement` is the idiomatic approach — each `/app/*` route gets an `errorElement` pointing to a shared `<RouteErrorFallback>`. The root ErrorBoundary becomes a last-resort wrapper around `RouterProvider`. This satisfies UX-01 (fallback UI + retry) and UX-02 (route-level boundary, shell intact).

### Footer: one component, two variants

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Keep three footers | Inconsistent; maintenance burden | ❌ |
| Single `<Footer variant="landing" \| "app">` | One component; prop controls link density; both current tests adapt | ✅ |

**Rationale**: Spec USH-M01 requires exactly one Footer. A variant prop avoids prop-drilling 5+ booleans. `landing` variant has full SEO/GEO links + copyright; `app` variant has minimal copyright only.

### Page skeletons: one per page, matching layout

**Choice**: Four dedicated skeleton components (`AnalysisPageSkeleton`, `HistoryPageSkeleton`, `HistoryDetailPageSkeleton`, `SettingsPageSkeleton`) using the Apex `<Skeleton>` primitive. Each mimics its page's layout structure so the transition to real content is seamless.

**Rationale**: Spec UX-03 requires skeletons matching page layout. A single generic skeleton can't match four distinct layouts. Each skeleton lives in its feature's `components/` folder following the folder-per-component pattern.

### z-index: enforce CSS custom properties

**Choice**: Replace all hardcoded `z-30`, `z-40`, `z-50`, `z-[40]`, `z-[60]` with `var(--z-sidebar)`, `var(--z-topbar)`, `var(--z-modal)`, `var(--z-toast)`, `var(--z-tooltip)`. Define the token family in `index.css`.

| Element | Old | New Token |
|---------|-----|-----------|
| Header (AppLayout) | `z-30` | `--z-topbar: 30` |
| Sidebar | implicit | `--z-sidebar: 20` |
| Account menu dropdown | `z-40` | `--z-dropdown: 40` |
| MobileDrawer backdrop | `z-40` | `--z-drawer-backdrop: 35` |
| MobileDrawer panel | `z-40` | `--z-drawer: 36` |
| Modal/Drawer (new) | `z-[40]` | `--z-modal: 50` |
| Toast | `z-[50]` | `--z-toast: 60` |
| Tooltip | `z-[60]` | `--z-tooltip: 70` |
| FAB (HistoryPage) | `z-50` | `--z-fab: 45` |

**Rationale**: Spec ASH-02 requires all z-index from `var(--z-*)`. This eliminates the stacking conflict between MobileDrawer (z-40), account menu (z-40), and FAB (z-50).

### Dangling class replacement mapping

| Legacy Class | Replacement | Scope |
|---|---|---|
| `primary-button` | `<Button variant="primary">` | 11 files |
| `secondary-button` | `<Button variant="secondary">` or `<Button variant="ghost">` for nav | 11 files |
| `surface-panel` | `<Card variant="flat">` or `<Card variant="elevated">` | 18 locations |
| `label-chip` | `<Badge variant="neutral" size="sm">` | 32 locations |
| `tech-chip` | `<Badge variant="brand" size="sm">` or `<Tag>` | 5 locations |
| `ghost-frame` | `<Card variant="flat">` or direct Tailwind | 12 locations |
| `ghost-border` | Remove (Card handles borders) | 1 location |
| `glass-panel` | `<Card variant="elevated">` | 2 locations |
| `field-surface` | `<Input>` or Tailwind `bg-surface-container-low` | 10 locations |
| `font-headline` | `font-display` (Switzer) | 5 locations |

## Data Flow

```
Route request
  │
  ├─→ Root Suspense ──→ AppLayout skeleton (AppLayoutSkeleton)
  │
  ├─→ AppLayout (ThemeProvider → AppLayoutContent)
  │    ├─ Header (z-topbar, nav links, account menu, theme toggle)
  │    ├─ Sidebar (desktop: recent analyses, nav links)
  │    ├─ <Outlet /> (page content)
  │    │    ├─ errorElement: <RouteErrorFallback> (per-route catch)
  │    │    └─ Page skeleton → page content → empty/error/success states
  │    ├─ Footer (variant="app")
  │    └─ MobileDrawer (z-drawer, z-drawer-backdrop)
  │
  ├─→ AuthShell (PublicAuthRoute wrapper)
  │    ├─ Brand (Link to /, Switzer, Deep Teal)
  │    ├─ <Card variant="elevated">{children}</Card>
  │    └─ Footer (variant="landing", minimal links)
  │
  └─→ LandingPage
       ├─ Navbar (Apex identity)
       ├─ Hero/HowItWorks/WhatYouGet/FAQ sections (Apex components)
       └─ Footer (variant="landing", full SEO/GEO links)
```

## Component Architecture

```
<RouterProvider>
  └─ <ErrorBoundary> (last-resort catch)
      └─ <Suspense fallback={<AppLayoutSkeleton />}>
          └─ <Routes>
              ├─ / → LandingPage (Navbar + sections + Footer landing)
              ├─ /auth/* → PublicAuthRoute
              │    └─ AuthShell (Card + Footer minimal)
              │         ├─ sign-in → LoginPage
              │         ├─ sign-up → SignupPage
              │         └─ callback → AuthCallbackPage
              ├─ /app/* → AppLayout
              │    ├─ errorElement={<RouteErrorFallback />}
              │    └─ Outlet
              │         ├─ /app/analysis → AnalysisPage
              │         │    ├─ AnalysisPageSkeleton (loading)
              │         │    ├─ EmptyState (idle)
              │         │    └─ AnalysisFeature (success)
              │         ├─ /app/history → HistoryPage
              │         │    ├─ HistoryPageSkeleton (loading)
              │         │    ├─ HistoryEmptyState (empty)
              │         │    └─ HistoryFeature (success)
              │         ├─ /app/history/:id → HistoryDetailPage
              │         │    ├─ HistoryDetailPageSkeleton (loading)
              │         │    ├─ NotFound error panel
              │         │    └─ Detail (success)
              │         └─ /app/settings → SettingsPage
              │              ├─ SettingsPageSkeleton (loading)
              │              └─ SettingsFeature (success)
              ├─ /privacy → PrivacyPage (Apex components)
              ├─ /404 → NotFoundPage (Apex components)
              └─ /500 → ServerErrorPage (Apex components)
```

## File Changes

### New Files

| File | Action | Description |
|------|--------|-------------|
| `web/src/core/components/RouteErrorFallback.tsx` | Create | Shared per-route error fallback with retry button. Uses `useRouteError()` |
| `web/src/core/components/AppLayoutSkeleton.tsx` | Create | Layout-matching skeleton for AppLayout Suspense |
| `web/src/features/analysis/components/AnalysisPageSkeleton.tsx` | Create | Skeleton mimicking JD form + result view layout |
| `web/src/features/history/components/HistoryPageSkeleton.tsx` | Create | Skeleton mimicking history list/table layout |
| `web/src/features/history/components/HistoryDetailPageSkeleton.tsx` | Create | Skeleton mimicking detail view layout |
| `web/src/features/settings/components/SettingsPageSkeleton.tsx` | Create | Skeleton mimicking settings form layout |
| `web/src/shared/components/Footer/Footer.tsx` | Create | Canonical footer with `variant` prop |
| `web/src/shared/components/Footer/Footer.test.tsx` | Create | Tests for both variants |
| `web/src/shared/components/Footer/index.ts` | Create | Re-export |
| `web/src/shared/components/Footer/Footer.snap.tsx` | Create | Snapshot test |

### Modified Files

| File | Action | Description |
|------|--------|-------------|
| `web/src/core/components/ErrorBoundary.tsx` | Modify | Keep as last-resort; redirect → fallback UI + retry |
| `web/src/core/router.tsx` | Modify | Add `errorElement` per /app/* route; replace Suspense fallback with AppLayoutSkeleton |
| `web/src/shared/layouts/AppLayout.tsx` | Modify | Replace old classes with Apex Button/Card/Badge; z-index tokens; use canonical Footer |
| `web/src/shared/layouts/AppLayout.test.tsx` | Modify | Update for new component uses |
| `web/src/shared/components/EmptyState.tsx` | Modify | Replace `primary-button` with `<Button variant="primary">` |
| `web/src/shared/components/FeaturePageShell.tsx` | Modify | Remove old classes if any |
| `web/src/shared/components/LoadingSkeleton.tsx` | Delete | Superseded by Apex Skeleton primitives + page-specific skeletons |
| `web/src/shared/pages/NotFoundPage.tsx` | Modify | Replace `primary-button`/`secondary-button` → `<Button>`; `surface-panel` → `<Card>`; `label-chip` → `<Badge>` |
| `web/src/shared/pages/ServerErrorPage.tsx` | Modify | Same replacements |
| `web/src/features/auth/components/AuthShell.tsx` | Modify | Replace glass-panel/ghost-border/ghost-frame with Apex Card; font-headline → font-display; brand Link to /; remove inline footer |
| `web/src/features/auth/components/SignInForm.tsx` | Modify | Replace `label-chip` → `<Badge>`; `font-headline` → `font-display` |
| `web/src/features/auth/components/SignUpForm.tsx` | Modify | Same |
| `web/src/features/auth/pages/AuthCallbackPage.tsx` | Modify | Replace `primary-button`/`secondary-button` → `<Button>`; `label-chip` → `<Badge>` |
| `web/src/features/auth/components/AuthStatusScreen.tsx` | Modify | `label-chip` → `<Badge>` |
| `web/src/features/landing/pages/LandingPage.tsx` | Modify | Replace `primary-button`/`secondary-button` → `<Button>`; use canonical Footer variant="landing" |
| `web/src/features/landing/pages/PrivacyPage.tsx` | Modify | Replace `primary-button`/`secondary-button` → `<Button>`; `surface-panel` → `<Card>`; `label-chip` → `<Badge>` |
| `web/src/features/landing/components/Navbar.tsx` | Modify | Use Apex identity (Switzer, OKLCH) |
| `web/src/features/landing/components/Cards.tsx` | Modify | Replace `surface-panel`, `ghost-frame` with `<Card>` |
| `web/src/features/landing/components/HeroSection.tsx` | Modify | Replace `glass-panel` with `<Card variant="elevated">` |
| `web/src/features/analysis/AnalysisFeature.tsx` | Modify | Replace `surface-panel` → `<Card>`; `label-chip` → `<Badge>`; inline loading → AnalysisPageSkeleton |
| `web/src/features/analysis/components/AnalysisResultView.tsx` | Modify | Replace `surface-panel` → `<Card>`; `label-chip` → `<Badge>`; `tech-chip` → `<Badge variant="brand">`; `field-surface` → `<Input>` |
| `web/src/features/analysis/components/JobDescriptionForm.tsx` | Modify | Replace `field-surface` → `<Input>`; `label-chip` → `<Badge>`; `font-headline` → `font-display` |
| `web/src/features/history/pages/HistoryPage.tsx` | Modify | Replace `secondary-button` → `<Button variant="secondary">`; loading → HistoryPageSkeleton |
| `web/src/features/history/pages/HistoryDetailPage.tsx` | Modify | Replace `surface-panel` → `<Card>`; `label-chip` → `<Badge>`; `tech-chip` → `<Badge>`; `primary-button` → `<Button>`; loading → HistoryDetailPageSkeleton |
| `web/src/features/history/components/HistoryDetailEditor.tsx` | Modify | Replace `surface-panel` → `<Card>`; `label-chip` → `<Badge>`; `ghost-frame` → `<Card variant="flat">`; `field-surface` → `<Input>` |
| `web/src/features/history/components/HistoryLoadingState.tsx` | Modify | Use Apex Skeleton primitives instead of bare divs |
| `web/src/features/history/components/HistoryEmptyState.tsx` | Modify | Uses shared EmptyState — verify CTA uses `<Button>` |
| `web/src/features/settings/pages/SettingsPage.tsx` | Modify | Replace `LoadingSkeleton variant="hero"` → SettingsPageSkeleton |
| `web/src/features/settings/SettingsFeature.tsx` | Modify | Replace `label-chip` → `<Badge>`; `ghost-frame` → `<Card>`; `field-surface` → `<Input>` |
| `web/src/features/settings/components/SettingsForm.tsx` | Modify | Replace `label-chip` → `<Badge>`; `field-surface` → `<Input>`; `ghost-frame` → `<Card variant="flat">` |
| `web/src/index.css` | Modify | Reorder z-index scale; remove `TODO P10` comment; add `--z-sidebar`, `--z-topbar`, `--z-fab`, `--z-drawer`, `--z-drawer-backdrop` |

### Removed Files

| File | Description |
|------|-------------|
| `web/src/shared/components/Footer.tsx` | Superseded by canonical Footer variant |
| `web/src/features/landing/components/Footer.tsx` | Superseded by canonical Footer variant |
| `web/src/shared/components/LoadingSkeleton.tsx` | Superseded by page-specific skeletons |

## Component APIs

```tsx
// RouteErrorFallback — shared per-route error boundary UI
interface RouteErrorFallbackProps {
  fallbackRoute?: string; // default: "/"
}
// Uses useRouteError() internally for error message extraction

// Footer — canonical single footer
interface FooterProps {
  variant: "landing" | "app";
}
// landing: full SEO/GEO links + copyright + social
// app: minimal copyright only

// AppLayout — main app shell (existing, modified)
// No prop changes; uses ThemeProvider + Outlet internally
// z-index enforcement: --z-topbar, --z-sidebar, --z-drawer

// AuthShell — auth page shell (existing, modified)
interface AuthShellProps {
  children: ReactNode;
  mode: "sign-in" | "sign-up";
}
// Uses Apex Card variant="elevated" instead of glass-panel
// Brand links to "/" with Switzer font

// EmptyState — shared (existing, modified)
interface EmptyStateProps {
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
}
// CTA uses <Button variant="primary"> instead of primary-button class

// Page skeletons
interface PageSkeletonProps {
  // All page skeletons accept optional className
  className?: string;
}
// AnalysisPageSkeleton — mimics form + result card layout
// HistoryPageSkeleton — mimics table/list with 4-5 rows
// HistoryDetailPageSkeleton — mimics detail sections
// SettingsPageSkeleton — mimics settings form panels
```

## CSS Strategy

```
/* z-index token family (extended) */
--z-base: 1;
--z-sidebar: 20;
--z-topbar: 30;
--z-drawer-backdrop: 35;
--z-drawer: 36;
--z-dropdown: 40;
--z-fab: 45;
--z-modal: 50;
--z-toast: 60;
--z-tooltip: 70;
```

**No arbitrary `z-[N]` values anywhere.** All layered components reference `var(--z-*)`.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `RouteErrorFallback` | Render with `MemoryRouter`; verify error message + retry button; test `useRouteError()` mock |
| Unit | `Footer` variant="app" | Renders copyright only; no SEO links |
| Unit | `Footer` variant="landing" | Renders full links + copyright |
| Unit | All 4 page skeletons | Render matches page layout structure; snapshot test |
| Unit | `EmptyState` with CTA | Button renders as `<Button variant="primary">`; without CTA → no button |
| Unit | `AuthShell` | Brand links to `/`; Apex Card renders; no glass-panel classes |
| Snapshot | Each skeleton + Footer + AuthShell | Folder-per-component: `Component.snap.test.tsx` |
| Type-check | All files | `tsc --noEmit` — zero `any` |
| E2E | Error boundary per-route | Navigate /app/analysis, trigger render error, verify fallback UI with retry |
| E2E | Empty states | Clear history, visit /app/history, verify "No history found" renders |

## Migration / Rollout

**Order of operations** (1 PR for the full change, atomic commits):

1. **ErrorBoundary + router setup** — Rewrite `ErrorBoundary.tsx` as last-resort; add `RouteErrorFallback`; add `errorElement` per /app/* route in `router.tsx`; replace Suspense fallback with `AppLayoutSkeleton`
2. **Footer consolidation** — Create canonical `<Footer variant="landing" | "app">`; remove old three footers; update imports
3. **z-index tokens** — Extend scale in `index.css`; update AppLayout, MobileDrawer, Modal, Toast, Tooltip to use `var(--z-*)`
4. **AppLayout migration** — Replace `primary-button`/`secondary-button` with `<Button>`; replace sidebar structure with Apex Card; use canonical Footer variant="app"
5. **Dangling class replacements** — File-by-file: `surface-panel` → `<Card>`, `label-chip` → `<Badge>`, `tech-chip` → `<Badge>`, `ghost-frame` → `<Card variant="flat">`, `field-surface` → `<Input>`, `font-headline` → `font-display`
6. **AuthShell redesign** — Replace glass-panel/ghost-border with Apex Card; brand Link; remove inline footer; use canonical Footer variant="app"
7. **Page skeletons** — Create 4 page-specific skeletons; wire into each page's loading state
8. **Landing page redesign** — Replace old button classes; preserve SEO content (H1, FAQ, CTA); use canonical Footer variant="landing"
9. **Cleanup** — Remove `LoadingSkeleton.tsx`; remove `web/src/features/landing/components/Footer.tsx`; remove `web/src/shared/components/Footer.tsx`; update test assertions for dangling classes

## Open Questions

- None. All design decisions are resolved based on spec requirements and codebase analysis.
