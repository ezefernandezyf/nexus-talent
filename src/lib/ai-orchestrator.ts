import { AI_ERROR_CODES, createAIOrchestratorError, isAIOrchestratorError } from "./ai-errors";
import { calculateRetryDelay, shouldRetryError, type RetryStrategyOptions } from "./retry-strategy";
import { type ProviderAdapter } from "./ai-provider";

export interface AIOrchestratorOptions {
  maxRetries?: number;
  random?: () => number;
  sleep?: (delayMs: number) => Promise<void>;
  timeoutMs?: number;
}

export function createAIOrchestrator<Input>(adapter: ProviderAdapter<Input>, options: AIOrchestratorOptions = {}) {
  const maxRetries = options.maxRetries ?? 3;
  const timeoutMs = options.timeoutMs ?? 30_000;
  const random = options.random ?? Math.random;
  const sleep = options.sleep ?? ((delayMs: number) => new Promise<void>((resolve) => setTimeout(resolve, delayMs)));

  async function executeWithTimeout(execute: (signal: AbortSignal) => Promise<unknown>, requestTimeoutMs: number) {
    const controller = new AbortController();
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    try {
      const timeoutPromise = new Promise<{ timedOut: true }>((resolve) => {
        timeoutId = setTimeout(() => {
          controller.abort();
          resolve({ timedOut: true });
        }, requestTimeoutMs);
      });

      const executionPromise = Promise.resolve(execute(controller.signal));
      const result = await Promise.race([
        executionPromise.then((value) => ({ timedOut: false as const, value })),
        timeoutPromise,
      ]);

      if ("timedOut" in result && result.timedOut) {
        throw createAIOrchestratorError(AI_ERROR_CODES.TRANSIENT_FAILURE, "La solicitud superó el tiempo de espera.", {
          retryable: true,
        });
      }

      return result.value;
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  }

  function normalizeError(error: unknown) {
    if (isAIOrchestratorError(error)) {
      return error;
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      return createAIOrchestratorError(AI_ERROR_CODES.TRANSIENT_FAILURE, "La solicitud superó el tiempo de espera.", {
        retryable: true,
        cause: error,
      });
    }

    if (adapter.isTransientError(error)) {
      return createAIOrchestratorError(
        AI_ERROR_CODES.TRANSIENT_FAILURE,
        adapter.mapErrorToUserMessage(error),
        { cause: error, retryable: true },
      );
    }

    const status = error instanceof Error && "status" in error ? (error as { status?: number }).status : undefined;
    if (status === 429) {
      return createAIOrchestratorError(
        AI_ERROR_CODES.RATE_LIMIT_EXCEEDED,
        adapter.mapErrorToUserMessage(error),
        { cause: error, retryable: false, status },
      );
    }

    return createAIOrchestratorError(AI_ERROR_CODES.PERMANENT_FAILURE, adapter.mapErrorToUserMessage(error), {
      cause: error,
      retryable: false,
      status,
    });
  }

  async function run(input: Input): Promise<unknown> {
    let attempt = 0;

    while (true) {
      try {
        const request = adapter.buildRequest(input);
        const response = await executeWithTimeout(request.execute, timeoutMs);
        return adapter.parseResponse(response);
      } catch (error) {
        const normalizedError = normalizeError(error);
        const retryOptions: RetryStrategyOptions = { maxRetries, random };

        if (shouldRetryError(normalizedError, attempt, retryOptions)) {
          await sleep(calculateRetryDelay(attempt, retryOptions));
          attempt += 1;
          continue;
        }

        throw normalizedError;
      }
    }
  }

  return {
    run,
  };
}