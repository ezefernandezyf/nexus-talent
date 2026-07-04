# Proposal: P11quater — Lovable Pixel-Perfect Alignment

## Intent

P11ter adapted the Lovable "Editorial Precision" visual direction but left 12+ deviations from the reference. This change closes every gap, pixel-matching the Lovable reference at `/tmp/editorial-lens` while preserving Nexus Talent's real data, business logic, and architecture. Zero business logic touched — visual + structural only.

## Scope

### In Scope
- Token realignment: rename `--color-brand/on-surface/outline` to match Lovable's `--accent/--text-primary/--border/--surface/--surface-muted` naming
- Button API migration: `variant="primary/secondary/ghost/danger"` → `"filled/outline/ghost"`, drop `iconPrefix/iconSuffix/loading`
- Card API migration: `variant="flat/elevated/interactive"` + compound sub-components → `interactive?: boolean, muted?: boolean`
- New primitives: `Label` component (text-sm font-medium mb-2)
- `Textarea`: extract from unified Input as standalone component matching Lovable styles
- Landing: Hero (filled CTA, blur-left), Manifesto (radial gradient bg), Features (bg-surface-muted + bg-accent-muted flagship), FAQ (Lovable content + Plus/Minus), CTA (bg-surface-muted + filled button)
- Auth: 5/7 split → 12-col grid (5 left brand sidebar + 7 right form)
- Analysis/History/Settings: numbered editorial sections matching Lovable layouts
- Footer: replace generic variant with `MarketingFooter` from Lovable reference

### Out of Scope
- Business logic, API calls, hooks, React Query, stores
- Server, Prisma, Zod contracts
- JWT auth cookies
- MobileDrawer, 404/500/Privacy pages
- Logic tests (snapshots only updated)

## Capabilities

### Modified Capabilities
- `design-tokens`: rename all tokens to Lovable naming convention, add `--accent-muted`
- `ui`: Button variant rename + API simplify, Card API simplify, new Label + standalone Textarea
- `ui-shell`: AppLayout editorial nav, MarketingFooter replacing generic Footer
- `landing-apex`: hero/manifesto/features/FAQ/CTA matching Lovable reference exactly
- `auth-shell-apex`: 12-col grid with brand statement sidebar
- `app-shell-apex`: numbered section layouts for Analysis, History, Settings

### New Capabilities
- None (all work modifies existing capabilities; no new domains introduced)

## Approach

Two PRs via feature-branch-chain targeting `develop`:

| PR | Scope | Files |
|----|-------|-------|
| PR 1: primitives + tokens | Token rename, Button/Card/Badge/Input/Textarea/Label alignment | `index.css`, `Button.tsx`, `Card.tsx`, `Badge.tsx`, `Input.tsx`, new `Textarea.tsx`, new `Label.tsx`, snapshots |
| PR 2: pages + layouts | Landing sections, Auth, Analysis, History, Settings, Footer | `LandingPage.tsx`, `FAQ.tsx`, `AuthShell.tsx`, `AnalysisPage.tsx`, `HistoryPage.tsx`, `SettingsPage.tsx`, `Footer.tsx`, snapshots |

**Branch**: `feat/p11quater-lovable-alignment`  
**Tools**: Run `npx impeccable detect` per PR, update all snapshots via `--update`.

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Token rename → cascading visual diffs | High | Batch search-replace with regex audit; update index.css first, then components |
| Card API change breaks 30+ consumer sites | Medium | Keep old `Card.Header/Body/Footer` as deprecated re-exports in PR 1; remove in PR 2 |
| Snapshot churn masks real regressions | Low | Commit snapshots first, then review diff; keep logic tests unchanged |

## Rollback Plan

`git revert` each PR merge commit. Token rename is the riskiest — revert restores old `--color-brand` names everywhere.

## Dependencies

- Completed: P11ter (Editorial Precision adaptation)
- Reference: `/tmp/editorial-lens` cloned from Lovable

## Success Criteria

- [ ] All tokens match Lovable naming (`--accent`, `--text-primary`, `--surface-muted`, etc.)
- [ ] Button API: `filled/outline/ghost` with `sm/md/lg`
- [ ] Card API: `interactive` + `muted` booleans
- [ ] `Label` component exists with correct styles
- [ ] `Textarea` standalone component matches Lovable
- [ ] Landing visual layout matches Lovable reference in all 6 sections
- [ ] Auth uses 12-col grid with brand sidebar
- [ ] Analysis/History/Settings use numbered editorial sections
- [ ] Zero business logic changes (verified by unchanged logic tests)
- [ ] `npx impeccable detect` passes with 0 anti-patterns
- [ ] All snapshots updated, 0 logic test regressions
