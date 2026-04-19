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
      recruiterMessages: {
        emailLinkedIn: {
          subject: "Interés en el puesto",
          body: "Hola equipo,\n\nMe interesa la oportunidad.",
        },
        dmShort: {
          body: "Hola equipo, Me interesa la oportunidad.",
        },
      },
    });
  });

  it("builds a local analysis when no transport is provided", async () => {
    const result = await jobAnalysisClient.analyzeJobDescription(
      "Senior React engineer with TypeScript, testing, and communication",
    );

    expect(result.summary).toMatch(/^(Lectura rápida|Resumen ejecutivo|Panorama):/);
    expect(result.summary).toMatch(/(Señales clave|Puntos que destacan|Indicadores):/);
    expect(result.summary).toMatch(/(Implicación de contratación|Lectura de contratación|Lo que sugiere para hiring):/);
    expect(result.summary).toContain("Senior React engineer");
    expect(result.skillGroups.length).toBeGreaterThan(0);
    expect(result.vacancySummary?.responsibilities.length).toBeGreaterThan(0);
    expect(result.keywords?.hardSkills.length).toBeGreaterThan(0);
    expect(result.gaps?.length).toBeGreaterThan(0);
    expect(result.recruiterMessages?.emailLinkedIn.body).toContain("Hola equipo de recruiting");
    expect(result.outreachMessage.body).toContain("[Your Name]");
  });

  it("builds a casual outreach message when requested", async () => {
    const result = await jobAnalysisClient.analyzeJobDescription(
      "Senior React engineer with TypeScript, testing, and communication",
      JOB_ANALYSIS_MESSAGE_TONE.CASUAL,
    );

    expect(result.recruiterMessages?.emailLinkedIn.body).toContain("Comparto una presentación breve porque");
    expect(result.recruiterMessages?.emailLinkedIn.body).toContain("valor rápido y concreto");
  });

  it("builds a persuasive outreach message when requested", async () => {
    const result = await jobAnalysisClient.analyzeJobDescription(
      "Senior React engineer with TypeScript, testing, and communication",
      JOB_ANALYSIS_MESSAGE_TONE.PERSUASIVE,
    );

    expect(result.recruiterMessages?.emailLinkedIn.body).toContain("Quiero compartir por qué este perfil puede sumar desde el primer intercambio porque");
    expect(result.recruiterMessages?.emailLinkedIn.body).toContain("convertir esas prioridades en resultados concretos");
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
    expect(result.recruiterMessages?.dmShort.body).toBeTruthy();
  });

  it("keeps the local fallback path on the same normalize-then-validate contract", async () => {
    const result = await jobAnalysisClient.analyzeJobDescription(
      "Operations lead focused on process clarity and team coordination",
    );

    expect(result.skillGroups[0]?.category).toBe("Encaje general");
    expect(result.recruiterMessages?.emailLinkedIn.body).toContain("[Your Name]");
  });

  it("varies the fallback output between distinct vacancies", async () => {
    const firstResult = await jobAnalysisClient.analyzeJobDescription(
      "Senior React engineer\n\nBuild dashboards for payments and reporting.",
    );
    const secondResult = await jobAnalysisClient.analyzeJobDescription(
      "People operations lead\n\nShape onboarding, rituals, and hiring workflows.",
    );

    expect(firstResult.summary).not.toBe(secondResult.summary);
    expect(firstResult.recruiterMessages?.emailLinkedIn.subject).not.toBe(secondResult.recruiterMessages?.emailLinkedIn.subject);
    expect(firstResult.recruiterMessages?.emailLinkedIn.body).not.toBe(secondResult.recruiterMessages?.emailLinkedIn.body);
    expect(firstResult.summary).toMatch(/^(Lectura rápida|Resumen ejecutivo|Panorama):/);
    expect(secondResult.summary).toMatch(/^(Lectura rápida|Resumen ejecutivo|Panorama):/);
    expect(firstResult.recruiterMessages?.emailLinkedIn.body).not.toContain("...");
    expect(firstResult.recruiterMessages?.emailLinkedIn.body).not.toContain("…");
    expect(firstResult.recruiterMessages?.emailLinkedIn.subject).not.toContain("...");
    expect(firstResult.recruiterMessages?.emailLinkedIn.subject).not.toContain("…");
    expect(secondResult.recruiterMessages?.emailLinkedIn.body).not.toContain("...");
    expect(secondResult.recruiterMessages?.emailLinkedIn.body).not.toContain("…");
    expect(secondResult.recruiterMessages?.emailLinkedIn.subject).not.toContain("...");
    expect(secondResult.recruiterMessages?.emailLinkedIn.subject).not.toContain("…");
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
        recruiterMessages: {
          emailLinkedIn: {
            subject: "Interés A",
            body: "Hola equipo A,\n\nSaludos,\n[Your Name]",
          },
          dmShort: { body: "Hola equipo A" },
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
        recruiterMessages: {
          emailLinkedIn: {
            subject: "Interés B",
            body: "Hola equipo B,\n\nSaludos,\n[Your Name]",
          },
          dmShort: { body: "Hola equipo B" },
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
      recruiterMessages: {
        emailLinkedIn: {
          subject: "Interés",
          body: input.messageTone,
        },
        dmShort: { body: input.messageTone },
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
        recruiterMessages: {
          emailLinkedIn: { subject: "", body: "" },
          dmShort: { body: "" },
        },
        vacancySummary: {
          role: "",
          seniority: "",
          modalityLocation: "",
          responsibilities: [""],
          mustHave: [""],
          niceToHave: [""],
        },
        keywords: {
          hardSkills: [""],
          softSkills: [""],
          domainKeywords: [""],
          atsTerms: [""],
        },
        gaps: [
          { gap: "", mitigation: "", framing: "" },
        ],
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
    expect(result.summary).toMatch(/^(Lectura rápida|Resumen ejecutivo|Panorama):/);
    expect(result.summary).toContain("Señales clave");
  });

  it("truncates very long role titles", async () => {
    const longTitle =
      "Lead platform engineer responsible for architecture, developer experience, release reliability, observability, and cross-team technical direction at scale";

    const result = await jobAnalysisClient.analyzeJobDescription(`${longTitle}\n\nResponsibilities include...`);

    expect(result.outreachMessage.subject.length).toBeLessThanOrEqual(92);
    expect(result.outreachMessage.subject).not.toMatch(/\.\.\.|…$/);
    expect(result.outreachMessage.body).not.toMatch(/\.\.\.|…$/);
  });

  it("keeps sparse input coherent without repeating filler", async () => {
    const result = await jobAnalysisClient.analyzeJobDescription("Product designer");

    expect(result.summary).toContain("Product designer");
    expect(result.summary).toMatch(/(Lectura rápida|Resumen ejecutivo|Panorama):/);
    expect(result.summary).toContain("Síntesis de requisitos");
    expect(result.outreachMessage.body).toContain("Hola equipo de recruiting");
    expect(result.outreachMessage.body).not.toContain("...");
    expect(result.outreachMessage.body).not.toContain("…");
  });
});
