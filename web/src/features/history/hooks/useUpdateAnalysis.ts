import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createLocalAnalysisRepository, type AnalysisRepository, type AnalysisUpdatePatch } from "../../../lib/repositories";
import { getAnalysisHistoryQueryKey } from "../../analysis/hooks/useAnalysisHistory";
import { getAnalysisByIdQueryKey } from "../../analysis/hooks/useAnalysisById";
import type { AnalysisPersistenceScope } from "../../analysis/hooks/useAnalysisRepository";

interface UseUpdateAnalysisOptions {
  repository?: AnalysisRepository;
  scope?: AnalysisPersistenceScope;
}

interface UpdateAnalysisInput {
  analysisId: string;
  patch: AnalysisUpdatePatch;
}

const defaultRepository = createLocalAnalysisRepository();

export function useUpdateAnalysis(options: UseUpdateAnalysisOptions = {}) {
  const repository = options.repository ?? defaultRepository;
  const scope = options.scope ?? "anonymous";
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ analysisId, patch }: UpdateAnalysisInput) => {
      const updated = await repository.update(analysisId, patch);

      if (!updated) {
        throw new Error("No encontramos ese guardado en el historial.");
      }

      return updated;
    },
    onSuccess: async (updatedAnalysis) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: getAnalysisHistoryQueryKey(scope) }),
        queryClient.invalidateQueries({ queryKey: getAnalysisByIdQueryKey(scope, updatedAnalysis.id) }),
      ]);
    },
  });

  return {
    error: mutation.error ?? null,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    updateAnalysis: mutation.mutate,
    updateAnalysisAsync: mutation.mutateAsync,
  };
}