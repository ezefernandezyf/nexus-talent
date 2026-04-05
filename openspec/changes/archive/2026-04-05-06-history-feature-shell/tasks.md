# Tasks: History Feature Shell

## Phase 1: Shell Scaffolding

- [x] 1.1 Create `src/features/history/index.ts` plus `src/features/history/components/` and `src/features/history/hooks/` exports.
- [x] 1.2 Add a stable `id="analysis"` anchor to `src/features/analysis/AnalysisFeature.tsx` so the empty-state CTA has a target.

## Phase 2: UI and Data Wiring

- [x] 2.1 Implement `src/features/history/HistoryFeature.tsx` to read `useAnalysisHistory` and branch on loading, empty, error, and success states.
- [x] 2.2 Implement `src/features/history/components/HistoryCard.tsx` to show title fallback, saved date, summary snippet, top 5 skills, and a delete action using the existing surface and chip styles.
- [x] 2.3 Implement `src/features/history/components/HistoryEmptyState.tsx` and `HistoryLoadingState.tsx` with Precision Instrument primitives and a CTA that jumps to `#analysis`.
- [x] 2.4 Implement `src/features/history/hooks/useDeleteAnalysis.ts` to call `repository.delete(id)` and invalidate `ANALYSIS_HISTORY_QUERY_KEY`.
- [x] 2.5 Mount the history shell from `src/App.tsx` below `AnalysisFeature` so the section appears in the same dashboard flow.

## Phase 3: Testing and Refactor

- [x] 3.1 RED: add `src/features/history/components/HistoryCard.test.tsx` and `src/features/history/hooks/useDeleteAnalysis.test.ts` for title fallback, skill trimming, and cache invalidation.
- [x] 3.2 GREEN: add `src/features/history/HistoryFeature.test.tsx` for loading, empty, error, success, and delete-last-item transitions.
- [x] 3.3 REFACTOR: extract any shared history formatting helpers into `src/features/history/` exports and verify the layout stays surface-based with no 1px borders.