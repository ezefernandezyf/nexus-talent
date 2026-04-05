import { describe, expect, it } from "vitest";
import { JOB_ANALYSIS_SKILL_LEVEL } from "../../schemas/job-analysis";
import { normalizeJobAnalysisResponse } from "./job-analysis";

describe("normalizeJobAnalysisResponse", () => {
  it("normalizes dirty payloads, strips unknown keys, and canonicalizes enum values", () => {
    const normalized = normalizeJobAnalysisResponse({
      summary: "  Senior React engineer  ",
      extraTopLevel: "remove-me",
      skillGroups: [
        {
          category: "  Stack principal  ",
          ignoreMe: true,
          skills: [
            {
              name: "  React  ",
              level: "CORE",
              extraSkillField: "remove-me",
            },
            {
              name: "TypeScript",
              level: "Strong",
            },
            {
              name: "Testing",
              level: "adjacent",
            },
          ],
        },
      ],
      outreachMessage: {
        subject: "  Interés en el puesto  ",
        body: "  Hola equipo  ",
        draftBody: "  borrador opcional  ",
      },
    });

    expect(normalized).toEqual({
      summary: "Senior React engineer",
      skillGroups: [
        {
          category: "Stack principal",
          skills: [
            { name: "React", level: JOB_ANALYSIS_SKILL_LEVEL.CORE },
            { name: "TypeScript", level: JOB_ANALYSIS_SKILL_LEVEL.STRONG },
            { name: "Testing", level: JOB_ANALYSIS_SKILL_LEVEL.ADJACENT },
          ],
        },
      ],
      outreachMessage: {
        subject: "Interés en el puesto",
        body: "Hola equipo",
      },
    });

    expect(normalized).not.toHaveProperty("extraTopLevel");
    expect(normalized.skillGroups[0]).not.toHaveProperty("ignoreMe");
    expect(normalized.skillGroups[0]?.skills[0]).not.toHaveProperty("extraSkillField");
  });

  it("keeps canonical structure when optional raw-only fields are missing", () => {
    const normalized = normalizeJobAnalysisResponse({
      summary: "Un rol enfocado en producto",
      skillGroups: [
        {
          category: "Entrega",
          skills: [{ name: "API", level: "core" }],
        },
      ],
      outreachMessage: {
        subject: "Interés",
        body: "Hola equipo",
      },
    });

    expect(normalized).toEqual({
      summary: "Un rol enfocado en producto",
      skillGroups: [
        {
          category: "Entrega",
          skills: [{ name: "API", level: JOB_ANALYSIS_SKILL_LEVEL.CORE }],
        },
      ],
      outreachMessage: {
        subject: "Interés",
        body: "Hola equipo",
      },
    });
  });
});