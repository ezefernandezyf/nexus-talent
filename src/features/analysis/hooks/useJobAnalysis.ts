import { useMutation } from "@tanstack/react-query";
import { createJobAnalysisClient, type JobAnalysisClient } from "../../../lib/ai-client";
import { JOB_ANALYSIS_INPUT_SCHEMA, type JobAnalysisResult } from "../../../schemas/job-analysis";

interface UseJobAnalysisOptions {
  client?: JobAnalysisClient;
}

const defaultClient = createJobAnalysisClient();

export function useJobAnalysis(options: UseJobAnalysisOptions = {}) {
  const client = options.client ?? defaultClient;

  const mutation = useMutation<JobAnalysisResult, Error, string>({
    mutationFn: async (jobDescription: string) => {
      try {
        const validatedInput = JOB_ANALYSIS_INPUT_SCHEMA.parse({ jobDescription });
        return await client.analyzeJobDescription(validatedInput.jobDescription);
      } catch (error) {
        if (error instanceof Error && error.message.startsWith("La respuesta de IA no es válida")) {
          throw error;
        }

        if (error instanceof Error && error.message.startsWith("Pegá una descripción del puesto")) {
          throw error;
        }

        throw new Error("No se pudo completar el análisis.");
      }
    },
    retry: false,
  });

  return {
    ...mutation,
    submitAnalysis: mutation.mutate,
  };
}