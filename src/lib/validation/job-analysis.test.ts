import { describe, expect, it } from "vitest";
import { normalizeJobAnalysisResponse } from "../mappers/job-analysis";
import { validateJobAnalysisResult } from "./job-analysis";

describe("validateJobAnalysisResult", () => {
  it("accepts a normalized mapped payload", () => {
    const payload = normalizeJobAnalysisResponse({
      summary: "  Senior React engineer  ",
      skillGroups: [
        {
          category: "  Stack principal  ",
          skills: [{ name: "  React  ", level: "CORE" }],
        },
      ],
      outreachMessage: {
        subject: "  Interés en el puesto  ",
        body: "  Hola equipo  ",
      },
    });

    expect(validateJobAnalysisResult(payload)).toEqual(payload);
  });

  it("rejects schema violations and unknown keys", () => {
    expect(() =>
      validateJobAnalysisResult({
        summary: "",
        skillGroups: [],
        outreachMessage: { subject: "", body: "" },
      }),
    ).toThrowError();

    expect(() =>
      validateJobAnalysisResult({
        summary: "Valid summary",
        skillGroups: [
          {
            category: "Stack principal",
            skills: [{ name: "React", level: "core" }],
          },
        ],
        outreachMessage: {
          subject: "Interés",
          body: "Hola equipo",
        },
        unexpectedField: true,
      }),
    ).toThrowError();
  });
});