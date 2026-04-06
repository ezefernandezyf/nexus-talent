# Design: History Feature Shell

## Technical Approach

Add a dedicated `src/features/history/` shell that renders the saved-analysis timeline, its loading/empty/error states, and inline delete actions. The shell will reuse `useAnalysisHistory` as the read path and the existing `AnalysisRepository.delete` contract through a small mutation hook in the history feature. No persistence code moves yet; the history layer remains a thin UI wrapper over the current analysis repository.

The shell will reuse the existing design primitives already established in the app: `surface-panel`, `ghost-frame`, `label-chip`, `tech-chip`, and the gradient `primary-button`. The list will be embedded as a full-width section below the current analysis flow, and the empty-state CTA will jump to the analysis form via `#analysis`.

## Architecture Decisions

| Decision | Choice | Alternatives considered | Rationale |
|---|---|---|---|
| Data ownership | Reuse `useAnalysisHistory` and `createLocalAnalysisRepository` from the analysis layer | Move repo/hook into `src/features/history/`; duplicate read access | Phase 05 already owns persistence and sorting. Keeping history as a shell avoids boundary churn and keeps the change small. |
| Delete flow | Add `useDeleteAnalysis` in `src/features/history/hooks/` with `useMutation` + `useQueryClient` | Call `repository.delete` directly in the component; extend `useAnalysisHistory` to expose mutation state | A dedicated hook keeps components presentational and centralizes cache invalidation in one place. |
| Page composition | Render history as a separate section in `App.tsx` under the current analysis grid | New route; modal/sidebar treatment | The app has no router today, and a stacked dashboard keeps the analysis workflow primary while giving history enough vertical room. |

## Data Flow

`App` renders `AnalysisFeature` and `HistoryFeature` on the same page.

    User
      │
      ▼
  HistoryFeature ──► useAnalysisHistory ──► repository.getAll()
      │                    │
      │                    └──► React Query cache keyed by `ANALYSIS_HISTORY_QUERY_KEY`
      │
      ├── delete click ──► useDeleteAnalysis
      │                      │
      │                      ├──► repository.delete(id)
      │                      └──► queryClient.invalidateQueries({ queryKey: ANALYSIS_HISTORY_QUERY_KEY })
      │
      └──► refetch ──► list updates / empty state appears when last item is removed

Cards render the title fallback from the first non-empty line of `jobDescription`, the saved date, a summary snippet, and up to five unique skills pulled from `skillGroups`.

## File Changes

| File | Action | Description |
|---|---|---|
| `src/features/history/HistoryFeature.tsx` | Create | Shell that coordinates loading, empty, error, list, and delete states. |
| `src/features/history/components/HistoryCard.tsx` | Create | Card UI for a saved analysis, including title, date, summary snippet, skill chips, and delete action. |
| `src/features/history/components/HistoryEmptyState.tsx` | Create | Empty state with negative space and CTA to `#analysis`. |
| `src/features/history/components/HistoryLoadingState.tsx` | Create | Skeleton-style loading surface that stays within the existing surface system. |
| `src/features/history/hooks/useDeleteAnalysis.ts` | Create | Mutation hook that deletes a saved analysis and invalidates the shared history query. |
| `src/features/history/index.ts` | Create | Public exports for the new feature shell. |
| `src/features/analysis/AnalysisFeature.tsx` | Modify | Add a stable `id="analysis"` anchor so the history CTA can navigate back to the analysis flow. |
| `src/App.tsx` | Modify | Mount the history shell as a separate dashboard section below the current analysis area. |

`src/features/analysis/hooks/useAnalysisHistory.ts` and `src/lib/repositories/local-analysis-repository.ts` are reused as-is; their current contracts already support the read path and delete path needed by the shell.

## Interfaces / Contracts

```ts
interface HistoryFeatureProps {
  repository?: AnalysisRepository;
  analysisHref?: string;
}

function useDeleteAnalysis(repository?: AnalysisRepository): {
  deleteAnalysis: (id: string) => void;
  isPending: boolean;
  error: Error | null;
}
```

The delete mutation must call:

```ts
queryClient.invalidateQueries({ queryKey: ANALYSIS_HISTORY_QUERY_KEY });
```

No optimistic update is required; refetching the shared list is enough and keeps the cache logic consistent with the existing save flow in `useJobAnalysis`.

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Unit | Title/snippet/skill extraction and delete invalidation | Pure helper tests plus hook tests with a mocked repository and `QueryClientProvider`. |
| Integration | State rendering for loading, empty, error, and success | Render `HistoryFeature` with mocked repository responses and assert the correct state transitions. |
| E2E | Delete the last item and return to empty state | Verify the card disappears, the list refetches, and the empty CTA remains visible. |

## Migration / Rollout

No migration required. Existing localStorage data stays in `nexus-talent:analysis-history:v1`, and the new shell only reads from the current repository. Roll out by adding the section to `App.tsx`; if needed, the feature can be hidden again by removing that mount point.

## Open Questions

- [ ] If a real `title` field is added to saved analyses later, should the card prefer it over the first-line fallback permanently?
