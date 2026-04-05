# Design: 05 Persistence / History

## Technical Approach

Phase 05 introduces a thin persistence boundary under `src/lib/repositories/` and keeps the app local-first. The feature will persist the same canonical analysis payload already validated by `src/schemas/job-analysis.ts`, but storage will be handled only through an `AnalysisRepository` interface. For this phase, `LocalAnalysisRepository` stores versioned records in `localStorage`; Phase 07 will add `SupabaseAnalysisRepository` behind the same contract without changing feature code.

## Architecture Decisions

| Decision | Choice | Alternatives | Rationale |
|---|---|---|---|
| Repository boundary | Define `AnalysisRepository` in `src/lib/repositories/analysis-repository.ts` | Call `localStorage` directly from hooks; add Supabase now | Keeps UI and storage decoupled, matches the repo pattern already used for AI orchestration, and makes the Phase 07 swap mechanical. |
| Storage entity | Persist `JobAnalysisResult` plus `id`, `createdAt`, and `jobDescription` | Store only the AI result; add DB-specific metadata early | Preserves the original input for history, supports ordering by timestamp, and mirrors the future table shape without committing to Supabase yet. |
| Validation point | Add a strict `SAVED_JOB_ANALYSIS_SCHEMA` next to the existing job analysis schemas | Trust JSON serialization; validate only on read | Validates both read and write paths, prevents corrupt storage from leaking into UI state, and keeps the canonical schema in one place. |
| Persistence timing | Save successful analyses from the query success path, not from the render layer | Add a manual save button first | Keeps persistence inside the data layer, avoids UI coupling, and ensures history is populated immediately for the later history screen. |

## Data Flow

```text
JobDescriptionForm
  -> useJobAnalysis
  -> createJobAnalysisClient
  -> JobAnalysisResult (validated)
  -> AnalysisRepository.save()
  -> LocalAnalysisRepository
  -> localStorage

useAnalysisHistory (future shell)
  -> AnalysisRepository.getAll()
  -> LocalAnalysisRepository
  -> localStorage
  -> sorted analysis list
```

The repository returns serializable entities only. On read, `getAll()` and `getById()` re-validate stored JSON through Zod; on write, `save()` generates the `id` and `createdAt` values before persisting.

## File Changes

| File | Action | Description |
|---|---|---|
| `src/schemas/job-analysis.ts` | Modify | Add `SAVED_JOB_ANALYSIS_SCHEMA` and the persisted analysis type that extends `JobAnalysisResult`. |
| `src/lib/repositories/analysis-repository.ts` | Create | Repository interface and shared types for persistence. |
| `src/lib/repositories/local-analysis-repository.ts` | Create | `localStorage` implementation with JSON serialization, sorted reads, and delete-by-id. |
| `src/lib/repositories/index.ts` | Create | Barrel exports for repository contracts and implementations. |
| `src/features/analysis/hooks/useJobAnalysis.ts` | Modify | Inject the repository and persist successful analyses after validation. |
| `src/features/analysis/hooks/useAnalysisHistory.ts` | Create | Hook for listing stored analyses for the future history shell. |

## Interfaces / Contracts

```ts
export interface AnalysisRepository {
  save(jobDescription: string, result: JobAnalysisResult): Promise<SavedJobAnalysis>;
  getAll(): Promise<SavedJobAnalysis[]>;
  getById(id: string): Promise<SavedJobAnalysis | null>;
  delete(id: string): Promise<void>;
}

export type SavedJobAnalysis = JobAnalysisResult & {
  id: string;
  createdAt: string;
  jobDescription: string;
};
```

`LocalAnalysisRepository` SHOULD use a versioned storage key, default to descending `createdAt` order, and treat missing/invalid storage as an empty collection rather than a crash.

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Unit | Zod schema acceptance/rejection for persisted entities | Add schema tests for valid records, missing fields, and malformed timestamps. |
| Unit | Repository CRUD and serialization | Mock `localStorage`, verify `save`, `getAll`, `getById`, `delete`, and sort order. |
| Integration | Hook wiring | Extend `useJobAnalysis.test.tsx` to confirm successful analyses trigger persistence and failures do not. |

## Migration / Rollout

No migration required for users. This phase only writes a new browser storage key and can be shipped without Supabase credentials. Phase 07 will read the same logical shape from a database-backed repository and can migrate old local data later if needed.

## Open Questions

- Should `useJobAnalysis` surface persistence failures separately, or should a save failure be silently ignored while the analysis result still renders?
- Should the future history shell reuse `src/features/analysis/hooks/useAnalysisHistory.ts`, or should it move to `src/features/history/` once that feature lands?