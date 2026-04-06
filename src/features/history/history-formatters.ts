import type { SavedJobAnalysis } from "../../schemas/job-analysis";

const historyDateFormatter = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function getHistoryCardTitle(analysis: Pick<SavedJobAnalysis, "jobDescription">) {
  const fallbackTitle = analysis.jobDescription
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean);

  return fallbackTitle ?? "Vacante sin título";
}

export function formatHistoryCardDate(createdAt: string) {
  return historyDateFormatter.format(new Date(createdAt));
}

export function getHistorySummarySnippet(summary: string, maxLength = 140) {
  const normalizedSummary = summary.trim().replace(/\s+/g, " ");

  if (normalizedSummary.length <= maxLength) {
    return normalizedSummary;
  }

  return `${normalizedSummary.slice(0, maxLength - 1).trimEnd()}…`;
}

export function getTopHistorySkills(analysis: Pick<SavedJobAnalysis, "skillGroups">, limit = 5) {
  const seen = new Set<string>();
  const skills: string[] = [];

  for (const group of analysis.skillGroups) {
    for (const skill of group.skills) {
      const normalizedName = skill.name.trim();

      if (!normalizedName) {
        continue;
      }

      const normalizedKey = normalizedName.toLowerCase();
      if (seen.has(normalizedKey)) {
        continue;
      }

      seen.add(normalizedKey);
      skills.push(normalizedName);

      if (skills.length >= limit) {
        return skills;
      }
    }
  }

  return skills;
}