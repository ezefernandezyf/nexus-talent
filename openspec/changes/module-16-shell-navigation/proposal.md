# Proposal: Module 16 - Shell and Navigation

## Intent
Close the remaining shell/navigation gap in the public experience with minimal wiring: make the landing brand clickable, confirm the global nav works across routes, and validate the mobile menu behavior. Keep this module out of visual parity and theme-system changes.

## Scope
### In Scope
- Make the landing navbar brand navigate to `/`.
- Verify public and authenticated navigation stay functional across desktop/mobile.
- Add/update tests for logo click and mobile drawer behavior.

### Out of Scope
- Landing theme toggle or theme-provider changes.
- Visual redesign, spacing polish, or reference parity work.
- New routes, new nav items, or auth flow changes.

## Approach
Keep the authenticated shell as-is and change only the public navbar wiring where the brand is currently plain text. Reuse the existing `MobileDrawer` and `MobileMenuButton` behavior, and add focused tests to protect the landing nav and the responsive menu. Avoid touching layout styling unless a test exposes a real navigation defect.

## Affected Areas
| Area | Impact | Description |
|------|--------|-------------|
| `src/components/landing/Navbar.tsx` | Modified | Wrap the brand in a home link. |
| `src/pages/LandingPage.tsx` | Modified | Keep landing nav/drawer wiring consistent. |
| `src/components/ui/MobileDrawer.tsx` | Verified | Reuse existing responsive menu behavior. |
| `src/layouts/AppLayout.tsx` | Verified | Confirm authenticated shell navigation remains stable. |
| `src/router/AppRouter.tsx` | Verified | No route changes expected; confirm current redirects still work. |

## Risks
| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Scope drifts into UI parity | Medium | Keep the change limited to routing and click behavior. |
| Brand link changes perceived landing visuals | Low | Preserve current text treatment; only add navigation semantics. |
| Mobile menu regressions | Low | Cover drawer open/close and navigation in tests. |

## Rollback Plan
Revert the navbar link change and any related test updates. Shell layout, routes, and drawer implementation stay unchanged, so rollback is isolated to the public brand navigation wiring.

## Dependencies
- Existing React Router routes for `/` and `/app/*`.
- Current `MobileDrawer` and `MobileMenuButton` components.

## Success Criteria
- [ ] Clicking the landing brand returns the user to `/`.
- [ ] Mobile navigation still opens, closes, and links correctly.
- [ ] Authenticated shell navigation remains unchanged.
- [ ] No theme toggle or visual parity work is introduced in this module.