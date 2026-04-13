import { describe, expect, it } from "vitest";
import { createSavedAnalysis } from "../../test/factories/analysis";
import { JOB_ANALYSIS_SKILL_LEVEL } from "../../schemas/job-analysis";
import { getHistoryMatchPercentage, getHistoryMatchTone } from "./history-formatters";

describe("history-formatters", () => {
  it("applies the GitHub bonus path and all match tones", () => {
    const baseAnalysis = createSavedAnalysis({
      skillGroups: [
        {
          category: "Core",
          skills: [{ name: "React", level: JOB_ANALYSIS_SKILL_LEVEL.CORE }],
        },
        {
          category: "Quality",
          skills: [{ name: "Testing", level: JOB_ANALYSIS_SKILL_LEVEL.STRONG }],
        },
      ],
      summary: "Short summary.",
    });

    const enrichedAnalysis = createSavedAnalysis({
      ...baseAnalysis,
      githubEnrichment: {
        repositoryName: "ezefernandezyf/nexus-talent",
        repositoryUrl: "https://github.com/ezefernandezyf/nexus-talent",
        detectedStack: [{ name: "React", source: "github" }],
      },
    });

    const baseScore = getHistoryMatchPercentage(baseAnalysis);
    const enrichedScore = getHistoryMatchPercentage(enrichedAnalysis);

    expect(enrichedScore).toBeGreaterThan(baseScore);
    expect(getHistoryMatchTone(92)).toBe("primary");
    expect(getHistoryMatchTone(81)).toBe("on-surface");
    expect(getHistoryMatchTone(64)).toBe("muted");
  });
});