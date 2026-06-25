import { describe, expect, it } from "vitest";
import { AI_ERROR_CODES, createAIOrchestratorError } from "./ai-errors";
import { calculateRetryDelay, shouldRetryError } from "./retry-strategy";

describe("retry-strategy", () => {
  it("calculates exponential delays without jitter", () => {
    expect(calculateRetryDelay(0, { jitter: 0, random: () => 0.5 })).toBe(300);
    expect(calculateRetryDelay(1, { jitter: 0, random: () => 0.5 })).toBe(600);
  });

  it("caps delay at the configured maximum", () => {
    expect(calculateRetryDelay(10, { jitter: 0, random: () => 0.5, maxDelayMs: 1_000 })).toBe(1_000);
  });

  it("retries only transient orchestrator errors within budget", () => {
    const transientError = createAIOrchestratorError(AI_ERROR_CODES.TRANSIENT_FAILURE, "Temporal", {
      retryable: true,
    });
    const permanentError = createAIOrchestratorError(AI_ERROR_CODES.PERMANENT_FAILURE, "Nope", {
      retryable: false,
    });

    expect(shouldRetryError(transientError, 0, { maxRetries: 3 })).toBe(true);
    expect(shouldRetryError(permanentError, 0, { maxRetries: 3 })).toBe(false);
    expect(shouldRetryError(transientError, 3, { maxRetries: 3 })).toBe(false);
  });

  it("does not retry rate limit errors", () => {
    const rateLimitError = createAIOrchestratorError(AI_ERROR_CODES.RATE_LIMIT_EXCEEDED, "Quota", {
      retryable: false,
    });

    expect(shouldRetryError(rateLimitError, 0, { maxRetries: 3 })).toBe(false);
  });
});