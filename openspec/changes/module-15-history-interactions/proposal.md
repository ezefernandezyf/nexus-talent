# Proposal: Module 15 - History Interactions

## Intent
Add the next real history workflow: editable saved-analysis detail interactions with persisted rename/note changes. This module should deepen the existing read-only detail route into a usable record editor without touching the list UX or export path.

## Scope
### In Scope
- Add history detail interactions for rename/edit notes (or equivalent persisted edits) on `src/pages/HistoryDetailPage.tsx`.
- Persist those edits through the current analysis repository abstraction in `src/lib/repositories/analysis-repository.ts` and `src/lib/repositories/local-analysis-repository.ts`.
- Keep the detail flow safe with loading, save, and error feedback.

### Out of Scope
- History list redesign, export, and shell/navigation work.
- Pagination: deferred; the current controls are cosmetic only and should not become part of this module.
- Match score chip/data modeling: stays as derived UI for now; do not add a persisted score field or expand scope around it.

## Approach
Keep the current history list and detail route intact, and layer editing into the existing detail page/feature boundary. Reuse the current saved-analysis model and formatters in `src/features/history/history-formatters.ts` and related feature files; add a minimal mutation path for rename/notes persistence and surface validation/error states in the detail view. Do not introduce a new pagination or score-data contract in this module.

## Affected Areas
| Area | Impact | Description |
|------|--------|-------------|
| `src/pages/HistoryDetailPage.tsx` | Modified | Add edit UI and save/cancel feedback. |
| `src/features/history/*` | Modified | Detail form state, persistence wiring, and reuse of existing history helpers. |
| `src/lib/repositories/analysis-repository.ts` | Modified | Add/update support for persisted edits if missing. |
| `src/lib/repositories/local-analysis-repository.ts` | Modified | Store the edit fields in the current persistence layer. |
| `src/features/history/history-formatters.ts` | Unchanged | Match score remains derived UI only. |

## Risks
| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Write path does not exist yet | High | Add the smallest update method to the current repository abstraction before UI wiring. |
| Scope drift into list/pagination redesign | Medium | Keep the module anchored to detail edits only; defer list concerns. |
| Derived score gets mistaken for persisted data | Medium | Document that the match score chip remains computed UI only. |

## Rollback Plan
Revert the detail edit UI and repository write path, leaving the read-only history detail route and existing list/export behavior unchanged. If persistence requires a migration, back out that migration or disable the write path first.

## Dependencies
- A writable history persistence layer or repository update method.
- Existing saved-analysis detail route and history formatters.
- Validation for edited fields before save.

## Success Criteria
- [ ] Users can rename a saved analysis and edit notes from the detail page.
- [ ] Edits persist and reload correctly.
- [ ] The list/export flow remains unchanged.
- [ ] Pagination is explicitly not implemented in this module.
- [ ] The match score chip remains derived UI only.
