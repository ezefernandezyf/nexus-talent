import { useMemo } from "react";
import {
  createHttpAnalysisRepository,
  type AnalysisRepository,
} from "../../../lib/repositories";

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
