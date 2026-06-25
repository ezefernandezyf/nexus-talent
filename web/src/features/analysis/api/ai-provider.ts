import {
  AI_ERROR_CODES,
  createAIOrchestratorError,
  isAIOrchestratorError,
  type AIErrorCode,
} from "./ai-errors";
import type { JobAnalysisInput, JobAnalysisMessageTone } from "@/features/analysis/schemas/job-analysis";

// ── Constants ──────────────────────────────────────────────────

const BACKEND_PROXY_URL = "/api/ai/analyze";

// ── Public Interfaces ──────────────────────────────────────────

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

export interface JobAnalysisPromptInput {
  jobDescription: string;
  messageTone: JobAnalysisMessageTone;
}

// ── Adapter Options ────────────────────────────────────────────

interface BackendProxyAdapterOptions {
  fallbackTransport?: ProviderFallbackTransport<JobAnalysisPromptInput>;
  fetchImpl?: typeof fetch;
}

// ── Helpers ────────────────────────────────────────────────────

function mapBackendStatusToCode(status: number): AIErrorCode {
  if (status === 429) {
    return AI_ERROR_CODES.RATE_LIMIT_EXCEEDED;
  }

  if (status >= 500) {
    return AI_ERROR_CODES.TRANSIENT_FAILURE;
  }

  return AI_ERROR_CODES.PERMANENT_FAILURE;
}

function mapBackendStatusToMessage(status: number): string {
  if (status === 429) {
    return "Demasiadas solicitudes. Intentá más tarde.";
  }

  if (status >= 500) {
    return "El servicio de análisis no está disponible temporalmente.";
  }

  return "La solicitud fue rechazada por el servidor.";
}

// ── Backend Proxy Adapter ──────────────────────────────────────

/**
 * Creates a `ProviderAdapter` that proxies analysis requests through the
 * backend POST /api/ai/analyze endpoint instead of calling Groq directly.
 *
 * On network errors (fetch throws), falls back to `fallbackTransport`.
 * On HTTP errors, maps the status code to `AIOrchestratorError`.
 * On success, passes through the server-validated response.
 */
export function createBackendProxyAdapter(
  options: BackendProxyAdapterOptions = {},
): ProviderAdapter<JobAnalysisPromptInput> {
  const fetchImpl = options.fetchImpl ?? globalThis.fetch?.bind(globalThis);
  const fallbackTransport = options.fallbackTransport;

  return {
    id: "backend-proxy",
    providerName: "Backend AI Proxy",

    isTransientError(error: unknown) {
      if (isAIOrchestratorError(error)) {
        return error.retryable && error.code !== AI_ERROR_CODES.RATE_LIMIT_EXCEEDED;
      }

      if (error instanceof DOMException && error.name === "AbortError") {
        return true;
      }

      return error instanceof Error && /timeout|network|fetch/i.test(error.message);
    },

    mapErrorToUserMessage(error: unknown) {
      if (isAIOrchestratorError(error)) {
        return error.message;
      }

      if (error instanceof DOMException && error.name === "AbortError") {
        return "La solicitud tardó demasiado en responder.";
      }

      if (error instanceof Error && /timeout|network|fetch/i.test(error.message)) {
        return "No se pudo conectar con el servidor de análisis.";
      }

      return "No se pudo completar la solicitud de análisis.";
    },

    buildRequest(input: JobAnalysisPromptInput) {
      return {
        async execute(signal: AbortSignal) {
          if (!fetchImpl) {
            if (fallbackTransport) {
              return Promise.resolve(fallbackTransport(input));
            }

            throw createAIOrchestratorError(
              AI_ERROR_CODES.UNKNOWN_ERROR,
              "No hay conexión con el servidor ni transporte de respaldo.",
              { retryable: false },
            );
          }

          let response: Response;

          try {
            response = await fetchImpl(BACKEND_PROXY_URL, {
              method: "POST",
              signal,
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                jobDescription: input.jobDescription,
                messageTone: input.messageTone,
              }),
            });
          } catch {
            // Network error — trigger fallback
            if (fallbackTransport) {
              return Promise.resolve(fallbackTransport(input));
            }

            throw createAIOrchestratorError(
              AI_ERROR_CODES.TRANSIENT_FAILURE,
              "No se pudo conectar con el servidor de análisis.",
              { retryable: true },
            );
          }

          if (!response.ok) {
            const status = response.status;
            throw createAIOrchestratorError(
              mapBackendStatusToCode(status),
              mapBackendStatusToMessage(status),
              { status, retryable: status >= 500 },
            );
          }

          return response.json();
        },
      };
    },

    parseResponse(response: unknown) {
      // Server already returns a validated AnalysisResponseDTO-shaped JSON.
      // No envelope parsing needed — pass through directly.
      if (typeof response === "string") {
        return JSON.parse(response) as unknown;
      }

      return response;
    },
  };
}
