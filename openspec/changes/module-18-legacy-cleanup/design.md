# Design: Module 18 - Legacy Cleanup

## Technical Approach

Delete the unused `src/features/landing/*` implementation after confirming the active landing entry point is `src/pages/LandingPage.tsx`. Keep router and active landing code unchanged, and rely on existing tests to prove behavior did not move.

## Architecture Decisions

### Decision: Delete the dead tree instead of refactoring it

**Choice**: Remove `src/features/landing/pages/LandingPage.tsx` and its local components.
**Alternatives considered**: Move the tree to `old/`; refactor it to share active components.
**Rationale**: The active landing already exists and is in use. Refactoring a dead tree adds no value, while deletion is the smallest safe cleanup.

### Decision: Preserve the active landing and router paths

**Choice**: Leave `src/pages/LandingPage.tsx`, `src/router/AppRouter.tsx`, and `src/components/landing/*` untouched.
**Alternatives considered**: Consolidate the old and new landing implementations.
**Rationale**: Consolidation is unnecessary for cleanup and risks changing the working public experience.

## Data Flow

Visitor -> AppRouter -> src/pages/LandingPage.tsx -> src/components/landing/*
Legacy tree -> no external references -> removed

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/features/landing/pages/LandingPage.tsx` | Delete | Remove unused legacy landing page. |
| `src/features/landing/components/Hero.tsx` | Delete | Remove unused legacy hero component. |
| `src/features/landing/components/FeatureList.tsx` | Delete | Remove unused legacy feature list component. |
| `src/features/landing/components/Footer.tsx` | Delete | Remove unused legacy footer component. |

## Interfaces / Contracts

No new interfaces required.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Regression | Landing router path | Re-run existing landing/router tests after deletion. |
| Regression | Public navigation | Confirm existing landing links continue to resolve correctly. |

## Migration / Rollout

No migration required.

## Open Questions

- None.