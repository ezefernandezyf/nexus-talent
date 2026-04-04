import { describe, expect, it } from "vitest";
import { createJobAnalysisClient, jobAnalysisClient } from "./ai-client";

describe("ai-client", () => {
  it("builds a local analysis when no transport is provided", async () => {
    const result = await jobAnalysisClient.analyzeJobDescription(
      "Senior React engineer with TypeScript, testing, and communication",
    );

    expect(result.summary).toContain("Senior React engineer");
    expect(result.skillGroups.length).toBeGreaterThan(0);
    expect(result.outreachMessage.body).toContain("[Your Name]");
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
