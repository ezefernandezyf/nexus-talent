import { useQuery } from "@tanstack/react-query";
import { createLocalAnalysisRepository, type AnalysisRepository, type SavedJobAnalysis } from "../../../lib/repositories";

interface UseAnalysisHistoryOptions {
  repository?: AnalysisRepository;
}

export const ANALYSIS_HISTORY_QUERY_KEY = ["analysis-history"] as const;

const defaultRepository = createLocalAnalysisRepository();

function sortByCreatedAtDesc(left: SavedJobAnalysis, right: SavedJobAnalysis) {
  return right.createdAt.localeCompare(left.createdAt);
}

export function useAnalysisHistory(options: UseAnalysisHistoryOptions = {}) {
  const repository = options.repository ?? defaultRepository;

  const query = useQuery({
    queryKey: ANALYSIS_HISTORY_QUERY_KEY,
    queryFn: async () => repository.getAll(),
    select: (analyses) => [...analyses].sort(sortByCreatedAtDesc),
  });

  return {
    ...query,
    analyses: query.data ?? [],
  };
}