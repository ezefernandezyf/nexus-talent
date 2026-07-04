# Exploration: P11 — Page Shells + UX States

## Current State

### Route Map

| Route | Component | Current UX States | Notes |
|-------|-----------|------------------|-------|
| `/` | `LandingPage` | None (static + animations) | Standalone shell in features/landing — no shared layout |
| `/auth/sign-in` | `LoginPage` → `AuthShell` + `SignInForm` | Loading (route suspense), Error (form/API), AuthGuard loading | AuthShell has its own full-page shell |
| `/auth/sign-up` | `SignupPage` → `AuthShell` + `SignUpForm` | Same as sign-in | Same AuthShell |
| `/auth/callback` | `AuthCallbackPage` | Error (OAuth), Loading (refetch), Redirect (authenticated) | Standalone — no shared layout |
| `/app` (index) | Redirect → `/app/analysis` | — | Wrapped in `AppLayout` |
| `/app/analysis` | `AnalysisPage` → `AnalysisFeature` | **Idle** (EmptyState: "No hay análisis todavía"), **Loading** (custom skeleton panel), **Error** (ErrorState), **Success** (AnalysisCard) | Wrapped in `FeaturePageShell` + `AppLayout` |
| `/app/history` | `HistoryPage` → `HistoryFeature` | **Loading** (`HistoryLoadingState`), **Error** (inline message), **Empty** (`HistoryEmptyState`), **Success** (HistoryList) | Wrapped in `FeaturePageShell` + `AppLayout` |
| `/app/history/:id` | `HistoryDetailPage` | **Loading** (inline text), **Not Found** (inline error), **Success** (full detail) | Wrapped in `FeaturePageShell` + `AppLayout` |
| `/app/settings` | `SettingsPage` → `SettingsFeature` | **AuthLoading** (`LoadingSkeleton`), **Unauthenticated** (Card message), **Loading** (Card message), **SavePending**, **Success/Error toast** | ProtectedRoute guards it; wrapped in `FeaturePageShell` + `AppLayout` |
| `/privacy` | `PrivacyPage` | None (static) | Standalone — no shared layout |
| `/404` | `NotFoundPage` | Static fallback | Standalone — no shared layout |
| `/500` | `ServerErrorPage` | Static fallback | Standalone — no shared layout |

### Layout Components

#### AppLayout (`web/src/shared/layouts/AppLayout.tsx`)
- **Wraps all `/app/*` routes** via `<Route element={<AppLayout />} path="/app">`
- Lazy-loaded (Suspense with basic aria-busy div fallback)
- Contains:
  - Fixed header (z-30), with brand link, desktop nav links, account menu, mobile hamburger, theme toggle
  - Sidebar (hidden below lg, fixed left) with recent analyses, "Nuevo Análisis" CTA, bottom nav links
  - `<Outlet />` for page content (with lg:ml-64 sidebar offset)
  - `<Footer />` at the bottom
  - `<MobileDrawer />` portal for mobile nav
- Theme: wraps content in `<ThemeProvider>` + `AppLayoutContent`
- **Issues**: 
  - Uses old `primary-button` / `secondary-button` CSS class names (not the new `<Button>` component)
  - Sidebar is always visible on desktop but takes no flex space — uses `lg:ml-64` on content
  - Desktop account menu is a dropdown with `z-40`, could conflict with MobileDrawer `z-40`
  - No ErrorBoundary per-route (only one at app root)

#### AuthShell (`web/src/features/auth/components/AuthShell.tsx`)
- Full-page shell for sign-in/sign-up with:
  - Background gradient + grid overlay
  - Simple header (brand only, no nav)
  - Centered card with form
  - Footer with links
- **Issues**:
  - Uses old `glass-panel`, `ghost-border`, `ghost-frame` CSS class names
  - Duplicates the footer from shared components
  - Hardcoded "Nexus Talent" text in header (no Link)

