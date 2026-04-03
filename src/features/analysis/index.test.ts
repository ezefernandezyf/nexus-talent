import { describe, expect, it } from "vitest";
import { AnalysisFeature, AnalysisResultView, JobDescriptionForm, useJobAnalysis } from ".";

describe("analysis barrel exports", () => {
  it("re-exports the analysis module API", () => {
    expect(AnalysisFeature).toBeTypeOf("function");
    expect(AnalysisResultView).toBeTypeOf("function");
    expect(JobDescriptionForm).toBeTypeOf("function");
    expect(useJobAnalysis).toBeTypeOf("function");
  });
});