import { describe, expect, it, vi } from "vitest";
import { AI_ERROR_CODES, createAIOrchestratorError } from "./ai-errors";
import { createAIOrchestrator } from "./ai-orchestrator";

describe("createAIOrchestrator", () => {
  it("retries transient failures and eventually resolves", async () => {
    const sleep = vi.fn().mockResolvedValue(undefined);
    const execute = vi
      .fn()
      .mockRejectedValueOnce(createAIOrchestratorError(AI_ERROR_CODES.TRANSIENT_FAILURE, "Temporal", { retryable: true }))
      .mockRejectedValueOnce(createAIOrchestratorError(AI_ERROR_CODES.TRANSIENT_FAILURE, "Temporal", { retryable: true }))
      .mockResolvedValueOnce({ summary: "ok", skillGroups: [], outreachMessage: { subject: "S", body: "B" } });

    const orchestrator = createAIOrchestrator(
      {
        id: "test",
        providerName: "Test",
        isTransientError: () => true,
        mapErrorToUserMessage: () => "Temporal",
        buildRequest: () => ({ execute }),
        parseResponse: (response) => response,
      },
      { sleep, random: () => 0, maxRetries: 3 },
    );

    await expect(orchestrator.run({})).resolves.toMatchObject({ summary: "ok" });
    expect(execute).toHaveBeenCalledTimes(3);
    expect(sleep).toHaveBeenNthCalledWith(1, 270);
    expect(sleep).toHaveBeenNthCalledWith(2, 540);
  });

  it("stops on permanent errors", async () => {
    const execute = vi.fn().mockRejectedValue(new Error("Bad request"));
    const orchestrator = createAIOrchestrator(
      {
        id: "test",
        providerName: "Test",
        isTransientError: () => false,
        mapErrorToUserMessage: () => "Nope",
        buildRequest: () => ({ execute }),
        parseResponse: (response) => response,
      },
      { sleep: vi.fn().mockResolvedValue(undefined), random: () => 0, maxRetries: 3 },
    );

    await expect(orchestrator.run({})).rejects.toMatchObject({ name: "AIOrchestratorError", code: AI_ERROR_CODES.PERMANENT_FAILURE });
    expect(execute).toHaveBeenCalledTimes(1);
  });

  it("marks quota errors as rate limit failures", async () => {
    const execute = vi.fn().mockRejectedValue(Object.assign(new Error("Quota"), { status: 429 }));
    const orchestrator = createAIOrchestrator(
      {
        id: "test",
        providerName: "Test",
        isTransientError: () => false,
        mapErrorToUserMessage: () => "Quota",
        buildRequest: () => ({ execute }),
        parseResponse: (response) => response,
      },
      { sleep: vi.fn().mockResolvedValue(undefined), random: () => 0, maxRetries: 3 },
    );

    await expect(orchestrator.run({})).rejects.toMatchObject({ code: AI_ERROR_CODES.RATE_LIMIT_EXCEEDED });
    expect(execute).toHaveBeenCalledTimes(1);
  });

  it("succeeds when the provider responds before the timeout", async () => {
    const execute = vi.fn().mockResolvedValue({ summary: "fast", skillGroups: [], outreachMessage: { subject: "S", body: "B" } });
    const orchestrator = createAIOrchestrator(
      {
        id: "test",
        providerName: "Test",
        isTransientError: () => true,
        mapErrorToUserMessage: () => "Temporal",
        buildRequest: () => ({ execute }),
        parseResponse: (response) => response,
      },
      { sleep: vi.fn().mockResolvedValue(undefined), random: () => 0, maxRetries: 0, timeoutMs: 50 },
    );

    await expect(orchestrator.run({})).resolves.toMatchObject({ summary: "fast" });
    expect(execute).toHaveBeenCalledTimes(1);
  });

  it("stops after the configured retry budget is exhausted", async () => {
    const sleep = vi.fn().mockResolvedValue(undefined);
    const execute = vi.fn().mockRejectedValue(createAIOrchestratorError(AI_ERROR_CODES.TRANSIENT_FAILURE, "Temporal", { retryable: true }));
    const orchestrator = createAIOrchestrator(
      {
        id: "test",
        providerName: "Test",
        isTransientError: () => true,
        mapErrorToUserMessage: () => "Temporal",
        buildRequest: () => ({ execute }),
        parseResponse: (response) => response,
      },
      { sleep, random: () => 0, maxRetries: 3 },
    );

    await expect(orchestrator.run({})).rejects.toMatchObject({ code: AI_ERROR_CODES.TRANSIENT_FAILURE });
    expect(execute).toHaveBeenCalledTimes(4);
    expect(sleep).toHaveBeenCalledTimes(3);
  });

  it("aborts requests that exceed the timeout", async () => {
    const execute = vi.fn((_signal: AbortSignal) =>
      new Promise((resolve) => {
        setTimeout(() => resolve({ summary: "late", skillGroups: [], outreachMessage: { subject: "S", body: "B" } }), 25);
      }),
    );

    vi.useFakeTimers();
    const orchestrator = createAIOrchestrator(
      {
        id: "test",
        providerName: "Test",
        isTransientError: () => true,
        mapErrorToUserMessage: () => "Temporal",
        buildRequest: () => ({ execute }),
        parseResponse: (response) => response,
      },
      { sleep: vi.fn().mockResolvedValue(undefined), random: () => 0, maxRetries: 0, timeoutMs: 5 },
    );

    const pending = orchestrator.run({});
    await vi.advanceTimersByTimeAsync(5);
    await expect(pending).rejects.toMatchObject({ code: AI_ERROR_CODES.TRANSIENT_FAILURE });
    vi.useRealTimers();
  });
});