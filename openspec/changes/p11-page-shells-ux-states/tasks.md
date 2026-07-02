# Tasks: P11 — Page Shells + UX States

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 1400-1600 (~40 files created/modified/deleted) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 → PR 2 → PR 3 → PR 4 → PR 5 |
| Delivery strategy | ask-on-risk |
| Chain strategy | feature-branch-chain |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | PR | Base |
|------|------|-----|------|
| 1 | ErrorBoundary + Footer consolidation | PR 1 | feat/p11-page-shells |
| 2 | z-index tokens + AppLayout Apex migration | PR 2 | PR 1 branch |
| 3 | Dangling class replacements (50+ locations) | PR 3 | PR 2 branch |
| 4 | AuthShell redesign + Landing page Apex | PR 4 | PR 3 branch |
| 5 | Page skeletons + old file cleanup + critique | PR 5 | PR 4 branch |

## Phase 1: Foundation — ErrorBoundary + Footer (PR 1)

- [x] 1.1 Create `web/src/core/components/RouteErrorFallback.tsx` — shared per-route fallback with retry button using `useRouteError()` (UX-01)
- [x] 1.2 Test `RouteErrorFallback` — render error message + retry; snapshot test (UX-01)
- [x] 1.3 Create `web/src/core/components/AppLayoutSkeleton.tsx` — layout-matching skeleton for Suspense fallback (ASH-04)
- [x] 1.4 Add `errorElement={<RouteErrorFallback />}` to `/app/analysis`, `/app/history`, `/app/history/:id`, `/app/settings` in `web/src/core/router.tsx` (UX-02)
- [x] 1.5 Replace root Suspense `fallback` with `<AppLayoutSkeleton />` in `web/src/core/router.tsx` (ASH-04)
- [x] 1.6 Fix `web/src/core/components/ErrorBoundary.tsx` — render fallback UI + retry, remove silent redirect (UX-01)
- [x] 1.7 Create `web/src/shared/components/Footer/Footer.tsx` — canonical `<Footer variant="landing" | "app">` with Apex identity (ASH-03, USH-M01)
- [x] 1.8 Create `web/src/shared/components/Footer/Footer.test.tsx` + `Footer.snap.tsx` — unit tests for both variants (ASH-03)
- [x] 1.9 Wire `<Footer variant="app">` into `web/src/shared/layouts/AppLayout.tsx` (ASH-03)
- [x] 1.10 Delete `web/src/shared/components/Footer.tsx` + `web/src/features/landing/components/Footer.tsx`; update all imports (ASH-03)

## Phase 2: z-index Tokens + AppLayout (PR 2)

- [ ] 2.1 Extend z-index scale in `web/src/index.css` — add `--z-sidebar`, `--z-topbar`, `--z-drawer-backdrop`, `--z-drawer`, `--z-fab` (ASH-02, DTK-A01)
- [ ] 2.2 Replace hardcoded `z-30`/`z-40`/`z-50`/`z-[N]` with `var(--z-*)` in `web/src/shared/layouts/AppLayout.tsx` (ASH-02)
- [ ] 2.3 Update MobileDrawer z-index to `var(--z-drawer)` + `var(--z-drawer-backdrop)` (USH-M02)
- [ ] 2.4 Replace `primary-button`/`secondary-button` → `<Button>` in AppLayout sidebar/nav (ASH-01)
- [ ] 2.5 Replace `surface-panel` → `<Card>` in AppLayout sidebar structure (ASH-01)
- [ ] 2.6 Update nav labels to Switzer `font-display` + OKLCH accent active state (USH-M03, DTK-M01)
- [ ] 2.7 Update `web/src/shared/layouts/AppLayout.test.tsx` for new component usage (ASH-01)

## Phase 3: Dangling Class Replacements (PR 3)

