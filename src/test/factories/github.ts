import { vi } from "vitest";
import type { GitHubRepositoryMetadata } from "../../lib/github-client";

interface GitHubRepositoryApiPayload {
  description?: string;
  full_name?: string;
  language?: string | null;
  name?: string;
  owner?: {
    login?: string;
  };
  topics?: string[];
}

export function createGitHubRepositoryMetadata(overrides: Partial<GitHubRepositoryMetadata> = {}): GitHubRepositoryMetadata {
  return {
    description: "React app with TypeScript",
    fullName: "ezefernandezyf/nexus-talent",
    languages: [{ name: "TypeScript", bytes: 1200 }],
    name: "nexus-talent",
    owner: "ezefernandezyf",
    primaryLanguage: "TypeScript",
    repositoryUrl: "https://github.com/ezefernandezyf/nexus-talent",
    topics: ["react", "vite"],
    warnings: [],
    ...overrides,
  };
}

export function createGitHubRepositoryApiPayload(overrides: GitHubRepositoryApiPayload = {}): GitHubRepositoryApiPayload {
  return {
    description: "React app with TypeScript",
    full_name: "ezefernandezyf/nexus-talent",
    language: "TypeScript",
    name: "nexus-talent",
    owner: {
      login: "ezefernandezyf",
    },
    topics: ["react", "vite"],
    ...overrides,
  };
}

export function createGitHubFetchResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn(async () => body),
  };
}