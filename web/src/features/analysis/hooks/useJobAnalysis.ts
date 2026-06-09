import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { createJobAnalysisClient, type JobAnalysisClient } from "../../../lib/ai-client";
import { isAIOrchestratorError } from "../../../lib/ai-errors";
import { createGitHubClient, type GitHubClient } from "../../../lib/github-client";
import { createLocalAnalysisRepository, type AnalysisRepository } from "../../../lib/repositories";
import {
  JOB_ANALYSIS_REQUEST_SCHEMA,
  type JobAnalysisRequest,
  type JobAnalysisResult,
} from "../../../schemas/job-analysis";
import { mapGitHubRepositoryToStack } from "../utils/github-stack-mapper";
import { getAnalysisHistoryQueryKey } from "./useAnalysisHistory";
import type { AnalysisPersistenceScope } from "./useAnalysisRepository";

interface UseJobAnalysisOptions {
  client?: JobAnalysisClient;
  githubClient?: GitHubClient;
  repository?: AnalysisRepository;
  scope?: AnalysisPersistenceScope;
}

const defaultClient = createJobAnalysisClient();
const defaultGitHubClient = createGitHubClient();
const defaultRepository = createLocalAnalysisRepository();

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
    githubRepositoryUrl: validatedRequest.githubRepositoryUrl?.trim() || undefined,
  };
}

function createSubmissionKey(request: JobAnalysisRequest) {
  return [request.jobDescription, request.messageTone, request.githubRepositoryUrl ?? ""].join("::");
}

export function useJobAnalysis(options: UseJobAnalysisOptions = {}) {
  const client = options.client ?? defaultClient;
  const githubClient = options.githubClient ?? defaultGitHubClient;
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
        const githubRepositoryUrl = validatedInput.githubRepositoryUrl;
        const analysisPromise = client.analyzeJobDescription(validatedInput.jobDescription, validatedInput.messageTone);
        const githubPromise = githubRepositoryUrl ? githubClient.lookupRepository(githubRepositoryUrl) : Promise.resolve(null);

        const [analysisResult, githubResult] = await Promise.allSettled([analysisPromise, githubPromise]);

        if (analysisResult.status === "rejected") {
          throw analysisResult.reason;
        }

        const analysis = analysisResult.value;

        if (!githubRepositoryUrl) {
          return analysis;
        }

        if (githubResult.status === "fulfilled" && githubResult.value) {
          const detectedStack = mapGitHubRepositoryToStack(githubResult.value);
          const warningMessage = githubResult.value.warnings.length > 0
            ? githubResult.value.warnings.join(" ")
            : detectedStack.length === 0
              ? "No se detectaron señales claras del stack en el repositorio de GitHub."
              : undefined;

          return {
            ...analysis,
            githubEnrichment: {
              repositoryName: githubResult.value.fullName,
              repositoryUrl: githubResult.value.repositoryUrl,
              detectedStack,
              warningMessage,
            },
          };
        }

        const warningMessage = githubResult.status === "rejected" && githubResult.reason instanceof Error
          ? githubResult.reason.message
          : "No se pudo completar la consulta a GitHub.";

        return {
          ...analysis,
          githubEnrichment: {
            repositoryName: githubRepositoryUrl,
            repositoryUrl: githubRepositoryUrl,
            detectedStack: [],
            warningMessage,
          },
        };
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