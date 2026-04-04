# Tasks: AI Service / Orchestrator

## Phase 1: Foundation

- [x] 1.1 Create `src/lib/ai-provider.ts` with the provider adapter contract from the spec.
- [x] 1.2 Create `src/lib/ai-errors.ts` with normalized `RATE_LIMIT_EXCEEDED`, `TRANSIENT_FAILURE`, `PERMANENT_FAILURE`, and `UNKNOWN_ERROR` types.
- [x] 1.3 Create `src/lib/retry-strategy.ts` for backoff, jitter, and retryability checks.
- [x] 1.4 Define the first Groq adapter inside `src/lib/ai-provider.ts` so the provider contract has a concrete implementation target.

## Phase 2: Core Implementation

- [x] 2.1 Create `src/lib/ai-orchestrator.ts` to compose the Groq adapter, timeout, and retry behavior.
- [x] 2.2 Update `src/lib/ai-client.ts` so it keeps Zod validation and delegates execution to the orchestrator path.
- [x] 2.3 Add timeout handling and Groq quota/error classification in the orchestrator without changing the `JobAnalysisTransport` shape.
- [x] 2.4 Keep `src/features/analysis/hooks/useJobAnalysis.ts` thin and only surface normalized AI errors.

## Phase 3: Integration / Wiring

- [x] 3.1 Wire `jobAnalysisClient` to use the new orchestrator by default while preserving the current public API.
- [x] 3.2 Keep `src/lib/query-client.ts` retries disabled so the mutation layer does not compete with orchestrator retries.
- [x] 3.3 Ensure the analysis feature continues to render loading, error, and success states unchanged.

## Phase 4: Testing

- [x] 4.1 Add unit tests for `src/lib/retry-strategy.ts` covering transient and permanent retry decisions.
- [x] 4.2 Add integration tests for `src/lib/ai-orchestrator.ts` covering timeout, retry, and adapter error mapping.
- [x] 4.3 Add regression tests for `src/lib/ai-client.ts` proving invalid input still fails before orchestrator execution.
- [x] 4.4 Add a thin hook test for `src/features/analysis/hooks/useJobAnalysis.ts` to confirm the existing analysis flow still works end to end.

## Phase 5: Cleanup

- [x] 5.1 Review exported symbols in `src/lib/` and remove any temporary scaffolding after the orchestrator is wired.
- [x] 5.2 Update README or developer notes if the Groq-first contract needs onboarding context.