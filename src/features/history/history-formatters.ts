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

export function getHistoryCompanyLabel(analysis: Pick<SavedJobAnalysis, "displayName" | "jobDescription">) {
  const displayName = analysis.displayName?.trim();

  return displayName && displayName.length > 0 ? displayName : getHistoryCardTitle(analysis);
}

export function getHistoryRoleLabel(analysis: Pick<SavedJobAnalysis, "skillGroups" | "jobDescription">) {
  const lines = analysis.jobDescription
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length > 1) {
    return lines[1];
  }

  const firstCategory = analysis.skillGroups[0]?.category.trim();

  return firstCategory && firstCategory.length > 0 ? firstCategory : "Applied Role";
}

export function getHistoryUid(analysis: Pick<SavedJobAnalysis, "id" | "jobDescription">) {
  const title = getHistoryCardTitle(analysis);
  const initials = title
    .split(/\s+/)
    .map((word) => word.trim()[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const seed = `${analysis.id}:${analysis.jobDescription}`;
  let hash = 0;

  for (const character of seed) {
    hash = (hash * 31 + character.charCodeAt(0)) % 100000;
  }

  return `UID: ${String(hash).padStart(5, "0")}-${initials || "NT"}`;
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

export function getHistoryMatchPercentage(analysis: Pick<SavedJobAnalysis, "skillGroups" | "githubEnrichment" | "summary">) {
  let score = 54;

  for (const group of analysis.skillGroups) {
    for (const skill of group.skills) {
      if (skill.level === "core") {
        score += 10;
      } else if (skill.level === "strong") {
        score += 7;
      } else {
        score += 4;
      }
    }

    score += 2;
  }

  if (analysis.githubEnrichment) {
    score += analysis.githubEnrichment.detectedStack.length > 0 ? 6 : 3;
  }

  score += Math.min(6, Math.floor(analysis.summary.trim().length / 120));

  return Math.max(60, Math.min(98, score));
}

export function getHistoryMatchTone(matchPercentage: number) {
  if (matchPercentage >= 90) {
    return "primary";
  }

  if (matchPercentage >= 75) {
    return "on-surface";
  }

  return "muted";
}