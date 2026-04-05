# Proposal: 05 Persistence / History

## Intent
Enable saving and retrieving AI-analyzed job descriptions to support a historical view of a user's progress. This phase establishes the data contracts and local persistence, explicitly deferring cloud database integration (Supabase) to Phase 07 to circumvent anonymous data migration complexities.

## Scope

### In Scope
- Define an abstract `AnalysisRepository` interface for data access.
- Implement `LocalAnalysisRepository` using `localStorage`.
- Define the persistent data schema extending `JobAnalysisResult`.
- Integrate repository calls for saving/listing analyses into the app.

### Out of Scope
- Supabase project setup, tables, and RLS policies (Deferred to Phase 07).
- User authentication and cloud syncing.
- Complex search/filtering of historical data.

## Approach
Adopt a **Local-First Repository Pattern**. We will decouple the UI from the storage mechanism by defining a strict repository contract (`AnalysisRepository`). For this phase, we implement a `localStorage`-backed version. This allows us to build and test the History UI immediately while ensuring a seamless, zero-UI-change swap to `SupabaseAnalysisRepository` once Auth is implemented.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/lib/repositories/` | New | Interfaces and `LocalAnalysisRepository` implementation. |
| `src/schemas/job-analysis.ts` | Modified | Add entity-specific fields (`id`, `createdAt`). |
| `src/features/analysis/hooks/` | Modified | Wire `useJobAnalysis` and history hooks to the repository. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| LocalStorage quota limits | Medium | Implement basic LRU eviction or limit saved items if necessary. |
| Schema mismatch with future DB | Low | Design local schema to perfectly mirror the planned PostgreSQL schema. |

## Rollback Plan
Revert the repository abstraction and remove `localStorage` integration, falling back to strictly in-memory state if the pattern proves too complex before cloud adoption.

## Dependencies
- No new external dependencies required for this phase.

## Success Criteria
- [ ] `AnalysisRepository` interface is cleanly defined.
- [ ] Analyzed jobs are saved and persist across browser reloads.
- [ ] Unit tests validate the serialization of `LocalAnalysisRepository`.