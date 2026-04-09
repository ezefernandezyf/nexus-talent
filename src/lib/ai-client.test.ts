import { describe, expect, it } from "vitest";
import { createJobAnalysisClient, jobAnalysisClient } from "./ai-client";
import { AI_ERROR_CODES, createAIOrchestratorError } from "./ai-errors";
import { JOB_ANALYSIS_MESSAGE_TONE } from "../schemas/job-analysis";

describe("ai-client", () => {
  it("normalizes dirty transport payloads before validation", async () => {
    const client = createJobAnalysisClient({
      transport: async () => ({
        summary: "  Un rol enfocado en construir experiencias de producto.  ",
        skillGroups: [
          {
            category: "  Stack principal  ",
            skills: [
              { name: "  React  ", level: "CORE", extra: true },
              { name: "TypeScript", level: "Strong" },
            ],
            extraGroupField: "remove-me",
          },
        ],
        outreachMessage: {
          subject: "  Interés en el puesto  ",
          body: "  Hola equipo,\n\nMe interesa la oportunidad.  ",
          draftBody: "  borrador opcional  ",
        },
        extraTopLevel: "remove-me",
      }),
    });

    await expect(client.analyzeJobDescription("Senior React engineer")).resolves.toEqual({
      summary: "Un rol enfocado en construir experiencias de producto.",
      skillGroups: [
        {
          category: "Stack principal",
          skills: [
            { name: "React", level: "core" },
            { name: "TypeScript", level: "strong" },
          ],
        },
      ],
      outreachMessage: {
        subject: "Interés en el puesto",
        body: "Hola equipo,\n\nMe interesa la oportunidad.",
      },
    });
  });

  it("builds a local analysis when no transport is provided", async () => {
    const result = await jobAnalysisClient.analyzeJobDescription(
      "Senior React engineer with TypeScript, testing, and communication",
    );

    expect(result.summary).toContain("Senior React engineer");
    expect(result.skillGroups.length).toBeGreaterThan(0);
    expect(result.outreachMessage.body).toContain("[Your Name]");
  });

  it("builds a casual outreach message when requested", async () => {
    const result = await jobAnalysisClient.analyzeJobDescription(
      "Senior React engineer with TypeScript, testing, and communication",
      JOB_ANALYSIS_MESSAGE_TONE.CASUAL,
    );

    expect(result.outreachMessage.body).toContain("Te escribo porque");
    expect(result.outreachMessage.body).toContain("cómo puedo aportar rápido y con foco al equipo");
  });

  it("builds a persuasive outreach message when requested", async () => {
    const result = await jobAnalysisClient.analyzeJobDescription(
      "Senior React engineer with TypeScript, testing, and communication",
      JOB_ANALYSIS_MESSAGE_TONE.PERSUASIVE,
    );

    expect(result.outreachMessage.body).toContain("Veo una oportunidad muy fuerte para sumar valor porque");
    expect(result.outreachMessage.body).toContain("convertir esas prioridades en resultados concretos");
  });

  it("parses transport responses from JSON strings", async () => {
    const client = createJobAnalysisClient({
      transport: async () =>
        JSON.stringify({
          summary: "Un rol enfocado en construir experiencias de producto.",
          skillGroups: [
            {
              category: "Stack principal",
              skills: [{ name: "React", level: "core" }],
            },
          ],
          outreachMessage: {
            subject: "Interés en el puesto",
            body: "Hola equipo,\n\nSaludos,\n[Your Name]",
          },
        }),
    });

    const result = await client.analyzeJobDescription("Senior React engineer");

    expect(result.skillGroups[0]?.category).toBe("Stack principal");
  });

  it("keeps the local fallback path on the same normalize-then-validate contract", async () => {
    const result = await jobAnalysisClient.analyzeJobDescription(
      "Operations lead focused on process clarity and team coordination",
    );

    expect(result.skillGroups[0]?.category).toBe("Encaje general");
    expect(result.outreachMessage.body).toContain("[Your Name]");
  });

  it("keeps the public client contract stable across transport implementations", async () => {
    const firstClient = createJobAnalysisClient({
      transport: async () => ({
        summary: "Primer transporte",
        skillGroups: [
          {
            category: "Stack principal",
            skills: [{ name: "React", level: "core" }],
          },
        ],
        outreachMessage: {
          subject: "Interés A",
          body: "Hola equipo A,\n\nSaludos,\n[Your Name]",
        },
      }),
    });

    const secondClient = createJobAnalysisClient({
      transport: async () => ({
        summary: "Segundo transporte",
        skillGroups: [
          {
            category: "Stack principal",
            skills: [{ name: "TypeScript", level: "strong" }],
          },
        ],
        outreachMessage: {
          subject: "Interés B",
          body: "Hola equipo B,\n\nSaludos,\n[Your Name]",
        },
      }),
    });

    await expect(firstClient.analyzeJobDescription("Senior React engineer")).resolves.toMatchObject({
      summary: "Primer transporte",
    });
    await expect(secondClient.analyzeJobDescription("Senior React engineer")).resolves.toMatchObject({
      summary: "Segundo transporte",
    });
  });

  it("passes the selected tone to the transport fallback", async () => {
    const transport = vi.fn(async (input) => ({
      summary: input.messageTone,
      skillGroups: [
        {
          category: "Stack principal",
          skills: [{ name: input.messageTone, level: "core" }],
        },
      ],
      outreachMessage: {
        subject: "Interés",
        body: input.messageTone,
      },
    }));

    const client = createJobAnalysisClient({ transport });

    await client.analyzeJobDescription("Senior React engineer", JOB_ANALYSIS_MESSAGE_TONE.CASUAL);

    expect(transport).toHaveBeenCalledWith(
      expect.objectContaining({
        jobDescription: "Senior React engineer",
        messageTone: JOB_ANALYSIS_MESSAGE_TONE.CASUAL,
      }),
    );
  });

  it("wraps malformed transport payloads", async () => {
    const client = createJobAnalysisClient({
      transport: async () => ({
        summary: "",
        skillGroups: [],
        outreachMessage: { subject: "", body: "" },
      }),
    });

    await expect(client.analyzeJobDescription("Senior React engineer")).rejects.toThrow(/La respuesta de IA no es válida/i);
  });

  it("preserves AI orchestrator errors from the transport layer", async () => {
    const client = createJobAnalysisClient({
      transport: async () => {
        throw createAIOrchestratorError(AI_ERROR_CODES.TRANSIENT_FAILURE, "Temporary upstream failure");
      },
    });

    await expect(client.analyzeJobDescription("Senior React engineer")).rejects.toMatchObject({
      name: "AIOrchestratorError",
      code: AI_ERROR_CODES.TRANSIENT_FAILURE,
      retryable: true,
    });
  });

  it("rethrows unexpected transport errors as-is", async () => {
    const client = createJobAnalysisClient({
      transport: async () => {
        throw new Error("Transport unavailable");
      },
    });

    await expect(client.analyzeJobDescription("Senior React engineer")).rejects.toThrow(
      /No se pudo completar la solicitud contra Groq/i,
    );
  });

  it("rejects empty job descriptions", async () => {
    await expect(jobAnalysisClient.analyzeJobDescription("   ")).rejects.toThrow(/Pegá una descripción del puesto/i);
  });

  it("falls back to general fit signals when the posting has no known keywords", async () => {
    const result = await jobAnalysisClient.analyzeJobDescription("Operations lead focused on process clarity and team coordination");

    expect(result.skillGroups[0]?.category).toBe("Encaje general");
    expect(result.summary).toContain("ejecución práctica");
  });

  it("truncates very long role titles", async () => {
    const longTitle =
      "Lead platform engineer responsible for architecture, developer experience, release reliability, observability, and cross-team technical direction at scale";

    const result = await jobAnalysisClient.analyzeJobDescription(`${longTitle}\n\nResponsibilities include...`);

    expect(result.outreachMessage.subject.length).toBeLessThanOrEqual(92);
  });
});
