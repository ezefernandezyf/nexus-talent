# Proposal: module-09-ci-tests-tooling

## Intent

Strengthen CI reliability and test ergonomics without changing product behavior. The first tranche should make typecheck a real merge gate, surface coverage for critical modules, and reduce repetitive test setup.

## Scope

### In Scope
- Gate `.github/workflows/ci.yml` on `npm run typecheck` and `npm run test`.
- Enable Vitest coverage reporting for the existing critical modules.
- Add shared test factories/mocks to reduce repetitive setup in analysis and lib tests.
- Add clearer CI output for test and typecheck failures.

### Out of Scope
- ESLint rules or Prettier formatting.
- Husky / pre-commit hooks.
- Broad coverage expansion to every untested module.
- React Router v7 migration work.

## Approach

Start with the highest-ROI tooling slice: harden CI around the checks that already exist, expose coverage where it matters, and extract reusable test helpers for the current Vitest suite. Keep the change dependency-light and avoid introducing new product logic.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `.github/workflows/ci.yml` | Modified | Add stronger CI gating for typecheck and tests. |
| `vitest.config.ts` | Modified | Expand coverage reporting for critical modules. |
| `src/test/factories/*` | New | Shared test data builders. |
| `src/test/mocks/*` | New | Shared mock helpers for common browser/API behavior. |
| `src/features/**/**/*.test.ts*` | Modified | Replace duplicated setup with shared utilities. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| CI becomes stricter and exposes latent failures | Medium | Roll out gates incrementally and keep coverage scope focused. |
| Shared test helpers introduce coupling | Low | Keep factories small and domain-specific. |
| CI time increases slightly | Low | Restrict coverage to critical paths first. |

## Rollback Plan

Revert the workflow and Vitest config changes, and remove the shared test utilities if they cause friction. No production data or runtime behavior is affected.

## Dependencies

- Existing GitHub Actions CI workflow.
- Current Vitest and TypeScript setup.

## Success Criteria

- [ ] CI fails when typecheck fails.
- [ ] CI reports coverage for the targeted critical modules.
- [ ] Shared test helpers reduce duplicated setup in the current suite.