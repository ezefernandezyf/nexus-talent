# Proposal: AI Service / Orchestrator

## Intent
Build a resilience layer for AI calls so the app can talk to Groq first without coupling the UI to provider details. The goal is to centralize retries and timeouts while preserving the existing validation-first boundary.

## Scope

### In Scope
- Add an AI orchestrator layer above the current `ai-client` transport abstraction.
- Implement retry handling with backoff and timeout support.
- Add a Groq provider adapter as the first concrete integration.
- Define a provider adapter contract for future LLM integrations.

### Out of Scope
- Client-side token bucket rate limiting.
- Changing the Job Analysis UI.
- Persistence or history features.

## Approach
Keep `src/lib/ai-client.ts` focused on input/output validation and parsed results. Introduce a separate orchestrator module that wraps provider calls with retry and timeout. Use an adapter interface so Groq can be the first concrete provider without locking the design to a single vendor.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/lib/ai-client.ts` | Modified | Keep validation boundary intact and reuse transport abstraction. |
| `src/lib/` | New | Add orchestrator, Groq adapter, retry, and error helpers. |
| `src/features/analysis/hooks/useJobAnalysis.ts` | Minor | May need error classification or telemetry hooks. |
| `src/lib/query-client.ts` | None | Global retries remain disabled; resilience lives below the mutation layer. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Groq-specific behavior leaks into shared code | Medium | Keep provider logic behind the adapter contract. |
| Retry loops amplify failures | Medium | Classify errors and only retry transient failures. |
| Free-tier quota is hit unexpectedly | Medium | Map quota/429 errors clearly and defer explicit rate limiting until it is justified. |

## Rollback Plan
Revert the orchestrator layer and provider adapter files, then fall back to the current transport-only `ai-client` behavior. Because the UI contract stays the same, rollback should not require feature changes in `src/features/analysis/`.

## Dependencies
- Existing `ai-client` transport abstraction.
- Groq API credentials / access for the first provider adapter.

## Success Criteria
- [ ] AI requests can be retried safely on transient failures.
- [ ] Groq is integrated through an adapter without coupling the UI to provider details.
- [ ] Provider-specific behavior is isolated behind an adapter contract.
- [ ] The Job Analysis UI continues to work without direct provider coupling.