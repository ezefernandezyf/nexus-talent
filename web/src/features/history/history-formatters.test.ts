import { describe, expect, it } from "vitest";
import { createSavedAnalysis } from "../../test/factories/analysis";
import { JOB_ANALYSIS_SKILL_LEVEL } from "../../schemas/job-analysis";
import {
  formatHistoryCardDate,
  getHistoryCardTitle,
  getHistoryCompanyLabel,
  getHistoryRoleLabel,
  getHistorySummarySnippet,
  getHistoryUid,
  getTopHistorySkills,
} from "./history-formatters";

describe("history-formatters", () => {
  it("formats the visible history metadata helpers", () => {
    const analysis = createSavedAnalysis({
      displayName: "Frontend Lead",
      jobDescription: "Frontend Engineer\nBuild resilient systems",
      skillGroups: [
        {
          category: "Core",
          skills: [
            { name: "React", level: JOB_ANALYSIS_SKILL_LEVEL.CORE },
            { name: "TypeScript", level: JOB_ANALYSIS_SKILL_LEVEL.STRONG },
            { name: "React", level: JOB_ANALYSIS_SKILL_LEVEL.ADJACENT },
          ],
        },
      ],
      summary: "A long summary that should be shortened after the requested limit is reached. It also keeps whitespace stable.",
    });

    expect(getHistoryCardTitle(analysis)).toBe("Frontend Engineer");
    expect(getHistoryCompanyLabel(analysis)).toBe("Frontend Lead");
    expect(getHistoryRoleLabel(analysis)).toBe("Build resilient systems");
    expect(getHistoryUid(analysis)).toMatch(/^UID: \d{5}-FE$/);
    expect(formatHistoryCardDate("2026-04-05T12:05:00.000Z")).toMatch(/5 abr 2026/i);
    expect(getHistorySummarySnippet("  One   two   three  ", 80)).toBe("One two three");
    const truncatedSummary = getHistorySummarySnippet(analysis.summary, 40);

    expect(truncatedSummary).toMatch(/…$/);
    expect(truncatedSummary).toContain("A long summary that should be");
    expect(getTopHistorySkills(analysis)).toEqual(["React", "TypeScript"]);
  });
});