#### FeaturePageShell (`web/src/shared/components/FeaturePageShell.tsx`)
- Used by AnalysisPage, HistoryPage, HistoryDetailPage, SettingsPage
- Adds `deep-space-shell` background class, optional background glow divs, `max-w-5xl` container
- **Issue**: The background glow divs use fixed positioning that may not adapt to sidebar offset
- General-purpose but has gaps: no standardized padding for mobile with sidebar

### Navigation

#### Desktop Navigation (AppLayout)
- **Top header** (fixed, z-30): visible on all `/app/*` routes
  - Desktop nav links (`md:flex`) with `getNavLinkClassName`
  - Account menu dropdown (hidden below md)
  - Theme toggle (hidden below md)
  - Mobile hamburger (hidden above md)
- **Sidebar** (fixed left, hidden below lg 1024px): 
  - "Mis Postulaciones" section header
  - Recent analyses from `useAnalysisHistory`
  - Bottom nav links duplicated from top
  - Uses `custom-scrollbar` class (no CSS found — likely missing)
  
#### Mobile Navigation
- `MobileDrawer` component: slide-in panel with framer-motion, portal to body
  - Backdrop (z-40)
  - Panel (right side, 86vw up to 22rem)
  - Close button, nav items, auth actions at bottom
  - Escape key + scroll lock
- `MobileMenuButton`: hamburger icon with animated bars, hidden on md+
- Warning: `MobileDrawer` uses `z-40` — same as desktop account menu dropdown and HistoryPage's FAB

### UX State Coverage

#### AnalysisPage
- **Loading**: Route-level Suspense fallback (empty div with `aria-busy`) + `StatePanel` with tone="loading" + pulse animations
- **Idle** (no data yet): `EmptyState` component ("No hay análisis todavía")
- **Error**: `StatePanel` with tone="error" + error message
- **Success**: `AnalysisCard` (renders full analysis result)
- **Edge**: Prefill from history rework handled via URL params + location state

#### HistoryPage
- **Loading**: `HistoryLoadingState` (table skeleton with 4 rows)
- **Error**: Inline error div with `label-chip` + error message
- **Empty**: `HistoryEmptyState` (uses shared `EmptyState` with CTA)
- **Success**: `HistoryList` with `HistoryCard` items + pagination
- **Edge**: Delete mutation in progress shows loading on individual card

#### HistoryDetailPage
- **Loading**: Inline `<div className="surface-panel">Cargando el detalle...</div>`
- **Not Found**: Inline error panel with title + back link
- **Success**: Full detail with editable fields, GitHub enrichment section

#### SettingsPage
- **Auth Loading**: `LoadingSkeleton variant="hero"` (while auth status loads)
- **Loading**: Card with "Estamos cargando tu espacio de cuenta" message
- **Unauthenticated**: Card with "Perfil no disponible" message
- **Error**: Toast for account errors, inline error messages in forms
- **Success**: Settings form + success messages

#### Error Handling
- **Root ErrorBoundary** (`web/src/core/components/ErrorBoundary.tsx`): 
  - Catches render errors
  - Maps via `error-mapper.ts`
  - Shows toast + redirects to `/500` (no visual fallback during redirect — renders `null`)
  - **Issue**: Redirects to hardcoded `/500` path without showing any fallback UI first
- **No per-page/feature ErrorBoundaries**: Only the single root boundary
- **Route-level errors**: Each feature handles errors internally via React Query state

### Design Gap Analysis: Old "The Signal" vs New "Apex"

#### What still uses old class names (from `@layer components` that was removed in P10):

**TODO P11 REMEDIATION — `primary-button` / `secondary-button` CSS classes (used in 21 locations):**
These are Tailwind utility classes that were defined in `@layer components` in V1.1 CSS and removed in P10. They **no longer have CSS definitions** — they are now dangling class names. Every instance should be migrated to the new `<Button>` component.

