# Tasks: Analysis UI Migration

## Phase 1: Page Shell
- [x] 1.1 Rebuild `src/pages/AnalysisPage.tsx` with the reference intro, supporting cards, and `AnalysisFeature` placement.
- [x] 1.2 Update `src/features/analysis/AnalysisFeature.tsx` layout wrappers so loading, empty, error, and result states occupy the same shell surface.

## Phase 2: Presentational Components
- [x] 2.1 Restyle `src/features/analysis/components/JobDescriptionForm.tsx` to match reference grouping, spacing, and field surfaces without changing submit behavior.
- [x] 2.2 Restyle `src/features/analysis/components/AnalysisResultView.tsx` for the summary, skill matrix, GitHub enrichment, and outreach editor hierarchy.
- [x] 2.3 Add only minimal presentational subcomponents if needed; keep hooks, schemas, and exports untouched.

## Phase 3: Test Coverage
- [x] 3.1 Add `src/pages/AnalysisPage.test.tsx` to assert the reference page hierarchy and supporting cards render.
- [x] 3.2 Update `src/features/analysis/AnalysisFeature.test.tsx` to cover empty, loading, error, and success states after the layout changes.
- [x] 3.3 Update `src/features/analysis/components/JobDescriptionForm.test.tsx` and `src/features/analysis/components/AnalysisResultView.test.tsx` to confirm the UI changes preserve validation, edit, copy, export, and enrichment behavior.

## Phase 4: Cleanup
- [x] 4.1 Remove obsolete classes or markup that no longer match the reference layout.
- [x] 4.2 Verify no hook, schema, repository, or export logic changed as part of the visual migration.
