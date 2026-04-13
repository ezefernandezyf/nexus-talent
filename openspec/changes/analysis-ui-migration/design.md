# Design: Analysis UI Migration

## Technical Approach

This change keeps the existing analysis pipeline intact and updates only the presentation layer to match the Stitch reference assets. `AnalysisPage` will own the page composition, `AnalysisFeature` will keep controlling the current async states, and the form/result components will be restyled and lightly restructured to mirror the reference hierarchy.

## Architecture Decisions

### Decision: Keep analysis logic in the current hooks
**Choice**: Leave `useJobAnalysis`, `useAnalysisRepository`, and the validation schemas unchanged.
**Alternatives considered**: Move state orchestration into the page or introduce a new container hook.
**Rationale**: The logic is already stable and covered; this slice is a visual migration, so moving data flow would add risk without improving the outcome.

### Decision: Use page composition as the top-level layout boundary
**Choice**: Let `src/pages/AnalysisPage.tsx` define the intro section, analysis surface, and supporting cards.
**Alternatives considered**: Push all layout into `AnalysisFeature` or split the page into several route-level wrappers.
**Rationale**: The page is the correct place for reference-aligned hierarchy and keeps feature state separate from shell composition.

### Decision: Preserve the existing feature state model
**Choice**: Keep the current pending/error/result/empty branching inside `AnalysisFeature`.
**Alternatives considered**: Replace it with a unified view model or suspense-driven branch.
**Rationale**: The current branching already maps cleanly to the required UX states and is easier to verify against the existing tests.

### Decision: Limit component changes to presentational structure
**Choice**: Adjust `JobDescriptionForm` and `AnalysisResultView` markup, spacing, labels, and panel grouping only.
**Alternatives considered**: Rewrite these components around new abstractions or extract a new design-system layer.
**Rationale**: The reference assets require fidelity, not new abstractions. Small, local edits reduce regression risk.

## Data Flow

The runtime flow stays the same:

    AnalysisPage ──→ AnalysisFeature ──→ useJobAnalysis
         │                    │                 │
         │                    ├── pending/error/result/empty
         │                    └── form submit → analysis request
         └── supporting cards and intro copy

`AnalysisFeature` continues to render the correct state. The page and child components only change the visible hierarchy and surfaces around that flow.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/pages/AnalysisPage.tsx` | Modify | Rebuild page-level hierarchy and supporting cards to match the reference layout. |
| `src/features/analysis/AnalysisFeature.tsx` | Modify | Align the feature shell and state surfaces with the visual system. |
| `src/features/analysis/components/JobDescriptionForm.tsx` | Modify | Update spacing, grouping, and field presentation for the reference form. |
| `src/features/analysis/components/AnalysisResultView.tsx` | Modify | Restructure summary, skills, enrichment, and outreach sections for parity. |
| `src/features/analysis/components/*` | Modify/New | Add small presentational pieces only if needed to keep the UI clean. |

## Interfaces / Contracts

No TypeScript contract changes are required. The existing request/result shapes remain the source of truth.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Page and component rendering | Update React Testing Library coverage to assert the reference-aligned structure and visible states. |
| Integration | Existing analysis flow | Reuse current hook tests to confirm the UI edits do not alter validation, pending, or result behavior. |
| E2E | Visual accessibility of the flow | Verify the analysis page still exposes form, loading, error, empty, and result states end to end. |

## Migration / Rollout

No migration required.

## Open Questions

- [ ] None.
