import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ANALYSIS_HISTORY_QUERY_KEY } from "../../analysis";
import { createLocalAnalysisRepository, type AnalysisRepository } from "../../../lib/repositories";

interface UseDeleteAnalysisOptions {
  repository?: AnalysisRepository;
}

const defaultRepository = createLocalAnalysisRepository();

export function useDeleteAnalysis(options: UseDeleteAnalysisOptions = {}) {
  const repository = options.repository ?? defaultRepository;
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (analysisId: string) => {
      await repository.delete(analysisId);
      return analysisId;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ANALYSIS_HISTORY_QUERY_KEY });
    },
  });

  return {
    deleteAnalysis: mutation.mutate,
    deleteAnalysisAsync: mutation.mutateAsync,
    error: mutation.error ?? null,
    isPending: mutation.isPending,
    variables: mutation.variables,
  };
}