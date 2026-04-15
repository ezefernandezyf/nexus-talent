# Design: Module 19 - UI Parity and Responsive Polish

## Technical Approach

Apply small layout and spacing adjustments to the shared page shell, headers, and feature surfaces that most visibly diverge from the reference assets. Prefer shared-wrapper fixes first, then correct page-specific action groups and state surfaces where needed.

## Architecture Decisions

### Decision: Fix shared wrappers before page-specific surfaces

**Choice**: Tune `FeaturePageShell`, `PageHeader`, and `EmptyState` first.
**Alternatives considered**: Patch every page independently from the start.
**Rationale**: Most spacing and hierarchy issues originate from shared wrappers, so adjusting them first keeps the result consistent and reduces duplicated styling.

### Decision: Keep the change visual-only

**Choice**: Do not change routes, state flow, or data contracts.
**Alternatives considered**: Add new shells, new nav patterns, or responsive feature switches.
**Rationale**: The module is explicitly parity/polish; feature or navigation work belongs elsewhere.

## Data Flow

User -> Shared shell -> Feature page wrapper -> Page-specific surface

The flow stays the same; only spacing, wrapping, and visual hierarchy are adjusted.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/components/ui/FeaturePageShell.tsx` | Modify | Adjust shared width/spacing. |
| `src/components/ui/PageHeader.tsx` | Modify | Improve responsive header and action stacking. |
| `src/components/ui/EmptyState.tsx` | Modify | Align empty-state rhythm and CTA layout. |
| `src/features/analysis/components/JobDescriptionForm.tsx` | Modify | Refine mobile stacking and control spacing. |
| `src/features/analysis/components/AnalysisResultView.tsx` | Modify | Tighten action toolbar and chip wrapping. |
| `src/features/history/components/HistoryList.tsx` | Modify | Improve mobile/desktop row rhythm. |
| `src/features/settings/SettingsFeature.tsx` | Modify | Smooth section spacing and responsive card flow. |

## Interfaces / Contracts

No new interfaces required.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Regression | Page rendering on mobile/desktop | Re-run existing page tests after spacing changes. |
| Regression | Empty/loading/error states | Verify the state surfaces still render and remain readable. |
| Visual sanity | Shell consistency | Compare the updated screens against the reference assets. |

## Migration / Rollout

No migration required.

## Open Questions

- None.