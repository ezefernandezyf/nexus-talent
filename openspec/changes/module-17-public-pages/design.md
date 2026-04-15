# Design: Module 17 - Public Pages

## Technical Approach

Keep the public pages unchanged in production and add direct tests that harden their route and link contracts. The router already maps `/privacy` and `/404`, so the design focuses on coverage rather than layout or routing refactors.

## Architecture Decisions

### Decision: Verify existing public pages instead of rewriting them

**Choice**: Add page/component tests for privacy, 404, and the shared footer.
**Alternatives considered**: Rebuild the pages, rename footer labels, or add more route redirects.
**Rationale**: The routes and UI already exist and are wired correctly; verification gives coverage with minimal risk.

### Decision: Keep router behavior unchanged

**Choice**: Do not add new routes or redirects.
**Alternatives considered**: Add alias routes for the pages or alter the footer destinations.
**Rationale**: Existing routes already satisfy the user-facing contract and are already covered at the router level.

## Data Flow

Visitor -> Router -> PrivacyPage / NotFoundPage
Visitor -> Landing/App Shell -> Shared Footer -> /privacy

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/pages/PrivacyPage.test.tsx` | Create | Verify the privacy page content and home link. |
| `src/pages/NotFoundPage.test.tsx` | Create | Verify the 404 page content and return links. |
| `src/components/ui/Footer.test.tsx` | Create | Verify the shared footer privacy link. |
| `src/router/AppRouter.test.tsx` | Verify | Confirm existing route coverage remains valid. |

## Interfaces / Contracts

No new interfaces required.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Footer and page copy/link targets | Render the components directly and assert visible links. |
| Integration | Route accessibility | Reuse router tests to confirm `/privacy` and `/404` stay reachable. |
| Regression | Shared footer availability | Verify the footer still appears in the app and landing shells. |

## Migration / Rollout

No migration required.

## Open Questions

- None.