import { useQuery } from "@tanstack/react-query";
import { createLocalAnalysisRepository, type AnalysisRepository, type SavedJobAnalysis } from "../../../lib/repositories";
import type { AnalysisPersistenceScope } from "./useAnalysisRepository";

interface UseAnalysisByIdOptions {
  repository?: AnalysisRepository;
  scope?: AnalysisPersistenceScope;
}

export const ANALYSIS_BY_ID_QUERY_KEY = ["analysis-detail"] as const;

const defaultRepository = createLocalAnalysisRepository();

export function getAnalysisByIdQueryKey(scope: AnalysisPersistenceScope, analysisId: string) {
  return [...ANALYSIS_BY_ID_QUERY_KEY, scope, analysisId] as const;
}

export function useAnalysisById(analysisId: string | undefined, options: UseAnalysisByIdOptions = {}) {
  const repository = options.repository ?? defaultRepository;
  const scope = options.scope ?? "anonymous";

  const query = useQuery<SavedJobAnalysis | null>({
    enabled: Boolean(analysisId),
    queryKey: getAnalysisByIdQueryKey(scope, analysisId ?? "missing"),
    queryFn: async () => {
      if (!analysisId) {
        return null;
      }

      return repository.getById(analysisId);
    },
  });

  return {
    ...query,
    analysis: query.data ?? null,
  };
}