import { useMemo } from "react";
import { createHttpAnalysisRepository } from "../api/http-repository";
import type { AnalysisRepository } from "../api/repository";

export type AnalysisPersistenceScope = "anonymous" | "authenticated";

export interface AnalysisRepositorySelection {
  repository: AnalysisRepository;
  scope: AnalysisPersistenceScope;
}

export function useAnalysisRepository(): AnalysisRepositorySelection {
  const repository = useMemo(() => createHttpAnalysisRepository(), []);

  return useMemo(
    () => ({ repository, scope: "authenticated" as const }),
    [repository],
  );
}
