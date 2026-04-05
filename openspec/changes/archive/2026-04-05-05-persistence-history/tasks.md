# Tasks: 05 Persistence / History

## Phase 1: Persistence Contract

- [x] 1.1 Add `SAVED_JOB_ANALYSIS_SCHEMA` and `SavedJobAnalysis` to `src/schemas/job-analysis.ts`, extending `JOB_ANALYSIS_RESULT_SCHEMA` with `id`, `createdAt`, and `jobDescription`.
- [x] 1.2 Create `src/lib/repositories/analysis-repository.ts` with `AnalysisRepository`, the persisted entity type, and a versioned storage key constant.
- [x] 1.3 Create `src/lib/repositories/local-analysis-repository.ts` with `save`, `getAll`, `getById`, and `delete` backed by `localStorage`, including JSON parse/serialize and descending `createdAt` order.
- [x] 1.4 Add `src/lib/repositories/index.ts` barrel exports for the repository contract and local implementation.

## Phase 2: Hook Wiring

- [x] 2.1 Update `src/features/analysis/hooks/useJobAnalysis.ts` to accept a repository dependency and persist successful analyses from the mutation success path.
- [x] 2.2 Create `src/features/analysis/hooks/useAnalysisHistory.ts` to read, sort, and expose saved analyses through `AnalysisRepository` for the future history shell.
- [x] 2.3 Export the new hook from `src/features/analysis/index.ts` so feature consumers can import it from the feature boundary.

## Phase 3: Testing / Verification

- [x] 3.1 RED: Extend `src/schemas/job-analysis.test.ts` with persisted-entity cases for valid records, missing `id`/`createdAt`, and malformed ISO timestamps.
- [x] 3.2 RED/GREEN: Add `src/lib/repositories/local-analysis-repository.test.ts` to verify save/getAll/getById/delete, descending sort, UUID generation, and invalid-storage fallback.
- [x] 3.3 RED/GREEN: Extend `src/features/analysis/hooks/useJobAnalysis.test.tsx` so a successful analysis persists once and network/validation failures do not write to storage.
- [x] 3.4 RED/GREEN: Add `src/features/analysis/hooks/useAnalysisHistory.test.ts` to cover empty-state reads and populated history results.
- [x] 3.5 REFACTOR: Remove duplicated repository setup in tests and keep shared fixtures aligned with the persisted schema.