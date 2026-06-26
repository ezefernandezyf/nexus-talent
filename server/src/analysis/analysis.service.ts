import { randomUUID } from "node:crypto";
import { analysisResponseSchema, GROQ_JOB_ANALYSIS_JSON_SCHEMA } from "../../../shared/src/schemas.js";
import type { AnalysisRequestDTO, AnalysisResponseDTO } from "../../../shared/src/schemas.js";
import { AppError } from "../infra/error-handler.js";
import { logger } from "../infra/logger.js";

// ============================================================================
// Constants
// ============================================================================

const GROQ_CHAT_COMPLETIONS_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_GROQ_MODEL = "openai/gpt-oss-20b";
const GROQ_TIMEOUT_MS = 30_000;

// ============================================================================
// Types
// ============================================================================

interface GroqChatMessage {
  content: string;
  role: "system" | "user";
}

// ============================================================================
// Internal helpers
// ============================================================================

/**
 * Build the system + user messages for the Groq prompt.
 * Ported from `web/src/lib/ai-provider.ts` `buildGroqMessages()`.
 */
function buildGroqMessages(input: AnalysisRequestDTO): GroqChatMessage[] {
  const toneInstruction =
    input.messageTone === "casual"
      ? "Usá un tono casual, directo y cercano."
      : input.messageTone === "persuasive"
        ? "Usá un tono persuasivo, enérgico y orientado a resultados."
        : "Usá un tono formal, ejecutivo y claro.";

  return [
    {
      role: "system",
      content: `Sos un analizador de vacantes. Devolvé un JSON estricto con summary, vacancySummary, skillGroups, keywords, gaps, outreachMessage y recruiterMessages, sin texto extra. El summary debe ser una lectura ejecutiva breve, clara y orientada a recruiting. vacancySummary debe traer bullets sobre el rol, seniority, modalidad/ubicación, top 5 responsabilidades y must-have vs nice-to-have. keywords debe separar hard skills, soft skills, dominio/negocio y términos ATS exactos de la vacante. gaps debe incluir 3 posibles faltantes con mitigación y encuadre al comunicar. outreachMessage debe funcionar como la versión A lista para email/LinkedIn: tono profesional, humano y directo, 120 a 180 palabras, con conexión al rol o empresa, match con 3 requisitos clave, 2 a 3 logros o impactos y cierre con CTA para pedir una llamada. recruiterMessages.dmShort debe ser la versión B para DM corto, con un máximo de 600 caracteres y el mismo tono. No reutilices plantillas genéricas entre vacantes; cambiá el énfasis según seniority, dominio y señales reales del puesto. Mantené el lenguaje natural y respetá un límite de longitud que evite cortes bruscos, palabras partidas o artefactos de truncación. ${toneInstruction}`,
    },
    {
      role: "user",
      content: `Tono del mensaje: ${input.messageTone ?? "formal"}\n\nDescripción del puesto:\n${input.jobDescription}`,
    },
  ];
}

/**
 * Call the Groq API with the given messages and return the raw response body.
 */
async function fetchGroq(messages: GroqChatMessage[], signal: AbortSignal): Promise<unknown> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new AppError(502, "GROQ_API_KEY is not configured on the server.");
  }

  const response = await fetch(GROQ_CHAT_COMPLETIONS_URL, {
    method: "POST",
    signal,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL ?? DEFAULT_GROQ_MODEL,
      messages,
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
    logger.warn({ status: response.status, statusText: response.statusText }, "Groq API returned non-OK status");
    throw new AppError(502, `Groq API responded with status ${response.status}.`);
  }

  const body = (await response.json()) as unknown;
  return body;
}

/**
 * Extract the parsed JSON content from a Groq chat completion envelope.
 */
function parseGroqEnvelope(envelope: unknown): unknown {
  const env = envelope as { choices?: Array<{ message?: { content?: string | null } }> };
  const content = env.choices?.[0]?.message?.content;

  if (typeof content !== "string" || content.trim().length === 0) {
    throw new AppError(502, "Groq response did not include usable content.");
  }

  try {
    return JSON.parse(content) as unknown;
  } catch {
    throw new AppError(502, "Groq returned invalid JSON.");
  }
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Analyze a job description via the Groq API.
 * Returns a validated `AnalysisResponseDTO`.
 */
export async function analyze(input: AnalysisRequestDTO): Promise<AnalysisResponseDTO> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), GROQ_TIMEOUT_MS);

  try {
    const messages = buildGroqMessages(input);
    const envelope = await fetchGroq(messages, controller.signal);
    const raw = parseGroqEnvelope(envelope);

    const result = analysisResponseSchema.safeParse(raw);
    if (!result.success) {
      logger.warn({ issues: result.error.issues }, "Groq response failed Zod validation");
      throw new AppError(502, "Groq response failed validation.");
    }

    return {
      ...result.data,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      throw new AppError(502, "Groq did not respond within the time limit.");
    }

    // Network or unexpected error
    logger.error({ err: error }, "Unexpected error calling Groq API");
    throw new AppError(502, "Failed to communicate with the AI service.");
  } finally {
    clearTimeout(timeoutId);
  }
}
