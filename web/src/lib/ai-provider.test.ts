import { describe, expect, it, vi } from "vitest";
import { createGroqProviderAdapter } from "./ai-provider";
import { GROQ_JOB_ANALYSIS_JSON_SCHEMA } from "./validation/job-analysis";
import { JOB_ANALYSIS_MESSAGE_TONE } from "../schemas/job-analysis";

describe("createGroqProviderAdapter", () => {
  it("exposes Groq as the concrete provider identity", () => {
    const adapter = createGroqProviderAdapter();

    expect(adapter.id).toBe("groq");
    expect(adapter.providerName).toBe("Groq");
  });

  it("falls back to the provided transport when no api key is available", async () => {
    const fallbackTransport = vi.fn().mockResolvedValue({ summary: "Fallback summary", skillGroups: [], outreachMessage: { subject: "S", body: "B" } });
    const adapter = createGroqProviderAdapter({ fallbackTransport });

    const request = adapter.buildRequest({ jobDescription: "Senior React engineer", messageTone: JOB_ANALYSIS_MESSAGE_TONE.FORMAL });
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

  it("reuses the shared Groq response schema from validation", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({
                summary: "Ok",
                skillGroups: [
                  {
                    category: "Stack principal",
                    skills: [{ name: "React", level: "core" }],
                  },
                ],
                outreachMessage: {
                  subject: "S",
                  body: "B",
                },
              }),
            },
          },
        ],
      }),
    });

    const adapter = createGroqProviderAdapter({ apiKey: "test-key", fetchImpl });
    const request = adapter.buildRequest({ jobDescription: "Senior React engineer", messageTone: JOB_ANALYSIS_MESSAGE_TONE.FORMAL });

    await request.execute(new AbortController().signal);

    const [, requestInit] = fetchImpl.mock.calls[0] ?? [];
    const requestBody = JSON.parse((requestInit as RequestInit).body as string) as {
      response_format: { json_schema: { schema: unknown } };
    };

    expect(requestBody.response_format.json_schema.schema).toEqual(GROQ_JOB_ANALYSIS_JSON_SCHEMA);
  });

  it("returns a safe fallback message for unknown errors", () => {
    const adapter = createGroqProviderAdapter();

    expect(adapter.mapErrorToUserMessage(new Error("Unexpected"))).toContain("No se pudo completar");
  });

  it("guides the provider to produce structured, variable, recruiter-facing output", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({ summary: "Ok", skillGroups: [], outreachMessage: { subject: "S", body: "B" } }),
            },
          },
        ],
      }),
    });

    const adapter = createGroqProviderAdapter({ apiKey: "test-key", fetchImpl });
    const request = adapter.buildRequest({ jobDescription: "Senior React engineer", messageTone: JOB_ANALYSIS_MESSAGE_TONE.FORMAL });

    await request.execute(new AbortController().signal);

    const [, requestInit] = fetchImpl.mock.calls[0] ?? [];
    const requestBody = JSON.parse((requestInit as RequestInit).body as string) as {
      messages: Array<{ role: string; content: string }>;
    };

    expect(requestBody.messages[0]?.content).toContain("JSON estricto");
    expect(requestBody.messages[0]?.content).toContain("vacancySummary");
    expect(requestBody.messages[0]?.content).toContain("keywords");
    expect(requestBody.messages[0]?.content).toContain("gaps");
    expect(requestBody.messages[0]?.content).toContain("recruiterMessages");
    expect(requestBody.messages[0]?.content).toContain("email/LinkedIn");
    expect(requestBody.messages[0]?.content).toContain("No reutilices plantillas genéricas entre vacantes");
    expect(requestBody.messages[0]?.content).toContain("seniority");
    expect(requestBody.messages[0]?.content).toContain("dominio");
    expect(requestBody.messages[0]?.content).toContain("120 a 180 palabras");
    expect(requestBody.messages[0]?.content).toContain("600 caracteres");
    expect(requestBody.messages[0]?.content).toContain("límite de longitud");
  });
});