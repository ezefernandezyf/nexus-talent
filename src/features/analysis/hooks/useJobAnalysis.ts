import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createJobAnalysisClient, type JobAnalysisClient } from "../../../lib/ai-client";
import { isAIOrchestratorError } from "../../../lib/ai-errors";
import { createLocalAnalysisRepository, type AnalysisRepository } from "../../../lib/repositories";
import { JOB_ANALYSIS_INPUT_SCHEMA, type JobAnalysisResult } from "../../../schemas/job-analysis";
import { ANALYSIS_HISTORY_QUERY_KEY } from "./useAnalysisHistory";

interface UseJobAnalysisOptions {
  client?: JobAnalysisClient;
  repository?: AnalysisRepository;
}

const defaultClient = createJobAnalysisClient();
const defaultRepository = createLocalAnalysisRepository();

export function useJobAnalysis(options: UseJobAnalysisOptions = {}) {
  const client = options.client ?? defaultClient;
  const repository = options.repository ?? defaultRepository;
  const queryClient = useQueryClient();

  const mutation = useMutation<JobAnalysisResult, Error, string>({
    mutationFn: async (jobDescription: string) => {
      try {
        const validatedInput = JOB_ANALYSIS_INPUT_SCHEMA.parse({ jobDescription });
        return await client.analyzeJobDescription(validatedInput.jobDescription);
      } catch (error) {
        if (isAIOrchestratorError(error)) {
          throw error;
        }

        if (error instanceof Error && error.message.startsWith("La respuesta de IA no es válida")) {
          throw error;
        }

        if (error instanceof Error && error.message.startsWith("Pegá una descripción del puesto")) {
          throw error;
        }

        throw new Error("No se pudo completar el análisis.");
      }
    },
    onSuccess: (analysis, jobDescription) => {
      void repository
        .save(jobDescription, analysis)
        .then(() => queryClient.invalidateQueries({ queryKey: ANALYSIS_HISTORY_QUERY_KEY }))
        .catch(() => undefined);
    },
    retry: false,
  });

  return {
    ...mutation,
    submitAnalysis: mutation.mutate,
  };
}