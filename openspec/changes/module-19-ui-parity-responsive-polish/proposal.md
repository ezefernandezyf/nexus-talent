# Proposal: Module 19 - UI Parity and Responsive Polish

## Intent
Close the remaining visual gap by tightening spacing, hierarchy, and responsive behavior across the active feature pages without introducing new features or route changes.

## Scope
### In Scope
- Polish shared page wrappers and headers for better mobile and desktop rhythm.
- Improve analysis, history, and settings surface layouts, including empty/loading states and action groups.
- Keep all existing routes, data flow, and behaviors intact.

### Out of Scope
- Navigation redesigns, new routes, or bottom-nav work.
- Auth, persistence, or feature logic changes.
- Content/copy rewrites unrelated to layout.

## Approach
Use the existing design system and reference assets to tune the shared wrappers first, then adjust the most visible page-specific surfaces where spacing or action wrapping still feels off. Keep the work visual only and verify against the existing page tests.

## Affected Areas
| Area | Impact | Description |
|------|--------|-------------|
| `src/components/ui/FeaturePageShell.tsx` | Modified | Shared page spacing and width tuning. |
| `src/components/ui/PageHeader.tsx` | Modified | Responsive title/action layout. |
| `src/components/ui/EmptyState.tsx` | Modified | Shared empty-state rhythm and CTA alignment. |
| `src/features/analysis/*` | Modified | Form and results surface polish. |
| `src/features/history/*` | Modified | List/card spacing and mobile hierarchy. |
| `src/features/settings/*` | Modified | Section spacing and responsive card flow. |

## Risks
| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Visual tweaks spill into behavior changes | Medium | Keep the scope to class/layout adjustments only. |
| Shared wrapper changes affect multiple pages | Medium | Validate all feature pages after each shared tweak. |
| Over-polishing one surface causes inconsistency elsewhere | Low | Use the reference assets as the common baseline.

## Rollback Plan
Revert the wrapper and page-level spacing changes if the polish pass causes regressions. No data or route changes are expected, so rollback is isolated to styling and layout classes.

## Dependencies
- Existing feature pages and shared UI primitives.
- Reference assets in `docs/assets/` and `DESIGN.md`.

## Success Criteria
- [ ] Shared feature pages read consistently across mobile and desktop.
- [ ] Empty, loading, and action states keep their layout without overlap.
- [ ] No new features or route behavior are introduced.