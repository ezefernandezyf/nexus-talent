import { describe, expect, it, vi } from "vitest";
import { createBackendProxyAdapter } from "./ai-provider";
import { AI_ERROR_CODES } from "./ai-errors";
import { JOB_ANALYSIS_MESSAGE_TONE } from "@/features/analysis/schemas/job-analysis";

describe("createBackendProxyAdapter", () => {
  it("exposes the backend proxy as the concrete provider identity", () => {
    const adapter = createBackendProxyAdapter();

    expect(adapter.id).toBe("backend-proxy");
    expect(adapter.providerName).toBe("Backend AI Proxy");
  });

  it("passes through server-validated JSON responses", () => {
    const adapter = createBackendProxyAdapter();
    const payload = {
      summary: "Análisis",
      skillGroups: [],
      outreachMessage: { subject: "S", body: "B" },
    };

    const parsed = adapter.parseResponse(payload);

    expect(parsed).toEqual(payload);
  });

  it("parses string responses as JSON", () => {
    const adapter = createBackendProxyAdapter();
    const payload = { summary: "Ok", skillGroups: [], outreachMessage: { subject: "S", body: "B" } };

    const parsed = adapter.parseResponse(JSON.stringify(payload));

    expect(parsed).toEqual(payload);
  });

  it("maps 400 responses to PermanentFailure", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: false, status: 400 });
    const adapter = createBackendProxyAdapter({ fetchImpl });
    const request = adapter.buildRequest({
      jobDescription: "Test JD",
      messageTone: JOB_ANALYSIS_MESSAGE_TONE.FORMAL,
    });

    await expect(request.execute(new AbortController().signal)).rejects.toMatchObject({
      code: AI_ERROR_CODES.PERMANENT_FAILURE,
      status: 400,
      retryable: false,
    });
  });

  it("maps 429 responses to RateLimit", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: false, status: 429 });
    const adapter = createBackendProxyAdapter({ fetchImpl });
    const request = adapter.buildRequest({
      jobDescription: "Test JD",
      messageTone: JOB_ANALYSIS_MESSAGE_TONE.FORMAL,
    });

    await expect(request.execute(new AbortController().signal)).rejects.toMatchObject({
      code: AI_ERROR_CODES.RATE_LIMIT_EXCEEDED,
      status: 429,
      retryable: false,
    });
  });

  it("maps 502 responses to TransientFailure", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: false, status: 502 });
    const adapter = createBackendProxyAdapter({ fetchImpl });
    const request = adapter.buildRequest({
      jobDescription: "Test JD",
      messageTone: JOB_ANALYSIS_MESSAGE_TONE.FORMAL,
    });

    await expect(request.execute(new AbortController().signal)).rejects.toMatchObject({
      code: AI_ERROR_CODES.TRANSIENT_FAILURE,
      status: 502,
      retryable: true,
    });
  });

  it("falls back to local transport on network error", async () => {
    const fallbackTransport = vi.fn().mockResolvedValue({ summary: "Local fallback", skillGroups: [], outreachMessage: { subject: "S", body: "B" } });
    const fetchImpl = vi.fn().mockRejectedValue(new Error("Network error"));
    const adapter = createBackendProxyAdapter({ fetchImpl, fallbackTransport });
    const request = adapter.buildRequest({
      jobDescription: "Test JD",
      messageTone: JOB_ANALYSIS_MESSAGE_TONE.FORMAL,
    });

    const result = await request.execute(new AbortController().signal);

    expect(fallbackTransport).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({ summary: "Local fallback" });
  });

  it("returns a user-facing error message for unknown errors", () => {
    const adapter = createBackendProxyAdapter();

    expect(adapter.mapErrorToUserMessage(new Error("Unexpected"))).toContain("No se pudo completar");
  });

  it("returns a connection error message for network failures", () => {
    const adapter = createBackendProxyAdapter();

    expect(adapter.mapErrorToUserMessage(new Error("fetch timeout"))).toContain("No se pudo conectar");
  });
});
