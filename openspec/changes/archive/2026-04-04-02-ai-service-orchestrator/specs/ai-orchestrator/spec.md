# AI Service / Orchestrator Specification

## Purpose

The AI Orchestrator module provides a resilience and abstraction layer for AI provider communication. It MUST isolate retry logic, timeout handling, and provider-specific behavior from the UI and validation layers, allowing safe integration of LLM providers while keeping `ai-client` focused on input/output validation.

---

## Architecture Overview

| Component | Responsibility |
|-----------|-----------------|
| `ai-orchestrator` | Wraps transport calls with retry, timeout, and provider normalization |
| `providers/groq` | Groq-specific behavior (error mapping, request/response shaping) |
| `retry-strategy` | Exponential backoff decision logic |
| `ai-client` | Zod validation only; delegates transport to orchestrator |

---

## Requirements

### Requirement: Provider Adapter Contract

The system MUST define a provider adapter interface that isolates LLM-specific behavior.

**Schema**:
```ts
interface ProviderAdapter {
  id: string;
  providerName: string;
  isTransientError(error: unknown): boolean;
  mapErrorToUserMessage(error: unknown): string;
  buildRequest(input: unknown): unknown;
  parseResponse(response: unknown): unknown;
}
```

#### Scenario: Adapter swap without UI changes
- GIVEN an AI call is made using ProviderAdapter A
- WHEN the system switches to ProviderAdapter B
- THEN the UI should continue to work without code changes

#### Scenario: Provider error classification
- GIVEN a provider returns a network timeout error
- WHEN the adapter's `isTransientError()` is called
- THEN it MUST return `true`

#### Scenario: Provider returns unrecognized error
- GIVEN a provider returns an error not defined in the adapter
- WHEN `mapErrorToUserMessage()` is called
- THEN it MUST return a safe fallback message

#### Scenario: Groq adapter is the first concrete provider
- GIVEN the application initializes the AI layer
- WHEN the default provider is resolved
- THEN the Groq adapter MUST be used as the first concrete integration
- AND the UI MUST not depend on Groq-specific details

---

### Requirement: Retry Mechanism with Exponential Backoff

The system MUST retry transient failures (network, timeout, service unavailable) using exponential backoff.

**Configuration**:
- Default max retries: 3
- Initial delay: 300ms
- Max delay: 10,000ms
- Backoff multiplier: 2.0
- Jitter: ±10% random offset

#### Scenario: Transient error with successful retry
- GIVEN a request fails with a 503 error (transient)
- AND the adapter classifies it as transient
- WHEN the retry mechanism runs
- THEN it MUST wait for `300ms × 2^0 = 300ms` before retry 1
- AND wait for `300ms × 2^1 = 600ms` before retry 2
- AND if retry 2 succeeds, the request MUST resolve with the success value

#### Scenario: Permanent error not retried
- GIVEN a request fails with a 401 error (permanent)
- AND the adapter classifies it as NOT transient
- WHEN the retry mechanism runs
- THEN it MUST NOT retry and MUST fail immediately

#### Scenario: Max retries exceeded
- GIVEN a request has already retried 3 times
- WHEN the next transient error occurs
- THEN it MUST NOT retry again and MUST return the final error

---

### Requirement: Provider Quota Awareness

The system MUST surface provider quota failures clearly, and MAY defer explicit client-side throttling if the first provider already enforces its own quota model.

#### Scenario: Provider quota error is surfaced
- GIVEN Groq returns a 429 or quota-related error
- WHEN the orchestrator classifies the failure
- THEN the error type MUST be `RATE_LIMIT_EXCEEDED`
- AND the UI MUST receive a safe message without provider internals

#### Scenario: No explicit token bucket is required
- GIVEN the change is implemented against a free provider tier
- WHEN request volume is low and provider limits are handled externally
- THEN the system MUST NOT require a client-side token bucket to ship

---

### Requirement: Request Timeout Handling

The system MUST enforce a maximum request duration.

**Configuration**:
- Default timeout: 30,000ms
- Configurable per request

#### Scenario: Request exceeds timeout
- GIVEN a request is made with a 5,000ms timeout
- WHEN the provider takes 6,000ms to respond
- THEN the request MUST be canceled
- AND the error MUST be classified as transient
- AND the retry mechanism MUST be triggered

#### Scenario: Request completes within timeout
- GIVEN a request timeout is 30,000ms
- WHEN the provider responds in 2,000ms
- THEN the request MUST complete successfully

---

### Requirement: Error Propagation and Classification

The system MUST expose error information for UI feedback without leaking provider details.

**Error Types**:
- `RATE_LIMIT_EXCEEDED`: User has exceeded request budget
- `TRANSIENT_FAILURE`: Network/provider temporarily unavailable (retrying)
- `PERMANENT_FAILURE`: User error or provider-specific issue
- `UNKNOWN_ERROR`: Unclassifiable error

#### Scenario: Transient error during retry attempts
- GIVEN an AI request experiences a network timeout
- WHEN the error is classified and returned to the UI
- THEN the error type MUST be `TRANSIENT_FAILURE`
- AND the UI MUST show a "retrying..." state

#### Scenario: Permanent error stops retry
- GIVEN an AI request receives a 401 (auth error)
- WHEN the error is classified
- THEN the error type MUST be `PERMANENT_FAILURE`
- AND the UI MUST stop retrying and show error message

---

### Requirement: Integration with ai-client

The system MUST maintain backward compatibility with the existing `JobAnalysisTransport` interface.

#### Scenario: Orchestrator wraps transport
- GIVEN the current `ai-client` uses `JobAnalysisTransport`
- WHEN the orchestrator adds retry and provider normalization
- THEN the transport interface MUST remain the same
- AND existing callers (e.g., `useJobAnalysis`) MUST work without changes

#### Scenario: Zod validation still happens before orchestrator
- GIVEN a request to analyze a job description
- WHEN the input is invalid (e.g., empty string)
- THEN validation MUST fail at the `ai-client` layer (Zod schema)
- AND the orchestrator MUST NOT be called