Files affected:
- `web/src/shared/layouts/AppLayout.tsx` — 5 instances (sidebar CTA, sign-in links, menu items)
- `web/src/shared/pages/NotFoundPage.tsx` — 2 instances
- `web/src/shared/pages/ServerErrorPage.tsx` — 1 instance
- `web/src/shared/components/EmptyState.tsx` — 1 instance
- `web/src/features/landing/pages/LandingPage.tsx` — 6 instances
- `web/src/features/auth/pages/AuthCallbackPage.tsx` — 2 instances
- `web/src/features/auth/components/AuthShell.tsx` — 0 instances (uses Link styled as button)
- `web/src/features/history/pages/HistoryPage.tsx` — 1 instance (export button)
- `web/src/features/history/pages/HistoryDetailPage.tsx` — 3 instances

**TODO P11 REMEDIATION — `surface-panel` CSS class (used in 13 locations):**
This was a V1.1 utility class. After P10, it should be replaced with the new `<Card>` component or direct utility classes.

Files affected:
- `web/src/shared/pages/NotFoundPage.tsx`
- `web/src/shared/pages/ServerErrorPage.tsx`
- `web/src/features/history/pages/HistoryDetailPage.tsx` — 3 instances
- `web/src/features/history/components/HistoryDetailEditor.tsx`
- `web/src/features/analysis/components/AnalysisResultView.tsx` — 6 instances
- `web/src/features/analyis/AnalysisFeature.tsx` — 1 instance (StatePanel)
- `web/src/features/landing/pages/PrivacyPage.tsx`
- `web/src/features/landing/components/Cards.tsx`

**TODO P11 REMEDIATION — `label-chip` CSS class (used in 20+ locations):**
Utility class for small label badges. Should be replaced with `<Badge>` component.

**TODO P11 REMEDIATION — `tech-chip` CSS class (used in 5 locations):**
Utility class for technology tags. Should be replaced with `<Badge>` or a `<Tag>` component.

**TODO P11 REMEDIATION — `ghost-frame` / `ghost-border` / `glass-panel` CSS classes:**
Utility classes used in AuthShell, SettingsFeature, HistoryDetailEditor. Should use `<Card>` with tone variants.

**TODO P11 REMEDIATION — `field-surface` CSS class:**
Used in JobDescriptionForm for input styling. Should use the new `<Input>` component.

#### What uses new Apex components:

- `<Button>` (and `button/` directory) — fully migrated, P10 complete
- `<Card>` (and `card/` directory) — fully migrated, P10 complete
- `<Badge>` — fully migrated
- `<Modal>` (and `modal/` directory) — includes Drawer sub-component
- `<Toast>` / `ToastProvider` — fully migrated
- `<Dropdown>` / `<Select>` — fully migrated
- `<Tabs>` — fully migrated
- `<Tooltip>` / `<Popover>` — fully migrated
- `<Skeleton>` — NOT yet migrated (only `LoadingSkeleton.tsx` exists with hero/list-item variants)
- `<Input>` — fully migrated (but not yet used by JobDescriptionForm)

#### Current CSS Tokens (index.css):
- OKLCH colors properly defined: brand/primary, accent, surfaces, semantic
- Light theme support via `html[data-theme="light"]`
- Fluid type scale with clamp()
- Font stack: Geist (body) + Switzer (display) + JetBrains Mono (code)
- TODO P10 comment still in CSS: `/* TODO P10: remove — use text-on-surface instead */`
- Old `@layer components` block removed — but class name references remain in code

#### Font mismatch:
- **Spec**: Switzer (display) + Geist (body) — **Apex design system**
- **Old code**: Multiple font-family refs: `font-display`, `font-headline`, `font-label`, `font-body`
- `font-headline` is NOT defined in `@theme` — only `--font-display`, `--font-heading`, `--font-body`, `--font-label`
- Some pages use `font-headline` class that doesn't resolve (LandingPage HeroSection)

### z-index Conflicts

| Component | z-index | Notes |
|-----------|---------|-------|
| Header (AppLayout) | `z-30` | Fixed top |
| Desktop account menu | `z-40` | Dropdown below header |
| MobileDrawer | `z-40` | Portal, could fight account menu |
| HistoryPage FAB | `z-50` | Fixed bottom-right, overlaps everything |
| Modal / Drawer (new) | `z-[40]` | Uses arbitrary value, inconsistent with theme scale |
| Toast | `z-[50]` | Portal, arbitrary value |
| Tooltip | `z-[60]` | Should be highest |
| Dropdown / Select | `z-[60]` | Matches tooltip |
| CSS custom properties | `z-base:1, z-dropdown:10, z-sticky:20, z-modal-backdrop:30, z-modal:50, z-toast:40, z-tooltip:60` | Defined but NEVER used |

