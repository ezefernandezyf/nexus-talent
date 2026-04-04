import { describe, expect, it, vi } from "vitest";
import { createGroqProviderAdapter } from "./ai-provider";

describe("createGroqProviderAdapter", () => {
  it("exposes Groq as the concrete provider identity", () => {
    const adapter = createGroqProviderAdapter();

    expect(adapter.id).toBe("groq");
    expect(adapter.providerName).toBe("Groq");
  });

  it("falls back to the provided transport when no api key is available", async () => {
    const fallbackTransport = vi.fn().mockResolvedValue({ summary: "Fallback summary", skillGroups: [], outreachMessage: { subject: "S", body: "B" } });
    const adapter = createGroqProviderAdapter({ fallbackTransport });

    const request = adapter.buildRequest({ jobDescription: "Senior React engineer" });
    const result = await request.execute(new AbortController().signal);

    expect(fallbackTransport).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({ summary: "Fallback summary" });
  });

  it("parses Groq envelopes into JSON payloads", () => {
    const adapter = createGroqProviderAdapter();
    const parsed = adapter.parseResponse({
      choices: [
        {
          message: {
            content: JSON.stringify({ summary: "Ok", skillGroups: [], outreachMessage: { subject: "S", body: "B" } }),
          },
        },
      ],
    });

    expect(parsed).toMatchObject({ summary: "Ok" });
  });

  it("returns a safe fallback message for unknown errors", () => {
    const adapter = createGroqProviderAdapter();

    expect(adapter.mapErrorToUserMessage(new Error("Unexpected"))).toContain("No se pudo completar");
  });
});