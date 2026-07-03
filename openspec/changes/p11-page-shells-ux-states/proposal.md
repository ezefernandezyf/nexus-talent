# Proposal: P11 — Page Shells + UX States

## Intent
P10 removed `@layer components` (-204 lines), leaving 50+ dangling CSS references (`primary-button`, `surface-panel`, `label-chip`, `tech-chip`, `ghost-frame`, `field-surface`) that render broken. ErrorBoundary returns `null` on catch. Three footers exist. Z-index scale is defined but unused. P11 applies the Apex design system to all page shells and standardizes UX states across four feature pages.

## Scope

### In Scope
- Fix 50+ dangling CSS → Apex components (Button, Card, Badge, Input)
- ErrorBoundary: fallback UI + retry; per-route `errorElement` boundaries
- AppLayout: new components; z-index via CSS custom properties
- AuthShell: Apex redesign (sign-in, sign-up, OAuth callback)
- Landing page: full visual redesign; SEO/GEO preserved
- Footer: 3→1 canonical (landing SEO + app minimal variants)
- Page skeletons: Analysis, History, HistoryDetail, Settings
- Empty states: "No analysis yet" (CTA), "No history found", "No results"
- MobileDrawer: z-index integration; remove duplication

### Out of Scope
Animations (P12), performance (P13), new features, backend changes.

## Capabilities

### New
- `ux-states`: Per-route error boundaries + retry; page skeletons; empty states with CTAs
- `app-shell-apex`: AppLayout with Apex components; z-index token enforcement
- `auth-shell-apex`: Auth pages with Apex identity; unified branding
- `landing-apex`: Landing page visual redesign; SEO/GEO preserved

### Modified
- `ui-shell`: Footer consolidation; mobile drawer z-index; identity → Apex
- `design-tokens`: Z-index scale enforced; font doc → Switzer + Geist
- `ui-parity`: State feedback → Apex Skeleton; no-line with Apex surfaces
- `ui`: Landing layout → Apex; route paths corrected

## Approach
Incremental: fix ErrorBoundary (safety net), migrate AppLayout + z-index tokens, add per-route error boundaries, replace 50+ dangling classes, create skeletons + empty states, redesign AuthShell + LandingPage, consolidate footer. `/impeccable critique` per page.

## Affected Areas

| Package | Key Areas | Impact |
|---------|-----------|--------|
| `web` | `shared/layouts/AppLayout.tsx` | Rewrite |
| `web` | `core/components/ErrorBoundary.tsx` | Rewrite |
| `web` | `shared/components/` (EmptyState, Footer, LoadingSkeleton, FeaturePageShell) | Migrate/extend |
| `web` | `features/auth/` | AuthShell redesign |
| `web` | `features/landing/` | Landing + Footer |
| `web` | `features/{analysis,history,settings}/` | Class fixes + skeletons |
| `web` | `index.css` | Cleanup |
| `server`, `shared`, `e2e` | — | No changes |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Broken styling from 50+ replacements | High | Fix first; verify each page renders |
| z-index regressions on mobile | Medium | Explicit stacking test |
| SEO/GEO content loss on landing redesign | Low | Extract headings/FAQ before UX changes |

## Rollback Plan
Branch `feat/p11-page-shells-ux-states` from `develop`. Atomic commits. Revert merge. Class fixes independently cherry-pickable.

## Dependencies
P9 tokens + P10 components (Button, Card, Badge, Input, Skeleton, Modal, Dropdown) ✅. React Router 7 `errorElement` ✅.

## Success Criteria
- [ ] Zero dangling CSS class references in codebase
- [ ] ErrorBoundary renders fallback UI with retry (not null+redirect)
- [ ] Per-route `errorElement` on each feature route
- [ ] 4 page-specific loading skeletons (no inline text)
- [ ] Empty states with clear CTAs
- [ ] AppLayout: Apex components; z-index from CSS custom properties
- [ ] 1 canonical Footer (landing + app variants)
- [ ] AuthShell + LandingPage pass `/impeccable critique`
- [ ] Lint + typecheck pass
