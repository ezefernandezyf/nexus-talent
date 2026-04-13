# Proposal: Analysis UI Migration

## Intent

The Analysis module already works end to end, but its page and feature surfaces are visually behind the Stitch reference assets. This change aligns the analysis entry form, result view, and page shell with the reference HTML without changing analysis logic.

## Scope

### In Scope
- Rebuild `src/pages/AnalysisPage.tsx` and the analysis feature shell to match the reference layout.
- Align `src/features/analysis/components/JobDescriptionForm.tsx` and `src/features/analysis/components/AnalysisResultView.tsx` with the Stitch assets.
- Polish loading, empty, success, and error states for the analysis flow.

### Out of Scope
- No changes to `useJobAnalysis`, AI orchestration, validation schemas, or history persistence.
- No new features, exports, or tone/prompt integration work.
- No backend or Supabase changes.

## Approach

Use direct HTML-to-React migration: extract the reference structure, componentize the visible blocks, and keep all current logic hooks and validation contracts intact. The change stays presentation-only and reuses the existing analysis pipeline.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/pages/AnalysisPage.tsx` | Modified | Page composition and reference-aligned layout. |
| `src/features/analysis/AnalysisFeature.tsx` | Modified | Shell wiring for loading, error, and result states. |
| `src/features/analysis/components/JobDescriptionForm.tsx` | Modified | Form layout and styling parity. |
| `src/features/analysis/components/AnalysisResultView.tsx` | Modified | Result card structure and visual parity. |
| `src/features/analysis/components/*` | Modified/New | Small presentational pieces if needed. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Visual drift from reference assets | High | Keep changes tied to the Stitch HTML and avoid inventing layout. |
| Accidentally touching logic | Medium | Confine edits to presentation and verify existing hook tests. |
| Responsive gaps on mobile | Medium | Validate desktop-first parity, then verify breakpoints. |

## Rollback Plan

Revert the page, feature shell, and component presentation changes to restore the current working Analysis flow. Keep the existing hooks, schemas, and repositories untouched.

## Dependencies

- Reference assets in `docs/assets/`
- Existing analysis validation and orchestration pipeline

## Success Criteria

- [ ] Analysis page and feature UI match the Stitch reference structure and hierarchy.
- [ ] Existing analysis logic, validation, and exports continue to work unchanged.
- [ ] Loading, empty, success, and error states remain visible and polished.
