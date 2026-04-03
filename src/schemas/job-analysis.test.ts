import { describe, expect, it } from "vitest";
import {
  JOB_ANALYSIS_INPUT_SCHEMA,
  JOB_ANALYSIS_RESULT_SCHEMA,
} from "./job-analysis";

describe("job analysis schemas", () => {
  it("accepts a non-empty job description", () => {
    expect(
      JOB_ANALYSIS_INPUT_SCHEMA.parse({ jobDescription: "  Senior React engineer needed for a product team.  " }),
    ).toEqual({ jobDescription: "Senior React engineer needed for a product team." });
  });

  it("rejects an empty job description", () => {
    expect(() => JOB_ANALYSIS_INPUT_SCHEMA.parse({ jobDescription: "   " })).toThrowError();
  });

  it("accepts a valid analysis result", () => {
    expect(
      JOB_ANALYSIS_RESULT_SCHEMA.parse({
        summary: "A focused role for building modern product experiences.",
        skillGroups: [
          {
            category: "Core stack",
            skills: [
              { name: "React", level: "core" },
              { name: "TypeScript", level: "strong" },
            ],
          },
        ],
        outreachMessage: {
          subject: "Interest in the role",
          body: "Hi team,\n\nI would love to discuss the opportunity.\n\nBest,\n[Your Name]",
        },
      }),
    ).toEqual({
      summary: "A focused role for building modern product experiences.",
      skillGroups: [
        {
          category: "Core stack",
          skills: [
            { name: "React", level: "core" },
            { name: "TypeScript", level: "strong" },
          ],
        },
      ],
      outreachMessage: {
        subject: "Interest in the role",
        body: "Hi team,\n\nI would love to discuss the opportunity.\n\nBest,\n[Your Name]",
      },
    });
  });

  it("rejects malformed analysis payloads", () => {
    expect(() =>
      JOB_ANALYSIS_RESULT_SCHEMA.parse({
        summary: "",
        skillGroups: [],
        outreachMessage: {
          subject: "",
          body: "",
        },
      }),
    ).toThrowError();
  });
});