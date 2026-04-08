import { useQuery } from "@tanstack/react-query";
import { createLocalAnalysisRepository, type AnalysisRepository, type SavedJobAnalysis } from "../../../lib/repositories";
import type { AnalysisPersistenceScope } from "./useAnalysisRepository";

interface UseAnalysisHistoryOptions {
  repository?: AnalysisRepository;
  scope?: AnalysisPersistenceScope;
}

export const ANALYSIS_HISTORY_QUERY_KEY = ["analysis-history"] as const;

const defaultRepository = createLocalAnalysisRepository();

export function getAnalysisHistoryQueryKey(scope: AnalysisPersistenceScope = "anonymous") {
  return [...ANALYSIS_HISTORY_QUERY_KEY, scope] as const;
}

function sortByCreatedAtDesc(left: SavedJobAnalysis, right: SavedJobAnalysis) {
  return right.createdAt.localeCompare(left.createdAt);
}

export function useAnalysisHistory(options: UseAnalysisHistoryOptions = {}) {
  const repository = options.repository ?? defaultRepository;
  const scope = options.scope ?? "anonymous";

  const query = useQuery({
    queryKey: getAnalysisHistoryQueryKey(scope),
    queryFn: async () => repository.getAll(),
    select: (analyses) => [...analyses].sort(sortByCreatedAtDesc),
  });

  return {
    ...query,
    analyses: query.data ?? [],
  };
}