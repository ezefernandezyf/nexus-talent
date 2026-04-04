## Exploration: 02 AI Service / Orchestrator

### Current State
The codebase already has a transport-abstracted AI boundary in `src/lib/ai-client.ts`. It validates input with Zod, passes the request through an injected transport, and validates the returned payload before rendering. The current default transport is local and synchronous, so there is no real LLM provider yet. Query retries are disabled globally in `src/lib/query-client.ts`, so resilience should live below the UI layer.

### Affected Areas
- `src/lib/ai-client.ts` — current transport boundary and validation gate.
- `src/lib/query-client.ts` — global retry policy already disabled.
- `src/features/analysis/hooks/useJobAnalysis.ts` — consumes the client and may need error classification.
- `src/lib/` — likely home for orchestrator, retry, rate limiting, and provider adapters.

### Approaches
1. **Thin orchestrator wrapper** — add a resilience layer around the transport with retry and timeout, then plug in a Groq adapter first.
   - Pros: keeps validation separate, easy to test, minimal coupling.
   - Cons: one extra abstraction.
   - Effort: Medium.

2. **Expand ai-client directly** — put retries inside the existing client.
   - Pros: fewer files.
   - Cons: mixes validation, resilience, and provider concerns.
   - Effort: Medium.

3. **Move retry logic to TanStack Query** — rely on mutation retry behavior.
   - Pros: fewer orchestration helpers.
   - Cons: conflicts with the current global no-retry policy and does not provide provider-specific error normalization.
   - Effort: Low.

### Recommendation
Use a thin orchestrator layer above the existing transport abstraction. Keep `ai-client.ts` responsible for validation and result parsing, and move retry and timeout into a separate service layer. Introduce a Groq adapter first, but keep the provider contract swappable.

### Risks
- Provider selection is still open.
- Groq quota behavior may need a later throttling layer if usage grows.
- Retry behavior needs careful error classification to avoid repeating validation failures.

### Ready for Proposal
Yes. The change is ready to define scope, rollback, and success criteria for the orchestrator layer.