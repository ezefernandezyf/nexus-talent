import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createHttpAnalysisRepository } from "@/features/analysis/api/http-repository";
import type { AnalysisRepository } from "@/features/analysis/api/repository";
import { getAnalysisHistoryQueryKey } from "@/features/analysis/hooks/useAnalysisHistory";
import type { AnalysisPersistenceScope } from "@/features/analysis/hooks/useAnalysisRepository";

interface UseDeleteAnalysisOptions {
  repository?: AnalysisRepository;
  scope?: AnalysisPersistenceScope;
}

const defaultRepository = createHttpAnalysisRepository();

export function useDeleteAnalysis(options: UseDeleteAnalysisOptions = {}) {
  const repository = options.repository ?? defaultRepository;
  const scope = options.scope ?? "anonymous";
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (analysisId: string) => {
      await repository.delete(analysisId);
      return analysisId;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: getAnalysisHistoryQueryKey(scope) });
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