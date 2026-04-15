# Tasks: Module 15 - History Interactions

## Deferred
- Keep list redesign, export, shell/navigation, and real pagination out of this change.
- Do not persist `matchIndex`; the score chip remains derived UI only.

## Phase 1: Persistence Contract
- [x] 1.1 Extend `src/lib/repositories/analysis-repository.ts` with an `AnalysisUpdatePatch` type and `update(id, patch)` contract.
- [x] 1.2 Implement `update()` in `src/lib/repositories/local-analysis-repository.ts` to merge `displayName`/`notes`, preserve existing fields, and return `null` when the record is missing.
- [x] 1.3 Allow the persisted metadata on `SavedJobAnalysis` in `src/schemas/job-analysis.ts`, then re-export any new types through `src/lib/repositories/index.ts` if needed.

## Phase 2: Detail Editor Wiring
- [x] 2.1 Create `src/features/history/hooks/useUpdateAnalysis.ts` with a React Query mutation that invalidates the history/detail queries on success.
- [x] 2.2 Add `src/features/history/components/HistoryDetailEditor.tsx` as a controlled rename/notes form with save/cancel actions and inline pending/success/error states.
- [x] 2.3 Wire `src/pages/HistoryDetailPage.tsx` to keep the current loading/not-found route behavior, hydrate the editor from the saved record, and show save feedback without losing the draft on failure.
- [x] 2.4 Export the new hook/component from `src/features/history/hooks/index.ts`, `src/features/history/components/index.ts`, and `src/features/history/index.ts` as required.

## Phase 3: Verification
- [x] 3.1 Extend `src/lib/repositories/local-analysis-repository.test.ts` with update-merge, missing-record, and preserved-field cases.
- [x] 3.2 Extend `src/schemas/job-analysis.test.ts` for persisted edit metadata acceptance and malformed payload rejection.
- [x] 3.3 Add `src/features/history/hooks/useUpdateAnalysis.test.tsx` for mutation success and query invalidation.
- [x] 3.4 Add `src/pages/HistoryDetailPage.test.tsx` for loading, not-found, save-success, save-failure, and draft-retention scenarios.