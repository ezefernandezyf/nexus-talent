import { describe, expect, it } from "vitest";
import {
  JOB_ANALYSIS_INPUT_SCHEMA,
  JOB_ANALYSIS_RESULT_SCHEMA,
  SAVED_JOB_ANALYSIS_SCHEMA,
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

  it("accepts a valid saved analysis record", () => {
    expect(
      SAVED_JOB_ANALYSIS_SCHEMA.parse({
        id: "550e8400-e29b-41d4-a716-446655440000",
        createdAt: "2026-04-05T12:00:00.000Z",
        jobDescription: "Senior React engineer needed for a product team.",
        displayName: "Frontend Lead",
        notes: "Keep the outreach message focused on product impact.",
        summary: "A focused role for building modern product experiences.",
        skillGroups: [
          {
            category: "Core stack",
            skills: [{ name: "React", level: "core" }],
          },
        ],
        outreachMessage: {
          subject: "Interest in the role",
          body: "Hi team,\n\nI would love to discuss the opportunity.\n\nBest,\n[Your Name]",
        },
      }),
    ).toEqual({
      id: "550e8400-e29b-41d4-a716-446655440000",
      createdAt: "2026-04-05T12:00:00.000Z",
      jobDescription: "Senior React engineer needed for a product team.",
      displayName: "Frontend Lead",
      notes: "Keep the outreach message focused on product impact.",
      summary: "A focused role for building modern product experiences.",
      skillGroups: [
        {
          category: "Core stack",
          skills: [{ name: "React", level: "core" }],
        },
      ],
      outreachMessage: {
        subject: "Interest in the role",
        body: "Hi team,\n\nI would love to discuss the opportunity.\n\nBest,\n[Your Name]",
      },
    });
  });

  it("rejects saved analyses without required metadata", () => {
    expect(() =>
      SAVED_JOB_ANALYSIS_SCHEMA.parse({
        summary: "A focused role for building modern product experiences.",
        skillGroups: [
          {
            category: "Core stack",
            skills: [{ name: "React", level: "core" }],
          },
        ],
        outreachMessage: {
          subject: "Interest in the role",
          body: "Hi team,\n\nI would love to discuss the opportunity.\n\nBest,\n[Your Name]",
        },
      }),
    ).toThrowError();
  });

  it("rejects saved analyses with malformed timestamps", () => {
    expect(() =>
      SAVED_JOB_ANALYSIS_SCHEMA.parse({
        id: "550e8400-e29b-41d4-a716-446655440000",
        createdAt: "not-an-iso-date",
        jobDescription: "Senior React engineer needed for a product team.",
        summary: "A focused role for building modern product experiences.",
        skillGroups: [
          {
            category: "Core stack",
            skills: [{ name: "React", level: "core" }],
          },
        ],
        outreachMessage: {
          subject: "Interest in the role",
          body: "Hi team,\n\nI would love to discuss the opportunity.\n\nBest,\n[Your Name]",
        },
      }),
    ).toThrowError();
  });

  it("rejects saved analyses with malformed editable metadata", () => {
    expect(() =>
      SAVED_JOB_ANALYSIS_SCHEMA.parse({
        id: "550e8400-e29b-41d4-a716-446655440000",
        createdAt: "2026-04-05T12:00:00.000Z",
        jobDescription: "Senior React engineer needed for a product team.",
        displayName: 123,
        notes: "Valid note",
        summary: "A focused role for building modern product experiences.",
        skillGroups: [
          {
            category: "Core stack",
            skills: [{ name: "React", level: "core" }],
          },
        ],
        outreachMessage: {
          subject: "Interest in the role",
          body: "Hi team,\n\nI would love to discuss the opportunity.\n\nBest,\n[Your Name]",
        },
      }),
    ).toThrowError();
  });
});