**Key Issue**: The theme defines a z-index scale (`--z-modal: 50`) but NO component references these CSS vars. All components use hardcoded `z-*` or `z-[*]` arbitrary values. The scale is completely unused.

### Responsive Breakpoints Used

- `sm:` (640px) — most pages use this for better mobile spacing
- `md:` (768px) — desktop nav toggle, form layout changes
- `lg:` (1024px) — sidebar toggle in AppLayout
- No `xl:` or `2xl:` usage found for layout
- Custom `max-w-screen-2xl` on landing page containers

### Missing States

1. **AppLayout route suspense**: `<RouteLoadingFallback>` is a bare div with only `aria-busy`. No skeleton matches the layout structure.
2. **AuthCallback page**: No loading skeleton for the OAuth callback window — renders immediately.
3. **PrivacyPage, NotFoundPage, ServerErrorPage**: No animation, no layout consistency with app shell.
4. **ErrorBoundary on redirect**: When ErrorBoundary catches an error, it shows a toast then immediately redirects to `/500` with `null` render. There's a flash of nothing.
5. **SettingsPage auth loading**: Uses `LoadingSkeleton variant="hero"` which is the OLD V1.1 skeleton, not the new Apex primitives.
6. **HistoryDetailPage loading**: Uses inline raw text "Cargando el detalle guardado..." instead of a proper skeleton.

### Existing Duplication

- **Two Footers**: `web/src/features/landing/components/Footer.tsx` (used by LandingPage) and `web/src/shared/components/Footer.tsx` (unused — no longer imported in AppLayout)
- **Two Navbars**: Landing page has its own `Navbar` in `features/landing/components/`; app shell has inline header
- **Two MobileDrawers**: LandingPage renders its own MobileDrawer; AppLayout renders another one — they share the same component but have duplicated logic

---

## Affected Areas

- `web/src/shared/layouts/AppLayout.tsx` — Main app shell, navigation, sidebar, mobile drawer
- `web/src/shared/components/FeaturePageShell.tsx` — Page wrapper for feature pages
- `web/src/shared/components/PageHeader.tsx` — Shared page title header
- `web/src/shared/components/EmptyState.tsx` — Empty state pattern
- `web/src/shared/components/LoadingSkeleton.tsx` — Needs upgrade to new design
- `web/src/shared/pages/NotFoundPage.tsx` — Static 404 page
- `web/src/shared/pages/ServerErrorPage.tsx` — Static 500 page
- `web/src/core/components/ErrorBoundary.tsx` — Root error handling
- `web/src/features/auth/components/AuthShell.tsx` — Auth page shell
- `web/src/features/auth/components/AuthStatusScreen.tsx` — Auth guard loading/error
- `web/src/features/auth/pages/AuthCallbackPage.tsx` — OAuth callback
- `web/src/features/auth/ProtectedRoute.tsx` — Route guard loading state
- `web/src/features/auth/PublicAuthRoute.tsx` — Public route guard loading state
- `web/src/features/landing/pages/LandingPage.tsx` — Landing page shell
- `web/src/features/landing/components/Navbar.tsx` — Landing page nav
- `web/src/features/analysis/pages/AnalysisPage.tsx` — Analysis page
- `web/src/features/analysis/AnalysisFeature.tsx` — Analysis feature with StatePanel
- `web/src/features/history/pages/HistoryPage.tsx` — History page
- `web/src/features/history/pages/HistoryDetailPage.tsx` — History detail page
- `web/src/features/history/components/HistoryLoadingState.tsx` — History skeleton
- `web/src/features/history/components/HistoryEmptyState.tsx` — History empty state
- `web/src/features/settings/pages/SettingsPage.tsx` — Settings page
- `web/src/shared/components/Footer.tsx` — Unused shared footer
- `web/src/index.css` — Token definitions, utility classes, TODO comments

