# Tasks: Module 05 — History Repository & UI Shell

Implementation checklist. Mark tasks as completed as you implement them.

- [x] 1. Define `AnalysisRepository` contract (interface/types) and place under `src/lib/repositories/`.
- [x] 2. Implement `LocalAnalysisRepository` at `src/lib/repositories/local-analysis-repository.ts` using `localStorage`.
- [x] 3. Add unit tests for `LocalAnalysisRepository` (CRUD + ordering) at `src/lib/repositories/local-analysis-repository.test.ts`.
- [x] 4. Create `useHistory` hook at `src/features/history/hooks/useHistory.ts` (uses repository).
- [x] 5. Wire `useHistory` into `src/features/history/HistoryFeature.tsx` and ensure loading/empty/error states render correctly.
- [x] 6. Add UI tests for `HistoryFeature` verifying loading, empty, and populated flows.
- [x] 7. Run tests and fix issues until green.
- [ ] 8. Update `openspec/changes/active/2026-04-10-module-05-history-repo/tasks.md` with [x] marks when done.
- [ ] 9. Open a PR with description linking to this change, the spec and the tests.
