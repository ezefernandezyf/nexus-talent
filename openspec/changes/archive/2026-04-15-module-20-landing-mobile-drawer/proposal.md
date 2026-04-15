# Proposal: Module 20 - Landing Mobile and Drawer Cleanup

## Intent
Fix the landing page mobile overlap and clean the public mobile drawer so it reads like a user-facing navigation surface, not a developer overlay.

## Scope
### In Scope
- Make the landing features section behave correctly on narrow screens.
- Remove developer-facing wording from the public mobile drawer.
- Reorder or deduplicate public navigation and auth actions in the drawer.

### Out of Scope
- Auth provider configuration, social login enablement, or signup form changes.
- Desktop shell/navigation redesigns.
- New routes or feature behavior.

## Approach
Keep the landing page visually consistent by scoping sticky behavior to desktop breakpoints and simplifying the drawer presentation. Prefer the smallest responsive class changes that resolve the overlap without changing content or routes.

## Affected Areas
| Area | Impact | Description |
|------|--------|-------------|
| `src/components/landing/FeatureSection.tsx` | Modified | Scope sticky behavior to desktop and preserve mobile flow. |
| `src/components/ui/MobileDrawer.tsx` | Modified | Replace developer-facing wording with user-facing drawer copy. |
| `src/pages/LandingPage.tsx` | Modified | Clean up drawer item ordering and duplicate public actions. |

## Risks
| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Overlap fix regresses desktop layout | Low | Use responsive-only class changes. |
| Drawer cleanup changes perceived navigation flow | Low | Keep the current routes and labels, only remove duplication. |
| Scope drifts into auth implementation | Medium | Keep provider enablement for the auth module, not this one. |

## Rollback Plan
Revert the responsive class changes and drawer text/action cleanup if the landing page or mobile menu regresses. No data or routing changes are expected.

## Dependencies
- Existing landing components and public drawer wiring.
- Existing landing page tests for basic route/content coverage.

## Success Criteria
- [ ] The landing page reads cleanly on mobile without the feature block overlapping its follow-up cards.
- [ ] The mobile drawer no longer exposes developer-facing wording.
- [ ] The drawer actions are not duplicated or confusing.