# Proposal: History Feature Shell

## Intent

Introduce a dedicated UI feature shell to display and manage the history of previously analyzed job descriptions. This enables users to revisit their past analyses, ensuring the data persisted in Phase 05 is accessible, viewable, and manageable (deletable) without cluttering the main analysis flow.

## Scope

### In Scope
- Create a new feature module at `src/features/history/`.
- Build a History feature shell handling loading, empty, error, and success states gracefully.
- Display a list of saved analyses (showing timestamps, role title/summary).
- Implement a delete action for saved analyses (updating `useAnalysisHistory` or adding a mutation).
- Reuse existing design tokens and visual language from The Precision Instrument (`surface-panel`, `ghost-frame`, etc.).
- Consume the existing `useAnalysisHistory` hook and `AnalysisRepository` from the analysis feature.

### Out of Scope
- Moving `AnalysisRepository` or the `useAnalysisHistory` hook out of `src/features/analysis/` (maintaining current data boundaries for now).
- Cross-tab synchronization of history data.
- Full details view refactor (reusing existing UI components where possible, but not rebuilding the analysis result view completely).
- Pagination or infinite scrolling (simple list is sufficient for now).

## Approach

Implement a **Hybrid History Shell**: 
We will create a dedicated `src/features/history/` directory for the UI components. To minimize data boundary churn, this new shell will consume the existing `useAnalysisHistory` hook and `AnalysisRepository` directly from the analysis feature. 
The UI will list saved analyses and provide a way to delete them, requiring a new delete capability in the repository and a corresponding React Query mutation that invalidates the shared query key.
The visual design will strictly adhere to The Precision Instrument, reusing established tokens and primitives for a cohesive experience.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/features/history/` | New | New feature module for history UI |
| `src/features/analysis/hooks/useAnalysisHistory.ts` | Modified | Add delete mutation capability |
| `src/lib/repositories/analysis-repository.ts` | Modified | Add `delete` method to interface |
| `src/lib/repositories/local-analysis-repository.ts` | Modified | Implement `delete` method |
| `src/App.tsx` | Modified | Integrate the new history shell into the layout |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Domain Boundary Bleed | Medium | Keep exports strict; history UI only consumes the hook, avoiding deep coupling to analysis internals. |
| Inconsistent State after Delete | Low | Ensure the delete mutation correctly invalidates the shared `ANALYSIS_HISTORY_QUERY_KEY`. |

## Rollback Plan

Revert the layout changes in `src/App.tsx` to hide the history feature, and remove the `src/features/history/` directory. The data layer changes (delete method) are additive and safe to leave or revert.

## Dependencies

- Phase 05 Persistence layer (`AnalysisRepository`, `useAnalysisHistory`).
- Design System tokens (`src/index.css`).

## Success Criteria

- [ ] Users can view a list of their previously saved job analyses.
- [ ] Users can delete a specific saved analysis from the history.
- [ ] The history UI correctly displays loading, empty, and error states.
- [ ] The visual design matches The Precision Instrument specifications.