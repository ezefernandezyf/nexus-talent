# Proposal: Module 18 - Legacy Cleanup

## Intent
Remove the obsolete legacy landing implementation under `src/features/landing/*` now that the active landing page lives under `src/pages/LandingPage.tsx` and `src/components/landing/*`. This cleanup should reduce duplication without changing runtime behavior.

## Scope
### In Scope
- Delete the unused legacy landing tree under `src/features/landing/*`.
- Keep the active landing, router, and shared UI behavior unchanged.
- Validate that the current landing and router tests still pass.

### Out of Scope
- Rewriting the active landing page.
- Moving files to a new archival system unless required later.
- Visual parity or route changes.

## Approach
Remove the dead code directly because the active landing implementation already exists and is fully routed. Keep the change narrow and verify with existing landing/router tests rather than introducing new behavior.

## Affected Areas
| Area | Impact | Description |
|------|--------|-------------|
| `src/features/landing/pages/LandingPage.tsx` | Removed | Legacy landing entry point no longer used. |
| `src/features/landing/components/*` | Removed | Legacy hero, feature list, and footer implementations no longer used. |
| `src/pages/LandingPage.tsx` | Verified | Active landing page remains the public entry point. |
| `src/router/AppRouter.tsx` | Verified | Router continues to point to the active landing page. |

## Risks
| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Hidden references to legacy files | Low | Search the codebase before deleting and run targeted tests after cleanup. |
| Confusion between active and legacy landing trees | Low | Leave the active `src/pages/LandingPage.tsx` tree untouched. |

## Rollback Plan
Restore the deleted legacy files from Git if any hidden reference breaks the build. The active landing implementation and router stay intact.

## Dependencies
- The active landing tree under `src/pages/LandingPage.tsx` and `src/components/landing/*` already exists.
- No remaining imports should reference `src/features/landing/*`.

## Success Criteria
- [ ] The unused `src/features/landing/*` tree is removed.
- [ ] Landing and router tests still pass.
- [ ] The active landing page behavior remains unchanged.