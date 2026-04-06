import { describe, expect, it, vi } from "vitest";
import { createGitHubClient, parseGitHubRepositoryReference } from "./github-client";

function createResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn(async () => body),
  };
}

describe("github-client", () => {
  it("parses GitHub repository references", () => {
    expect(parseGitHubRepositoryReference("https://github.com/ezefernandezyf/nexus-talent.git")).toEqual({
      owner: "ezefernandezyf",
      repository: "nexus-talent",
      repositoryUrl: "https://github.com/ezefernandezyf/nexus-talent",
    });
  });

  it("looks up public repository metadata and languages", async () => {
    const fetchMock = vi.fn(async (url: string) => {
      if (url.endsWith("/languages")) {
        return createResponse({ TypeScript: 1200, JavaScript: 300 });
      }

      return createResponse({
        description: "React app with TypeScript",
        full_name: "ezefernandezyf/nexus-talent",
        language: "TypeScript",
        name: "nexus-talent",
        owner: { login: "ezefernandezyf" },
        topics: ["react", "vite"],
      });
    });

    const client = createGitHubClient({ fetch: fetchMock as unknown as typeof fetch, timeoutMs: 100 });
    const metadata = await client.lookupRepository("https://github.com/ezefernandezyf/nexus-talent");

    expect(metadata.fullName).toBe("ezefernandezyf/nexus-talent");
    expect(metadata.primaryLanguage).toBe("TypeScript");
    expect(metadata.languages[0]).toEqual({ name: "TypeScript", bytes: 1200 });
    expect(metadata.topics).toEqual(["react", "vite"]);
    expect(metadata.warnings).toEqual([]);
  });

  it("returns a warning when languages cannot be fetched", async () => {
    const fetchMock = vi.fn(async (url: string) => {
      if (url.endsWith("/languages")) {
        throw new Error("languages unavailable");
      }

      return createResponse({
        description: "React app with TypeScript",
        full_name: "ezefernandezyf/nexus-talent",
        language: "TypeScript",
        name: "nexus-talent",
        owner: { login: "ezefernandezyf" },
        topics: ["react", "vite"],
      });
    });

    const client = createGitHubClient({ fetch: fetchMock as unknown as typeof fetch, timeoutMs: 100 });
    const metadata = await client.lookupRepository("https://github.com/ezefernandezyf/nexus-talent");

    expect(metadata.languages).toEqual([]);
    expect(metadata.warnings[0]).toContain("lenguajes");
  });
});