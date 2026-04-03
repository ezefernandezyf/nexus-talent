# Tasks: 01 Job Analysis

## Phase 1: Foundation

- [x] 1.1 Create `src/schemas/job-analysis.ts` with input validation for non-empty job descriptions and Zod schemas for summary, skills, and editable outreach output.
- [x] 1.2 Extend `src/lib/ai-client.ts` with a job-analysis entrypoint that accepts validated input and returns parsed, schema-checked data.
- [x] 1.3 Add `src/features/analysis/index.ts` and the module folder skeleton to define the feature boundary.

## Phase 2: Core Implementation

- [x] 2.1 Implement `src/features/analysis/hooks/useJobAnalysis.ts` as a TanStack Query mutation that handles pending, success, and error states.
- [x] 2.2 Implement `src/features/analysis/components/JobDescriptionForm.tsx` with textarea input, inline empty-state validation, and submit disable while pending.
- [x] 2.3 Implement `src/features/analysis/components/AnalysisResultView.tsx` to render the summary, skills matrix, editable outreach draft, and copy action using the edited text.
- [x] 2.4 Create `src/features/analysis/AnalysisFeature.tsx` to compose form, loading, error, and result states into one screen.

## Phase 3: Integration / Wiring

- [x] 3.1 Mount `AnalysisFeature` from `src/App.tsx` or the project’s main route entry so the feature is reachable in the shell.
- [x] 3.2 Wire the result and error surfaces to the Precision Instrument visuals defined in `DESIGN.md`.

## Phase 4: Testing

- [x] 4.1 Add schema tests for `src/schemas/job-analysis.ts` covering non-empty input, valid AI payloads, and malformed response rejection.
- [x] 4.2 Add tests for `useJobAnalysis.ts` covering loading, success, network failure, and invalid AI response states.
- [x] 4.3 Add component interaction tests for `AnalysisResultView.tsx` to verify outreach edits are preserved when copying.
- [x] 4.4 Add a coverage gate for the analysis module so critical logic stays at 90%+.

## Phase 5: Cleanup

- [x] 5.1 Remove temporary mocks, debug code, and unused exports from `src/features/analysis/` after the flow is wired.
- [x] 5.2 Review module docs and inline comments for clarity around validation, editable outreach, and error handling.