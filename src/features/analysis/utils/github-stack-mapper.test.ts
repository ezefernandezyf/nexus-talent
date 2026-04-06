import { describe, expect, it } from "vitest";
import { mapGitHubRepositoryToStack } from "./github-stack-mapper";

describe("mapGitHubRepositoryToStack", () => {
  it("extracts stack signals from repository metadata", () => {
    const signals = mapGitHubRepositoryToStack({
      description: "React app with TypeScript, Supabase and Tailwind CSS",
      fullName: "ezefernandezyf/nexus-talent",
      languages: [{ name: "TypeScript", bytes: 1200 }],
      name: "nexus-talent",
      owner: "ezefernandezyf",
      primaryLanguage: "TypeScript",
      repositoryUrl: "https://github.com/ezefernandezyf/nexus-talent",
      topics: ["react", "tailwind"],
      warnings: [],
    });

    expect(signals).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "TypeScript" }),
        expect.objectContaining({ name: "React" }),
        expect.objectContaining({ name: "Tailwind CSS" }),
        expect.objectContaining({ name: "Supabase" }),
      ]),
    );
  });

  it("returns no signals when the repo metadata is uninformative", () => {
    expect(
      mapGitHubRepositoryToStack({
        description: "",
        fullName: "unknown/unknown",
        languages: [],
        name: "unknown",
        owner: "unknown",
        primaryLanguage: null,
        repositoryUrl: "https://github.com/unknown/unknown",
        topics: [],
        warnings: [],
      }),
    ).toEqual([]);
  });
});