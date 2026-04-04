import { AI_ERROR_CODES, isAIOrchestratorError } from "./ai-errors";

export interface RetryStrategyOptions {
  initialDelayMs?: number;
  jitter?: number;
  maxDelayMs?: number;
  maxRetries?: number;
  multiplier?: number;
  random?: () => number;
}

export const DEFAULT_RETRY_STRATEGY: Required<RetryStrategyOptions> = {
  initialDelayMs: 300,
  jitter: 0.1,
  maxDelayMs: 10_000,
  maxRetries: 3,
  multiplier: 2,
  random: Math.random,
};

export function calculateRetryDelay(attempt: number, options: RetryStrategyOptions = {}) {
  const strategy = { ...DEFAULT_RETRY_STRATEGY, ...options };
  const rawDelay = strategy.initialDelayMs * strategy.multiplier ** attempt;
  const cappedDelay = Math.min(rawDelay, strategy.maxDelayMs);
  const jitterOffset = (strategy.random() * 2 - 1) * strategy.jitter;

  return Math.max(0, Math.round(cappedDelay * (1 + jitterOffset)));
}

export function shouldRetryError(error: unknown, attempt: number, options: RetryStrategyOptions = {}) {
  const strategy = { ...DEFAULT_RETRY_STRATEGY, ...options };

  if (attempt >= strategy.maxRetries) {
    return false;
  }

  if (isAIOrchestratorError(error)) {
    return error.retryable && error.code !== AI_ERROR_CODES.RATE_LIMIT_EXCEEDED;
  }

  return false;
}