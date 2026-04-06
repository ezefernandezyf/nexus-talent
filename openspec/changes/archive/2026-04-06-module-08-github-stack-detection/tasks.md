# Tasks: Module 08 GitHub Stack Detection

## Phase 1: Foundation

- [x] 1.1 Extend `src/schemas/job-analysis.ts` with optional GitHub enrichment types and a backward-compatible result contract.
- [x] 1.2 Create `src/lib/github-client.ts` to fetch public repository metadata and fail softly on network/API errors.
- [x] 1.3 Create `src/features/analysis/utils/github-stack-mapper.ts` to normalize GitHub metadata into stack signals.

## Phase 2: Core Analysis Flow

- [x] 2.1 Update `src/features/analysis/hooks/useJobAnalysis.ts` to accept an optional GitHub URL and combine core analysis with enrichment.
- [x] 2.2 Update `src/features/analysis/components/JobDescriptionForm.tsx` to collect an optional GitHub repository URL.
- [x] 2.3 Update `src/features/analysis/components/AnalysisFeature.tsx` to pass the optional URL through the analysis flow and surface partial-enrichment warnings.

## Phase 3: Result Rendering

- [x] 3.1 Update `src/features/analysis/components/AnalysisResultView.tsx` to render detected stack data when enrichment succeeds.
- [x] 3.2 Add a non-blocking warning state in the result view for GitHub failures or missing stack signals.

## Phase 4: Testing and Verification

- [x] 4.1 Add unit tests for `src/features/analysis/utils/github-stack-mapper.ts` covering language/topic normalization and empty-result handling.
- [x] 4.2 Add client tests for `src/lib/github-client.ts` covering successful fetches and soft-fail error paths.
- [x] 4.3 Add hook tests for `src/features/analysis/hooks/useJobAnalysis.ts` covering optional URL input, success enrichment, and GitHub failure fallback.
- [x] 4.4 Update component tests for `JobDescriptionForm.tsx`, `AnalysisFeature.tsx`, and `AnalysisResultView.tsx` to cover optional input and detected-stack rendering.

## Phase 5: Cleanup

- [x] 5.1 Verify copy/messages and public-only boundaries match the approved proposal.
- [x] 5.2 Confirm no unrelated history, auth, or export logic changed during the slice.