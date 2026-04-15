# Proposal: Module 17 - Public Pages

## Intent
Harden the public pages contract by adding direct coverage for the privacy page, the 404 page, and the shared footer privacy link. The routes already exist, so this module should verify public entry points rather than introduce new UI.

## Scope
### In Scope
- Add direct tests for `src/pages/PrivacyPage.tsx` and `src/pages/NotFoundPage.tsx`.
- Add direct tests for `src/components/ui/Footer.tsx` privacy navigation.
- Keep public route behavior unchanged.

### Out of Scope
- New routes, redirects, or navigation items.
- Copy redesign or visual parity work.
- Auth changes or shell layout changes.

## Approach
Reuse the existing privacy and 404 pages plus the shared footer. Add focused tests that assert route-level accessibility and the privacy link destination from the footer, so the public contract is covered without changing production behavior.

## Affected Areas
| Area | Impact | Description |
|------|--------|-------------|
| `src/pages/PrivacyPage.tsx` | Verified | Confirm the privacy page renders and links home. |
| `src/pages/NotFoundPage.tsx` | Verified | Confirm the 404 page renders and links to privacy/home. |
| `src/components/ui/Footer.tsx` | Verified | Confirm the shared footer points to `/privacy`. |
| `src/pages/PrivacyPage.test.tsx` | New | Direct privacy page coverage. |
| `src/pages/NotFoundPage.test.tsx` | New | Direct 404 page coverage. |
| `src/components/ui/Footer.test.tsx` | New | Direct shared footer coverage. |

## Risks
| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Duplicate coverage with router tests | Medium | Focus on component-level assertions, not route replication. |
| Scope creep into copy polish | Low | Keep production text unchanged unless tests reveal a real defect. |

## Rollback Plan
Remove the added tests if they prove redundant or noisy. No production route or component changes are expected.

## Dependencies
- Existing `/privacy` and `/404` routes in `src/router/AppRouter.tsx`.
- Shared footer component used by landing and authenticated shells.

## Success Criteria
- [ ] Privacy and 404 pages have direct component tests.
- [ ] The shared footer has direct coverage for its privacy link.
- [ ] Existing public routes continue to resolve unchanged.