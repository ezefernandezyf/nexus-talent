import {
  AI_ERROR_CODES,
  createAIOrchestratorError,
  isAIOrchestratorError,
  type AIErrorCode,
} from "./ai-errors";
import { type JobAnalysisInput } from "../schemas/job-analysis";
import { GROQ_JOB_ANALYSIS_JSON_SCHEMA } from "./validation";

const GROQ_CHAT_COMPLETIONS_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_GROQ_MODEL = "openai/gpt-oss-20b";

export interface ProviderRequest {
  execute(signal: AbortSignal): Promise<unknown>;
}

export interface ProviderAdapter<Input = unknown> {
  id: string;
  providerName: string;
  isTransientError(error: unknown): boolean;
  mapErrorToUserMessage(error: unknown): string;
  buildRequest(input: Input): ProviderRequest;
  parseResponse(response: unknown): unknown;
}

export type ProviderFallbackTransport<Input> = (input: Input) => Promise<unknown> | unknown;

interface GroqProviderAdapterOptions {
  apiKey?: string;
  fallbackTransport?: ProviderFallbackTransport<JobAnalysisInput>;
  fetchImpl?: typeof fetch;
  model?: string;
}

interface GroqChatMessage {
  content: string;
  role: "system" | "user";
}

interface GroqChatCompletionEnvelope {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
}

function readStatus(error: unknown) {
  if (isAIOrchestratorError(error) && typeof error.status === "number") {
    return error.status;
  }

  if (error instanceof Error && "status" in error) {
    const status = (error as { status?: unknown }).status;
    return typeof status === "number" ? status : undefined;
  }

  return undefined;
}

function buildGroqMessages(input: JobAnalysisInput): GroqChatMessage[] {
  return [
    {
      role: "system",
      content:
        "Sos un analizador de vacantes. Devolvé un JSON estricto con summary, skillGroups y outreachMessage, sin texto extra.",
    },
    {
      role: "user",
      content: input.jobDescription,
    },
  ];
}

function mapStatusToCode(status: number): AIErrorCode {
  if (status === 429) {
    return AI_ERROR_CODES.RATE_LIMIT_EXCEEDED;
  }

  if (status >= 500) {
    return AI_ERROR_CODES.TRANSIENT_FAILURE;
  }

  return AI_ERROR_CODES.PERMANENT_FAILURE;
}

function mapStatusToMessage(status: number) {
  if (status === 429) {
    return "Groq alcanzó el límite de uso disponible.";
  }

  if (status >= 500) {
    return "Groq no respondió de forma confiable.";
  }

  return "Groq rechazó la solicitud.";
}

function parseGroqEnvelope(response: GroqChatCompletionEnvelope) {
  const content = response.choices?.[0]?.message?.content;

  if (typeof content !== "string" || content.trim().length === 0) {
    throw createAIOrchestratorError(
      AI_ERROR_CODES.PERMANENT_FAILURE,
      "La respuesta de Groq no incluyó contenido utilizable.",
      { retryable: false },
    );
  }

  return JSON.parse(content) as unknown;
}

export function createGroqProviderAdapter(options: GroqProviderAdapterOptions = {}): ProviderAdapter<JobAnalysisInput> {
  const apiKey = options.apiKey ?? import.meta.env.VITE_GROQ_API_KEY;
  const model = options.model ?? import.meta.env.VITE_GROQ_MODEL ?? DEFAULT_GROQ_MODEL;
  const fetchImpl = options.fetchImpl ?? globalThis.fetch?.bind(globalThis);
  const fallbackTransport = options.fallbackTransport;

  return {
    id: "groq",
    providerName: "Groq",
    isTransientError(error: unknown) {
      if (isAIOrchestratorError(error)) {
        return error.retryable && error.code !== AI_ERROR_CODES.RATE_LIMIT_EXCEEDED;
      }

      if (error instanceof DOMException && error.name === "AbortError") {
        return true;
      }

      const status = readStatus(error);
      if (status === 429) {
        return false;
      }

      if (typeof status === "number") {
        return status >= 500;
      }

      return error instanceof Error && /timeout|network|fetch/i.test(error.message);
    },
    mapErrorToUserMessage(error: unknown) {
      if (isAIOrchestratorError(error)) {
        return error.message;
      }

      const status = readStatus(error);
      if (status === 429) {
        return "Groq alcanzó el límite de uso disponible. Intentá más tarde.";
      }

      if (status === 401 || status === 403) {
        return "Groq rechazó la autenticación de la solicitud.";
      }

      if (typeof status === "number" && status >= 500) {
        return "Groq no respondió de forma confiable.";
      }

      if (error instanceof DOMException && error.name === "AbortError") {
        return "Groq tardó demasiado en responder.";
      }

      if (error instanceof Error && /timeout|network|fetch/i.test(error.message)) {
        return "Groq tardó demasiado en responder.";
      }

      return "No se pudo completar la solicitud contra Groq.";
    },
    buildRequest(input: JobAnalysisInput) {
      return {
        async execute(signal: AbortSignal) {
          if (!apiKey || !fetchImpl) {
            if (fallbackTransport) {
              return Promise.resolve(fallbackTransport(input));
            }

            throw createAIOrchestratorError(
              AI_ERROR_CODES.UNKNOWN_ERROR,
              "Groq no está configurado y no hay transporte de respaldo.",
              { retryable: false },
            );
          }

          const response = await fetchImpl(GROQ_CHAT_COMPLETIONS_URL, {
            method: "POST",
            signal,
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model,
              messages: buildGroqMessages(input),
              response_format: {
                type: "json_schema",
                json_schema: {
                  name: "job_analysis",
                  strict: true,
                  schema: GROQ_JOB_ANALYSIS_JSON_SCHEMA,
                },
              },
            }),
          });

          if (!response.ok) {
            const status = response.status;
            throw createAIOrchestratorError(mapStatusToCode(status), mapStatusToMessage(status), {
              status,
              retryable: status >= 500,
            });
          }

          return response.json();
        },
      };
    },
    parseResponse(response: unknown) {
      if (typeof response === "string") {
        return JSON.parse(response) as unknown;
      }

      const envelope = response as GroqChatCompletionEnvelope;
      if (envelope?.choices?.length) {
        return parseGroqEnvelope(envelope);
      }

      return response;
    },
  };
}