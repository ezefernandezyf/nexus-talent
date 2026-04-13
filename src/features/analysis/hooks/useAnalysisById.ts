import { useQuery } from "@tanstack/react-query";
import { createLocalAnalysisRepository, type AnalysisRepository, type SavedJobAnalysis } from "../../../lib/repositories";
import type { AnalysisPersistenceScope } from "./useAnalysisRepository";

interface UseAnalysisByIdOptions {
  repository?: AnalysisRepository;
  scope?: AnalysisPersistenceScope;
}

const defaultRepository = createLocalAnalysisRepository();

export function useAnalysisById(analysisId: string | undefined, options: UseAnalysisByIdOptions = {}) {
  const repository = options.repository ?? defaultRepository;
  const scope = options.scope ?? "anonymous";

  const query = useQuery<SavedJobAnalysis | null>({
    enabled: Boolean(analysisId),
    queryKey: ["analysis-detail", scope, analysisId ?? "missing"],
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