- [ ] 3.1 Replace `primary-button`/`secondary-button` → `<Button>` in NotFoundPage, ServerErrorPage, HistoryPage, HistoryDetailPage, AuthCallbackPage, LandingPage, PrivacyPage, EmptyState (UI-A01)
- [ ] 3.2 Replace `surface-panel` → `<Card variant="flat">` in AnalysisFeature, AnalysisResultView, HistoryDetailPage, HistoryDetailEditor, PrivacyPage, NotFoundPage, ServerErrorPage (UI-A01, UIP-M02)
- [ ] 3.3 Replace `label-chip` → `<Badge variant="neutral" size="sm">` across all files (UI-A01)
- [ ] 3.4 Replace `tech-chip` → `<Badge variant="brand" size="sm">` in AnalysisResultView, HistoryDetailPage (UI-A01)
- [ ] 3.5 Replace `field-surface` → `<Input>` or `bg-surface-container-low` in JobDescriptionForm, AnalysisResultView, HistoryDetailEditor, SettingsForm, SettingsFeature (UI-A01)
- [ ] 3.6 Replace `ghost-frame` → `<Card variant="flat">` in HistoryDetailEditor, SettingsForm (UI-A01)
- [ ] 3.7 Replace `font-headline` → `font-display` in SignInForm, SignUpForm, JobDescriptionForm, LandingPage (DTK-M01)
- [ ] 3.8 Remove `ghost-border` references — Card handles borders natively (UI-A01)
- [ ] 3.9 Replace `glass-panel` → `<Card variant="elevated">` in HeroSection (UI-A01)
- [ ] 3.10 Update `EmptyState` — replace `primary-button` with `<Button variant="primary">` (UIP-M01, UX-04)

## Phase 4: AuthShell + Landing Page (PR 4)

- [ ] 4.1 Redesign `web/src/features/auth/components/AuthShell.tsx` — replace glass-panel/ghost-border with `<Card variant="elevated">`; brand `<Link to="/">` in Switzer; remove inline footer (AUS-01, AUS-02)
- [ ] 4.2 Wire `<Footer variant="app">` into AuthShell (AUS-01)
- [ ] 4.3 Verify Apex components in `web/src/features/auth/components/SignInForm.tsx` + `SignUpForm.tsx` (AUS-01)
- [ ] 4.4 Replace button classes → `<Button>` in `web/src/features/landing/pages/LandingPage.tsx` (LAN-01, UI-M01)
- [ ] 4.5 Migrate `web/src/features/landing/components/Navbar.tsx` to Apex — Switzer, OKLCH, routes `/auth/sign-in`, `/auth/sign-up` (LAN-01, UI-M01)
- [ ] 4.6 Replace `surface-panel`/`ghost-frame` → `<Card>` in `web/src/features/landing/components/Cards.tsx` (LAN-01)
- [ ] 4.7 Wire `<Footer variant="landing">` into LandingPage — preserves SEO/GEO links (LAN-01, ASH-03)
- [ ] 4.8 Migrate `web/src/features/landing/pages/PrivacyPage.tsx` to Apex components (LAN-01)

## Phase 5: Page Skeletons + Cleanup (PR 5)

- [ ] 5.1 Create `web/src/features/analysis/components/AnalysisPageSkeleton.tsx` — mimics form + result card layout (UX-03)
- [ ] 5.2 Create `web/src/features/history/components/HistoryPageSkeleton.tsx` — mimics list/table with 4-5 rows (UX-03)
- [ ] 5.3 Create `web/src/features/history/components/HistoryDetailPageSkeleton.tsx` — mimics detail sections (UX-03)
- [ ] 5.4 Create `web/src/features/settings/components/SettingsPageSkeleton.tsx` — mimics settings form panels (UX-03)
- [ ] 5.5 Wire skeletons into page loading states — AnalysisPage, HistoryPage, HistoryDetailPage, SettingsPage (UX-03, UIP-M01)
- [ ] 5.6 Delete `web/src/shared/components/LoadingSkeleton.tsx` — remove all imports (UIP-M01)
- [ ] 5.7 Run `npx impeccable critique` on each redesigned page; fix all CRITICAL issues (LAN-02)
- [ ] 5.8 Run `npx impeccable detect web/src/` — verify zero dangling class refs (UI-A01)
- [ ] 5.9 Update snapshot tests for all modified components
- [ ] 5.10 Run full suite: `pnpm test` + `pnpm run lint` + `tsc --noEmit`
