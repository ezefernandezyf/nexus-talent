import { useMemo } from "react";
import { AUTH_STATUS, useAuth } from "../../auth";
import { createLocalAnalysisRepository, type AnalysisRepository } from "../../../lib/repositories";

export type AnalysisPersistenceScope = "anonymous" | "authenticated";

export interface AnalysisRepositorySelection {
  repository: AnalysisRepository;
  scope: AnalysisPersistenceScope;
}

const sharedRepository = createLocalAnalysisRepository();

export function useAnalysisRepository(): AnalysisRepositorySelection {
  const { status } = useAuth();
  const scope: AnalysisPersistenceScope = status === AUTH_STATUS.AUTHENTICATED ? "authenticated" : "anonymous";

  return useMemo(
    () => ({
      repository: sharedRepository,
      scope,
    }),
    [scope],
  );
}
