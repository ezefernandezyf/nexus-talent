import { useQuery } from "@tanstack/react-query";
import { createHttpAnalysisRepository } from "../api/http-repository";
import type { AnalysisPage, AnalysisRepository, SavedJobAnalysis } from "../api/repository";
import type { AnalysisPersistenceScope } from "./useAnalysisRepository";

interface UseAnalysisHistoryOptions {
  repository?: AnalysisRepository;
  scope?: AnalysisPersistenceScope;
  /** Server-side pagination params passed to the repository */
  page?: AnalysisPage;
}

export const ANALYSIS_HISTORY_QUERY_KEY = ["analysis-history"] as const;

const defaultRepository = createHttpAnalysisRepository();

export function getAnalysisHistoryQueryKey(scope: AnalysisPersistenceScope = "anonymous", page?: AnalysisPage) {
  if (page) {
    return [...ANALYSIS_HISTORY_QUERY_KEY, scope, page] as const;
  }
  return [...ANALYSIS_HISTORY_QUERY_KEY, scope] as const;
}

function sortByCreatedAtDesc(left: SavedJobAnalysis, right: SavedJobAnalysis) {
  return right.createdAt.localeCompare(left.createdAt);
}

export function useAnalysisHistory(options: UseAnalysisHistoryOptions = {}) {
  const repository = options.repository ?? defaultRepository;
  const scope = options.scope ?? "anonymous";

  const query = useQuery({
    queryKey: getAnalysisHistoryQueryKey(scope, options.page),
    queryFn: async () => repository.getAll(options.page),
    select: (result) => ({
      items: [...result.items].sort(sortByCreatedAtDesc),
      total: result.total,
    }),
  });

  return {
    ...query,
    analyses: query.data?.items ?? [],
    total: query.data?.total ?? 0,
  };
}