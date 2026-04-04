# Design: AI Service / Orchestrator

## Technical Approach

Build a thin orchestration layer above the current transport-abstracted `ai-client`. The `ai-client` stays responsible for Zod input/output validation and result parsing, while the new orchestrator owns resilience concerns: retries, timeout handling, and provider-specific error classification. Groq is the first concrete provider adapter, and explicit client-side token bucket limiting is deferred unless later quota pressure justifies it.

## Architecture Decisions

### Decision: Keep validation separate from resilience

**Choice**: `src/lib/ai-client.ts` remains the validation boundary; the orchestrator sits below it.
**Alternatives considered**: Put retries and rate limiting directly inside `ai-client.ts`.
**Rationale**: The current client already parses input/output with Zod. Mixing transport resilience into the same file would blur responsibilities and make future provider swaps harder.

### Decision: Introduce a provider adapter contract

**Choice**: Add a provider adapter interface for request building, response parsing, and transient error detection, with Groq as the initial adapter.
**Alternatives considered**: Hardcode one provider SDK or rely on raw transport errors.
**Rationale**: Groq is the first provider, but the design must stay swappable and testable without turning the codebase into a Groq-only integration.

### Decision: Handle retries outside TanStack Query

**Choice**: Keep `retry: false` in the mutation layer and implement retries in the orchestration layer.
**Alternatives considered**: Use React Query mutation retries.
**Rationale**: The app already disables global retries in `src/lib/query-client.ts`. AI retries need provider-aware classification, timeout awareness, and rate-limit coordination that fit better below the UI.

### Decision: Defer explicit client-side token bucket limiting

**Choice**: Do not build a token bucket limiter in the first implementation slice.
**Alternatives considered**: Add a per-client limiter immediately.
**Rationale**: The first provider is a free Groq integration, so the near-term risk is provider quota errors, not app-level burst control. The orchestrator can still normalize 429/quota failures without shipping extra limiter complexity.

## Data Flow

`useJobAnalysis` -> `ai-client` validates input -> provider adapter builds request -> provider call runs with timeout -> transient failures go through retry strategy -> adapter parses response -> `ai-client` validates parsed payload -> UI receives typed result

    useJobAnalysis
          │
          ▼
     ai-client (Zod)
          │
          ▼
   ai-orchestrator ──→ Groq adapter
          │
          ▼
   retry / timeout / error mapping

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/lib/ai-client.ts` | Modify | Keep validation-first client and delegate execution to the orchestrator layer. |
 | `src/lib/ai-orchestrator.ts` | Create | Coordinate retries, timeout, and provider error classification. |
| `src/lib/ai-provider.ts` | Create | Define the provider adapter contract and Groq adapter shape. |
| `src/lib/retry-strategy.ts` | Create | Encapsulate backoff, jitter, and retryability decisions. |
| `src/lib/ai-errors.ts` | Create | Normalize transient, permanent, and rate-limit failures. |
| `src/features/analysis/hooks/useJobAnalysis.ts` | Modify | Keep mutation wiring thin; surface normalized orchestrator errors if needed. |

## Interfaces / Contracts

```ts
export interface ProviderAdapter {
  id: string;
  providerName: string;
  isTransientError(error: unknown): boolean;
  mapErrorToUserMessage(error: unknown): string;
  buildRequest(input: unknown): unknown;
  parseResponse(response: unknown): unknown;
}
```

The orchestrator MUST accept a provider adapter through dependency injection. The AI client MUST continue to reject invalid job descriptions before any provider call is attempted.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|--------------|----------|
| Unit | Retry strategy, adapter error classification, quota normalization | Mock failures, assert backoff and error mapping deterministically. |
| Integration | Orchestrator + ai-client contract | Verify validation, retryable failures, timeout behavior, and response parsing. |
| E2E | Existing analysis flow remains functional | Exercise the Job Analysis feature to confirm the new layer does not change UI behavior. |

## Migration / Rollout

No migration required. This is an additive refactor behind the existing analysis flow. The rollout can start with Groq as the first provider adapter and keep the limiter intentionally out of the first slice.

## Open Questions

- [ ] Which provider adapter will be implemented first once the vendor is chosen?
- [ ] Should quota awareness stay limited to error normalization, or do we want throttling later if Groq usage grows?