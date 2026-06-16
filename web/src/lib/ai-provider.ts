import {
  AI_ERROR_CODES,
  createAIOrchestratorError,
  isAIOrchestratorError,
  type AIErrorCode,
} from "./ai-errors";
import { JOB_ANALYSIS_MESSAGE_TONE, type JobAnalysisInput, type JobAnalysisMessageTone } from "../schemas/job-analysis";
import { GROQ_JOB_ANALYSIS_JSON_SCHEMA } from "./validation";

const BACKEND_PROXY_URL = "/api/ai/analyze";

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
  fallbackTransport?: ProviderFallbackTransport<JobAnalysisPromptInput>;
  fetchImpl?: typeof fetch;
  model?: string;
}

export interface JobAnalysisPromptInput {
  jobDescription: string;
  messageTone: JobAnalysisMessageTone;
}

interface BackendProxyAdapterOptions {
  fallbackTransport?: ProviderFallbackTransport<JobAnalysisPromptInput>;
  fetchImpl?: typeof fetch;
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

function buildGroqMessages(input: JobAnalysisPromptInput): GroqChatMessage[] {
  const toneInstruction =
    input.messageTone === JOB_ANALYSIS_MESSAGE_TONE.CASUAL
      ? "Usá un tono casual, directo y cercano."
      : input.messageTone === JOB_ANALYSIS_MESSAGE_TONE.PERSUASIVE
        ? "Usá un tono persuasivo, enérgico y orientado a resultados."
        : "Usá un tono formal, ejecutivo y claro.";

  return [
    {
      role: "system",
      content: `Sos un analizador de vacantes. Devolvé un JSON estricto con summary, vacancySummary, skillGroups, keywords, gaps, outreachMessage y recruiterMessages, sin texto extra. El summary debe ser una lectura ejecutiva breve, clara y orientada a recruiting. vacancySummary debe traer bullets sobre el rol, seniority, modalidad/ubicación, top 5 responsabilidades y must-have vs nice-to-have. keywords debe separar hard skills, soft skills, dominio/negocio y términos ATS exactos de la vacante. gaps debe incluir 3 posibles faltantes con mitigación y encuadre al comunicar. outreachMessage debe funcionar como la versión A lista para email/LinkedIn: tono profesional, humano y directo, 120 a 180 palabras, con conexión al rol o empresa, match con 3 requisitos clave, 2 a 3 logros o impactos y cierre con CTA para pedir una llamada. recruiterMessages.dmShort debe ser la versión B para DM corto, con un máximo de 600 caracteres y el mismo tono. No reutilices plantillas genéricas entre vacantes; cambiá el énfasis según seniority, dominio y señales reales del puesto. Mantené el lenguaje natural y respetá un límite de longitud que evite cortes bruscos, palabras partidas o artefactos de truncación. ${toneInstruction}`,
    },
    {
      role: "user",
      content: `Tono del mensaje: ${input.messageTone}\n\nDescripción del puesto:\n${input.jobDescription}`,
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

export function createGroqProviderAdapter(options: GroqProviderAdapterOptions = {}): ProviderAdapter<JobAnalysisPromptInput> {
  const apiKey = options.apiKey;
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

/**
 * Maps HTTP status codes from the backend proxy to AIOrchestratorError codes.
 * - 400 → PermanentFailure (bad input)
 * - 429 → RateLimit
 * - 502 → TransientFailure (Groq upstream failure)
 */
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

/**
 * Creates a `ProviderAdapter` that proxies analysis requests through the
 * backend POST /api/ai/analyze endpoint instead of calling Groq directly.
 *
 * On network errors (fetch throws), falls back to `fallbackTransport`.
 * On HTTP errors, maps the status code to `AIOrchestratorError`.
 * On success, passes through the server-validated response.
 */
export function createBackendProxyAdapter(options: BackendProxyAdapterOptions = {}): ProviderAdapter<JobAnalysisPromptInput> {
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