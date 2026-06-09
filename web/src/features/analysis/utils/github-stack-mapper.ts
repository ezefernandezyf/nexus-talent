import type { GitHubRepositoryMetadata } from "../../../lib/github-client";
import { type JobAnalysisGitHubStackSignal } from "../../../schemas/job-analysis";

interface GitHubSignalDefinition {
  label: string;
  source: JobAnalysisGitHubStackSignal["source"];
  patterns: RegExp[];
}

const SIGNAL_DEFINITIONS: GitHubSignalDefinition[] = [
  { label: "TypeScript", source: "languages", patterns: [/^typescript$/i] },
  { label: "JavaScript", source: "languages", patterns: [/^javascript$/i] },
  { label: "React", source: "topics", patterns: [/react/i] },
  { label: "Next.js", source: "topics", patterns: [/next(?:\.|\s)?js/i] },
  { label: "Vue", source: "topics", patterns: [/vue/i] },
  { label: "Svelte", source: "topics", patterns: [/svelte/i] },
  { label: "Tailwind CSS", source: "topics", patterns: [/tailwind/i] },
  { label: "Supabase", source: "topics", patterns: [/supabase/i] },
  { label: "Vite", source: "topics", patterns: [/vite/i] },
  { label: "Vitest", source: "topics", patterns: [/vitest/i] },
  { label: "Node.js", source: "description", patterns: [/node\.js/i, /nodejs/i, /node/i] },
  { label: "Express", source: "description", patterns: [/express/i] },
  { label: "Python", source: "languages", patterns: [/^python$/i] },
  { label: "Go", source: "languages", patterns: [/^go$/i] },
];

function buildSearchSpace(metadata: GitHubRepositoryMetadata) {
  return [
    metadata.primaryLanguage ?? "",
    metadata.description,
    ...metadata.languages.map((language) => language.name),
    ...metadata.topics,
  ];
}

export function mapGitHubRepositoryToStack(metadata: GitHubRepositoryMetadata): JobAnalysisGitHubStackSignal[] {
  const searchSpace = buildSearchSpace(metadata);
  const signals: JobAnalysisGitHubStackSignal[] = [];
  const seen = new Set<string>();

  for (const definition of SIGNAL_DEFINITIONS) {
    const matched = searchSpace.some((value) => definition.patterns.some((pattern) => pattern.test(value)));

    if (!matched || seen.has(definition.label)) {
      continue;
    }

    seen.add(definition.label);
    signals.push({
      name: definition.label,
      source: definition.source,
    });
  }

  return signals;
}