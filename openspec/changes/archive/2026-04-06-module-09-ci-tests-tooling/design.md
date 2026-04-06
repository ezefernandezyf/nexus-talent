# Design: Module 09 CI / Tests / Tooling

## Technical Approach

Keep the existing validation workflow, but harden it so CI fails fast on type errors, runs the test suite with coverage, and publishes coverage visibility for the critical modules already tracked in Vitest. In parallel, add a small shared test-support layer to remove repeated query-client, browser, and repository mocks from the current suite.

The goal is a first tooling tranche: no linting, Prettier, or Husky yet. This keeps the slice low-risk and centered on the checks the repo already uses.

## Architecture Decisions

| Decision | Choice | Alternatives considered | Rationale |
|---|---|---|---|
| CI order | `npm ci` → `npm run typecheck` → `npm run test`/coverage → `npm run build` | Keep the current order or run build before typecheck | Type errors should fail early and prevent wasted work. |
| Coverage strategy | Use Vitest coverage in CI and keep thresholds on the critical modules | Add Codecov or defer coverage visibility entirely | The repo already has V8 coverage configured; this adds visibility without a new service. |
| Test utilities | Small local factories/mocks under `src/test/` | Leave repeated setup inline or adopt a heavier test helper library | Shared local helpers reduce duplication without changing runtime code. |

## Data Flow

```text
push / pull request
  -> GitHub Actions
      -> npm ci
      -> npm run typecheck
      -> npm run test (or coverage run)
      -> publish coverage artifact / summary
      -> npm run build
```

Locally, the test suite keeps using `src/test/setup.ts`; the new shared utilities are imported only by test files that need common factories or browser mocks.

## File Changes

| File | Action | Description |
|---|---|---|
| `.github/workflows/ci.yml` | Modify | Reorder validation to fail fast on typecheck and run coverage-aware test validation. |
| `vitest.config.ts` | Modify | Keep critical-module coverage thresholds and expose coverage output for CI. |
| `src/test/factories/analysis.ts` | Create | Shared builders for analysis result and repository fixtures. |
| `src/test/mocks/browser.ts` | Create | Shared browser API mocks for clipboard, download, and window behavior. |
| `src/test/mocks/query-client.ts` | Create | Shared React Query wrapper helper for hook tests. |
| `src/features/**/**/*.test.tsx` | Modify | Replace repeated setup with the shared factories/mocks. |

## Interfaces / Contracts

```ts
type TestFactoryOptions = {
  overrides?: Record<string, unknown>;
};

type BrowserMockSet = {
  reset: () => void;
  mockClipboard: () => void;
  mockDownload: () => void;
};
```

These helpers are test-only and must not leak into runtime modules.

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Unit | Shared factories/mocks | Verify helpers produce stable test data and predictable browser stubs. |
| Integration | Hook/component tests using the helpers | Replace duplicated setup in analysis and lib tests with shared utilities. |
| CI | Workflow validation | Confirm the job fails on typecheck/test regressions and emits coverage output. |

## Migration / Rollout

No migration required. This is a repository tooling change only.

## Open Questions

- [ ] Should coverage be a hard fail in CI for the first tranche, or reported first and gated later?