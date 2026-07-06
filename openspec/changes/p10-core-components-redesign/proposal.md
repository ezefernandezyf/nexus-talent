# Proposal: P10 — Core Components Redesign

## Intent

Rebuild 10 core component families from scratch using the "Apex" design system (Deep Teal + Warm Amber OKLCH palette, Switzer + Geist fonts). Current V1.1 components render through backward-compat CSS aliases and `@layer components` classes — they look like "The Signal" system, not Apex. The migration unblocks all downstream V1.2 UI work (P11–P13).

## Scope

### In Scope
- **12 component families redesigned** (see Capabilities below) — each with taste-skill visual direction, `/impeccable shape` before coding, `/impeccable audit` after
- Snapshot visual tests + unit logic tests for every component
- Dark AND light mode, mobile-first responsive, WCAG 2.2 AA
- Zustand for Toast state, React Context for Modal/Drawer
- Replace old `@layer components` CSS classes as each component ships

### Out of Scope
- Page-level components (Hero, Footer, FeaturePageShell, PageHeader, EmptyState) — P11
- Layout shells (AppLayout, AuthShell) — P11
- Motion/micro-interactions beyond component enter/exit — P12
- Consumer migration to new components — handled per-batch in apply phase
- E2E test updates — separate task per batch

## Capabilities

### New Capabilities
- `toast-system`: Toast/notification, Zustand store, provider, enter/exit animations
- `dropdown-menu`: Dropdown, Select, Menu — focus trap, keyboard nav, portal positioning
- `tabs-toggle`: Tabs with panel switching, Toggle Group with multi-select
- `tooltip-popover`: Tooltip (hover) and Popover (click), positioning engine, arrow
- `skeleton-loader`: Shape primitives (text, circle, rect), dark/light variants, pulse animation

### Modified Capabilities
- `ui`: Button (4 variants × 3 sizes), Input/Textarea (icon support, focus/error/disabled), Card (flat/elevated/interactive), Badge/Tag/Status (new Apex variants), Modal (Apex tokens, focus trap)
- `ui-shell`: MobileDrawer (Apex surface tokens, motion/react migration)
- `design-tokens`: Reflect Apex palette (Switzer+Geist, Deep Teal+Warm Amber) — current spec references old Signal fonts

## Approach

| Batch | PR | Components | Lines (est.) | Key Risk |
|-------|-----|-----------|-------------|----------|
| **Foundation** | PR #1 | Button, Input/Textarea, Card + server lint fix | ~300 | Consumer API breakage |
| **Mid-level** | PR #2 | Modal/Drawer, Badge/Tag, Toast, Dropdown/Select, Tabs, Tooltip/Popover | ~500 | Focus trap + portal z-index conflicts |
| **Polish** | PR #3 | Skeleton loaders, all snapshot tests, final audit, remove `@layer components` | ~250 | Snapshot churn |

**Pre-task**: Fix 4 type errors in `server/src/history/history.service.ts` (blocks CI).

Migration per batch: old components stay untouched — consumers get new imports only after batch PR merges. Each batch removes its matching `@layer components` CSS classes.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `web/src/shared/components/` | Rebuild | 12 component families replaced |
| `web/src/index.css` | Modified | Remove `@layer components` classes per batch |
| `server/src/history/history.service.ts` | Fix | 4 type errors (`as object` → `JsonValue`) |
| `web/src/features/*/` | Indirect | Consumers import new components after batch merge |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| motion/react API breakage vs framer-motion | Med | Test Modal/Drawer animations in PR #2 isolation |
| Snapshot test flakiness across dark/light | Med | Standardize viewport + theme in test setup |
| Consumer import paths break during coexistence | Low | Each batch is self-contained; old components untouched until batch ships |
| E2E selectors break after component rebuild | Med | Update E2E selectors per batch; run Playwright before merge |

## Rollback Plan

Each PR is independently revertible. If a batch fails: revert the PR merge, old components remain intact, consumers keep working. For the `@layer components` CSS removal: those classes are removed only AFTER the new component for that family ships — never before.

## Dependencies

- P9 (Design System Foundation) — Apex tokens must be in `@theme` (confirmed present)
- Pre-task server lint fix — blocks CI, required before PR #1

## Success Criteria

- [ ] All 12 component families render correctly in dark AND light mode
- [ ] Snapshot tests pass for every component
- [ ] Unit tests cover all component logic (click handlers, state transitions, accessibility)
- [ ] Zero `@layer components` classes remain in `index.css`
- [ ] `pnpm lint && pnpm test` pass on every batch PR
- [ ] `/impeccable audit` scores ≥ 85 on every batch
- [ ] WCAG 2.2 AA: focus indicators visible, contrast ≥ 4.5:1 on all interactive elements
