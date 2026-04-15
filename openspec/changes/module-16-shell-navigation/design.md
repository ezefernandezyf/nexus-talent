# Design: Module 16 - Shell and Navigation

## Technical Approach

Apply the smallest public-shell wiring change possible: make the landing brand in `src/components/landing/Navbar.tsx` a React Router link to `/`, then verify the existing mobile drawer and authenticated shell still behave as-is. This keeps the work aligned with `ui-shell` and avoids landing-theme or UI-parity scope.

## Architecture Decisions

### Decision: Link the brand instead of changing routing

**Choice**: Wrap the landing brand text in a `Link` to `/`.
**Alternatives considered**: Add a new home button; change router redirects; add a landing theme toggle.
**Rationale**: The route already exists and the problem is navigation semantics, not route structure. A brand link preserves the current visual treatment and keeps the change isolated.

### Decision: Leave AppLayout and the drawer implementation untouched

**Choice**: Reuse the existing `AppLayout`, `MobileDrawer`, and `MobileMenuButton` behavior without new state or layout changes.
**Alternatives considered**: Introduce shared nav state; refactor the landing and app shells into a common nav model.
**Rationale**: The authenticated shell already links home correctly and the drawer is already accessible. Refactoring would add risk without solving the navigation gap.

## Data Flow

LandingPage ──→ Navbar brand Link ──→ `/`
     │
     └──→ MobileDrawer / MobileMenuButton ──→ public routes

AppLayout ──→ existing logo Link ──→ `/app`
     │
     └──→ MobileDrawer / MobileMenuButton ──→ app routes

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/components/landing/Navbar.tsx` | Modify | Make the landing brand clickable to `/`. |
| `src/pages/LandingPage.tsx` | Modify | Keep the public shell wiring consistent with the navbar change. |
| `src/pages/LandingPage.test.tsx` | Modify | Assert brand navigation and mobile drawer behavior. |
| `src/layouts/AppLayout.tsx` | Verify | Confirm authenticated logo/navigation stays stable. |
| `src/components/ui/MobileDrawer.tsx` | Verify | Reuse the current close/open behavior. |

## Interfaces / Contracts

No new interfaces are required. The change reuses existing React Router links and the current mobile drawer contract.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Brand link target | Test the landing navbar renders a home link. |
| Integration | Mobile navigation flow | Test landing mobile drawer open/close and route targets. |
| Regression | Auth shell stability | Confirm the authenticated shell logo and navigation continue to work. |

## Migration / Rollout

No migration required.

## Open Questions

- None.