---

## Approaches

### Approach 1: Incremental Migration (Recommended)

Migrate each component from old class names to new Apex components one at a time, starting with layouts and shells, then feature pages.

- **Pros**: Low risk, each step testable, can ship partial improvements, no regression
- **Cons**: Takes longer to reach full consistency, temporary mixing of old/new patterns
- **Effort**: Medium

**Phase breakdown:**
1. Fix ErrorBoundary (show fallback UI instead of redirect + null)
2. Migrate AppLayout to new Button component, add per-route ErrorBoundaries
3. Create proper route-level loading skeletons matching layout structure
4. Migrate AuthShell to new Card/Badge components
5. Upgrade FeaturePageShell to handle sidebar offset properly
6. Add skeleton variants for each feature page
7. Create consistent empty state patterns
8. Reconcile z-index scale (use CSS custom properties)
9. Consolidate footer and nav duplication

### Approach 2: Big Bang Rewrite

Rewrite all shells, layouts, and page wrappers in one pass with full Apex design.

- **Pros**: Ships consistent design in one go, no transition period
- **Cons**: High risk of regression, large diff (hard to review), blocks other work (P12-P13)
- **Effort**: High

### Approach 3: Shell-first, then UX states

Focus on AppLayout + AuthShell redesign first (shells), then add skeletons/empty states (UX).

- **Pros**: Clear milestones, unblocks P12 (animations)
- **Cons**: Requires revisiting pages twice
- **Effort**: Medium

---

## Recommendation

**Approach 1: Incremental Migration** — This is the least risky path and aligns with the existing P9/P10 incremental strategy. The codebase already has a mixed state (old CSS classes dangling, new components available). The critical path is:

1. **Fix ErrorBoundary** first — it's a safety net for everything else
2. **Migrate AppLayout** to new `<Button>`, `<Badge>`, and proper z-index tokens
3. **Add per-route ErrorBoundaries** within AppLayout
4. **Upgrade FeaturePageShell** with proper responsive margins and sidebar awareness
5. **Replace old CSS class names** (`primary-button`, `surface-panel`, `label-chip`, `tech-chip`, `ghost-frame`, `field-surface`) with new Apex components
6. **Add proper skeletons** for each page (analysis, history, detail, settings)
7. **Fix AuthShell** to use new components
8. **Reconcile z-index scale** — make components use the CSS custom properties

## Risks

1. **Dangling class names**: `primary-button`, `secondary-button`, `surface-panel`, `label-chip` have NO CSS definitions since P10 removed the `@layer components` block. These elements render unstyled or broken. **This is the highest priority risk.**
2. **z-index conflicts**: The theme defines a scale (z-base through z-tooltip) but NO component uses it. Hardcoded arbitrary values (`z-[40]`, `z-[50]`, `z-[60]`) risk stacking order bugs, especially on mobile where MobileDrawer (z-40), account menu (z-40), and FAB (z-50) coexist.
3. **Duplicate footers**: `web/src/shared/components/Footer.tsx` is unused but maintained. `features/landing/components/Footer.tsx` is used by LandingPage. AppLayout renders its own footer inline. The AuthShell has another inline footer. **Three different footers** means inconsistency.
4. **CSS `font-headline`**: Used in AuthShell and some landing components but NOT defined in the Tailwind theme — falls through to default sans-serif.
5. **No test coverage for ErrorBoundary redirect path**: The `componentDidCatch` redirects to `/500` but there's no test verifying this behavior.
6. **FeaturePageShell background glows** use fixed positioning that may overlap with the sidebar on desktop.

## Ready for Proposal

**Yes.** There is enough information to propose a concrete plan. The orchestrator should:

1. Confirm the priority: "fix dangling class names first, then shells, then UX states"
2. Decide on z-index strategy: migrate to CSS custom properties or keep arbitrary values
3. Decide on footer consolidation strategy
4. Proceed to `sdd-propose` with the approaches outlined above, starting with the highest-risk items (dangling classes, ErrorBoundary, z-index conflicts)
