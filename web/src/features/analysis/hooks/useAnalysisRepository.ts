import { useMemo } from "react";
import { AUTH_STATUS, useAuth } from "../../auth";
import {
  createHttpAnalysisRepository,
  createLocalAnalysisRepository,
  type AnalysisRepository,
} from "../../../lib/repositories";

export type AnalysisPersistenceScope = "anonymous" | "authenticated";

export interface AnalysisRepositorySelection {
  repository: AnalysisRepository;
  scope: AnalysisPersistenceScope;
}

export function useAnalysisRepository(): AnalysisRepositorySelection {
  const { status } = useAuth();
  const scope: AnalysisPersistenceScope = status === AUTH_STATUS.AUTHENTICATED ? "authenticated" : "anonymous";

  const repository = useMemo(
    () =>
      status === AUTH_STATUS.AUTHENTICATED ? createHttpAnalysisRepository() : createLocalAnalysisRepository(),
    [status],
  );

  return useMemo(
    () => ({ repository, scope }),
    [repository, scope],
  );
}
