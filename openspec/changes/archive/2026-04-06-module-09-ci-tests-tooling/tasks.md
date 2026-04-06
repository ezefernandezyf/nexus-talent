# Tasks: Module 09 CI / Tests / Tooling

## Phase 1: Foundation

- [x] 1.1 Create `src/test/factories/analysis.ts` with builders for analysis results, repositories, and React Query wrappers.
- [x] 1.2 Create `src/test/mocks/browser.ts` with reusable clipboard, window, and download API mocks.
- [x] 1.3 Create `src/test/mocks/query-client.ts` with a shared `QueryClientProvider` wrapper for hook tests.

## Phase 2: CI and Coverage

- [x] 2.1 Update `.github/workflows/ci.yml` so validation runs `npm ci`, `npm run typecheck`, `npm run test`, `npm run test:coverage`, and `npm run build` in order.
- [x] 2.2 Update `vitest.config.ts` so CI-friendly coverage output stays enabled for `src/features/analysis/**/*`, `src/lib/ai-client.ts`, and `src/schemas/job-analysis.ts`.
- [x] 2.3 Add or adjust workflow output so failed typecheck or coverage results are visible in the GitHub Actions logs.

## Phase 3: Test Refactor

- [x] 3.1 Refactor `src/features/analysis/hooks/useJobAnalysis.test.tsx`, `src/features/analysis/AnalysisFeature.test.tsx`, and `src/features/analysis/components/AnalysisResultView.test.tsx` to use shared factories and mocks.
- [x] 3.2 Refactor `src/features/analysis/components/JobDescriptionForm.test.tsx`, `src/lib/github-client.test.ts`, and `src/features/analysis/utils/github-stack-mapper.test.ts` to reduce duplicated setup.
- [x] 3.3 Keep the current Jest-DOM/Vitest setup in `src/test/setup.ts` unchanged unless a shared helper explicitly needs it.

## Phase 4: Verification

- [x] 4.1 Run `npm run typecheck` and `npm run test` to confirm the workflow changes do not break the suite.
- [x] 4.2 Run `npm run test:coverage` and confirm coverage reports still pass for the targeted critical modules.
- [x] 4.3 Verify the CI job order matches the updated spec and fails fast on typecheck/test regressions.