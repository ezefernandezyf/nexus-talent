import { describe, expect, it } from "vitest";
import { mapGitHubRepositoryToStack } from "./github-stack-mapper";
import { createGitHubRepositoryMetadata } from "../../../test/factories/github";

describe("mapGitHubRepositoryToStack", () => {
  it("extracts stack signals from repository metadata", () => {
    const signals = mapGitHubRepositoryToStack(
      createGitHubRepositoryMetadata({
        description: "React app with TypeScript, Supabase and Tailwind CSS",
        topics: ["react", "tailwind"],
      }),
    );

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
      mapGitHubRepositoryToStack(
        createGitHubRepositoryMetadata({
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
      ),
    ).toEqual([]);
  });
});