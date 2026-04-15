# Design: Module 20 - Landing Mobile and Drawer Cleanup

## Technical Approach

Apply a small responsive fix to the landing features section so the sticky column is active only on desktop breakpoints. Then clean the public drawer copy and action grouping so it reads as a user-facing navigation surface.

## Architecture Decisions

### Decision: Scope sticky behavior to desktop only

**Choice**: Convert the features section sticky column to `md:`-scoped sticky positioning.
**Alternatives considered**: Rebuild the landing section with a separate mobile layout.
**Rationale**: The overlap comes from sticky behavior on narrow screens, so a responsive prefix is the smallest correct fix.

### Decision: Keep drawer copy user-facing

**Choice**: Replace developer-facing drawer text with a neutral navigation label and remove duplicate auth actions where they add confusion.
**Alternatives considered**: Leave the drawer label as an internal marker.
**Rationale**: The drawer is part of the public UX and should not expose implementation vocabulary.

## Data Flow

User -> Landing page -> Feature section / public drawer -> Existing routes

Only visual flow and label ordering change; routing stays the same.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/components/landing/FeatureSection.tsx` | Modify | Scope sticky to desktop and preserve mobile flow. |
| `src/components/ui/MobileDrawer.tsx` | Modify | Replace developer-facing drawer label with user-facing copy. |
| `src/pages/LandingPage.tsx` | Modify | Clean drawer items/actions ordering and remove duplication. |

## Interfaces / Contracts

No new interfaces required.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Regression | Landing page render | Re-run existing landing page tests after layout and drawer copy changes. |
| Regression | Drawer presentation | Verify the drawer still opens, closes, and renders user-facing labels. |
| Visual sanity | Mobile flow | Check that the landing features section no longer overlaps on narrow screens. |

## Migration / Rollout

No migration required.

## Open Questions

- None.