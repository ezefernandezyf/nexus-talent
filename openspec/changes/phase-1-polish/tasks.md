# Tasks: Phase 1 Polish

## Review Workload Forecast

Decision needed before apply: Yes
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Medium

| Field | Value |
|-------|-------|
| Estimated changed lines | ~150-200 (additions), ~400-500 (deletions) |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Suggested split | Single PR — all tasks interdependent, no intermediate compilable state |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

**Why single PR**: Schema, components, and tests are tightly coupled. Removing `githubRepositoryUrl` from the schema breaks components/tests until both are updated. No safe intermediate state for a partial PR.

## Phase 1: Schema Changes

- [x] 1.1 `shared/src/schemas.ts` — Remove `githubRepositoryUrl` from `analysisRequestSchema`; change `.min(1)` to `.min(30)` on `jobDescription`. Verify: `tsc --noEmit` in shared.
- [x] 1.2 `web/src/features/analysis/schemas/job-analysis.ts` — Remove `JOB_ANALYSIS_GITHUB_STACK_SIGNAL_SCHEMA`, `JOB_ANALYSIS_GITHUB_ENRICHMENT_SCHEMA`, `githubRepositoryUrl` from `JOB_ANALYSIS_REQUEST_SCHEMA`, `githubEnrichment` from `JOB_ANALYSIS_RESULT_SCHEMA`, GitHub type exports. Change `.min(1)` to `.min(30)`. Verify: `tsc --noEmit` in web.

## Phase 2: Component Cascade

- [x] 2.1 `JobDescriptionForm.tsx` — Remove `initialGithubRepositoryUrl` prop, `githubRepositoryUrl` state/input/useEffect wiring, `normalizedGitHubRepositoryUrl` from `handleSubmit`. Change empty JD check from `=== 0` to `< 30`.
- [x] 2.2 `useJobAnalysis.ts` — Remove `githubClient` import/option/default, `GitHubClient` type, `normalizeSubmission` GitHub logic, `createSubmissionKey` GitHub field, all `githubPromise`/`githubResult`/`githubEnrichment` logic in `mutationFn`.
- [x] 2.3 `AnalysisFeature.tsx` — Remove `initialGithubRepositoryUrl` prop and its pass-through to `JobDescriptionForm`.
- [x] 2.4 `AnalysisPage.tsx` — Remove `prefillGithubRepositoryUrl`, `githubEnrichment.repositoryUrl`, `AnalysisReworkState.githubRepositoryUrl`. Remove GitHub descriptor in PageHeader description.
- [x] 2.5 `AnalysisResultView.tsx` — Remove GitHub enrichment rendering block (lines 404–436) and `sourceLabel` if only used there.
- [x] 2.6 `HistoryDetailPage.tsx` — Remove GitHub enrichment rendering block (lines 237–266).

## Phase 3: Test & Cleanup Cascade

- [x] 3.1 `useJobAnalysis.test.tsx` — Remove `createGitHubClientStub`, `GitHubClient` import, all GitHub-related tests (lines 297-556), simplify non-GitHub test assertions.
- [x] 3.2 `JobDescriptionForm.test.tsx` — Remove "submits an optional GitHub repository URL" test, simplify prefill tests (remove GitHub assertions), remove `initialGithubRepositoryUrl` from hydrate/partial tests.
- [x] 3.3 `AnalysisResultView.test.tsx` — Remove GitHub enrichment tests (3 it-blocks).
- [x] 3.4 `AnalysisFeature.test.tsx` — Remove `githubEnrichment` from test data.
- [x] 3.5 `HistoryDetailPage.test.tsx` — Remove `githubEnrichment` from test data.
- [x] 3.6 `validation.test.ts` — Remove `githubEnrichment` from test data.
- [x] 3.7 `factories/analysis.ts` — Remove `githubRepositoryUrl` from `createAnalysisRequest`.

## Phase 4: Cross-cutting Cleanup

- [x] 4.1 `SettingsFeature.tsx:176` — Replace em dash (`—`) with en dash (`–`) in "manualmente — se adapta solo".
- [x] 4.2 `CVPage.tsx:109,191` — Replace em dashes with en dashes in "Opcional — pegá..." and "502 — Generation Failed".
- [x] 4.3 `ExperienceManagerPage.tsx:165-166` — Replace em dashes with en dashes in date range strings.
- [x] 4.4 `EducationManagerPage.tsx:165-166` — Replace em dashes with en dashes in date range strings.
- [x] 4.5 `SettingsPage.tsx:16` — Remove `<Eyebrow>Configuración</Eyebrow>`.
- [x] 4.6 `CVPage.tsx:79` — Remove `<Eyebrow>CV</Eyebrow>`, keep unused `Eyebrow` import (component stays in codebase per REQ-EB-004).

## Phase 5: Final Verification

- [x] 5.1 Run `tsc --noEmit` in `shared/`, `web/`, `server/` — zero errors.
- [x] 5.2 Run `pnpm test` — all tests pass (3 pre-existing Auth OAuth failures unrelated to this change).
- [x] 5.3 Verify `grep -r '—' web/src/features/settings/ web/src/features/cv/` returns zero matches in user-facing strings (remaining matches are code comments or test names).
- [x] 5.4 Verify `grep -r githubRepositoryUrl web/src/features/analysis/` returns zero matches.
