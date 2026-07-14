import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { createJobAnalysisClient, type JobAnalysisClient } from "@/features/analysis/api/ai-client";
import { isAIOrchestratorError } from "@/features/analysis/api/ai-errors";
import { createHttpAnalysisRepository } from "@/features/analysis/api/http-repository";
import type { AnalysisRepository } from "@/features/analysis/api/repository";
import {
  JOB_ANALYSIS_REQUEST_SCHEMA,
  type JobAnalysisRequest,
  type JobAnalysisResult,
} from "@/features/analysis/schemas/job-analysis";
import { getAnalysisHistoryQueryKey } from "./useAnalysisHistory";
import type { AnalysisPersistenceScope } from "./useAnalysisRepository";

interface UseJobAnalysisOptions {
  client?: JobAnalysisClient;
  repository?: AnalysisRepository;
  scope?: AnalysisPersistenceScope;
}

const defaultClient = createJobAnalysisClient();
const defaultRepository = createHttpAnalysisRepository();

type AnalysisViewState = {
  data: JobAnalysisResult | undefined;
  error: Error | null;
  status: "idle" | "pending" | "success" | "error";
};

function normalizeSubmission(request: JobAnalysisRequest): JobAnalysisRequest {
  const validatedRequest = JOB_ANALYSIS_REQUEST_SCHEMA.parse(request);

  return {
    jobDescription: validatedRequest.jobDescription,
    messageTone: validatedRequest.messageTone,
  };
}

function createSubmissionKey(request: JobAnalysisRequest) {
  return [request.jobDescription, request.messageTone].join("::");
}

export function useJobAnalysis(options: UseJobAnalysisOptions = {}) {
  const client = options.client ?? defaultClient;
  const repository = options.repository ?? defaultRepository;
  const scope = options.scope ?? "anonymous";
  const queryClient = useQueryClient();
  const activeSubmissionKeyRef = useRef<string | null>(null);
  const [viewState, setViewState] = useState<AnalysisViewState>({
    data: undefined,
    error: null,
    status: "idle",
  });

  const mutation = useMutation<JobAnalysisResult, Error, JobAnalysisRequest>({
    mutationFn: async (request: JobAnalysisRequest) => {
      try {
        const validatedInput = normalizeSubmission(request);
        const analysisResult = await client.analyzeJobDescription(validatedInput.jobDescription, validatedInput.messageTone);

        return analysisResult;
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
    onSuccess: (analysis, submission) => {
      const submissionKey = createSubmissionKey(submission);

      if (submissionKey !== activeSubmissionKeyRef.current) {
        return;
      }

      setViewState({
        data: analysis,
        error: null,
        status: "success",
      });

      void repository
        .save(submission.jobDescription, analysis)
        .then(() => queryClient.invalidateQueries({ queryKey: getAnalysisHistoryQueryKey(scope) }))
        .catch(() => undefined);
    },
    onError: (error, submission) => {
      const submissionKey = createSubmissionKey(submission);

      if (submissionKey !== activeSubmissionKeyRef.current) {
        return;
      }

      setViewState({
        data: undefined,
        error,
        status: "error",
      });
    },
    retry: false,
  });

  function submitAnalysis(request: JobAnalysisRequest) {
    const normalizedRequest = normalizeSubmission(request);
    const submissionKey = createSubmissionKey(normalizedRequest);

    activeSubmissionKeyRef.current = submissionKey;
    setViewState({
      data: undefined,
      error: null,
      status: "pending",
    });

    mutation.mutate(normalizedRequest);
  }

  return {
    ...mutation,
    data: viewState.data,
    error: viewState.error,
    isError: viewState.status === "error",
    isIdle: viewState.status === "idle",
    isPending: viewState.status === "pending",
    isSuccess: viewState.status === "success",
    status: viewState.status,
    submitAnalysis,
  };
}
