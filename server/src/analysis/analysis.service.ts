import { randomUUID } from "node:crypto";
import { analysisResponseSchema } from "../../../shared/src/schemas.js";
import type { AnalysisRequestDTO, AnalysisResponseDTO } from "../../../shared/src/schemas.js";
import { AppError } from "../infra/error-handler.js";
import { logger } from "../infra/logger.js";

const groqResponseSchema = analysisResponseSchema.omit({ id: true, createdAt: true });

// ============================================================================
// Constants
// ============================================================================

const GROQ_CHAT_COMPLETIONS_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile";
const GROQ_TIMEOUT_MS = 90_000;

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

function buildGroqMessages(input: AnalysisRequestDTO): GroqChatMessage[] {
  const toneInstruction =
    input.messageTone === "casual"
      ? "Usa un tono casual, directo y cercano."
      : input.messageTone === "persuasive"
        ? "Usa un tono persuasivo, energetico y orientado a resultados."
        : "Usa un tono formal, ejecutivo y claro.";

  return [
    {
      role: "system",
      content: `Eres un analizador de vacantes. Responde UNICAMENTE con un objeto JSON valido, sin markdown, sin explicaciones. El JSON debe tener exactamente estas claves: summary, vacancySummary, skillGroups, keywords, gaps, outreachMessage, recruiterMessages.

Formato exacto requerido:
{
  "summary": "string",
  "vacancySummary": {
    "role": "string",
    "seniority": "string",
    "modalityLocation": "string",
    "responsibilities": ["string"],
    "mustHave": ["string"],
    "niceToHave": ["string"]
  },
  "skillGroups": [
    { "category": "string", "skills": [{"name": "string", "level": "core|strong|adjacent"}] }
  ],
  "keywords": {
    "hardSkills": ["string"],
    "softSkills": ["string"],
    "domainKeywords": ["string"],
    "atsTerms": ["string"]
  },
  "gaps": [
    { "gap": "string", "mitigation": "string", "framing": "string" }
  ],
  "outreachMessage": {
    "subject": "string",
    "body": "string"
  },
  "recruiterMessages": {
    "emailLinkedIn": {
      "subject": "string",
      "body": "string"
    },
    "dmShort": {
      "body": "string"
    }
  }
}

Instrucciones adicionales:
- summary: lectura ejecutiva breve y clara orientada a recruiting.
- vacancySummary: bullets sobre el rol, seniority, modalidad/ubicacion, top 5 responsabilidades y must-have vs nice-to-have.
- skillGroups: minimo 3 categorias con skills marcadas como core, strong o adjacent.
- keywords: separa hard skills, soft skills, dominio/negocio y terminos ATS exactos.
- gaps: exactamente 3 posibles faltantes con mitigacion y encuadre.
- outreachMessage: version lista para email/LinkedIn, 120-180 palabras, tono profesional y humano.
- recruiterMessages.emailLinkedIn: subject + body completos.
- recruiterMessages.dmShort: version corta maximo 600 caracteres.
- ${toneInstruction}
- No uses placeholders ni texto generico. Responde en espanol.`,
    },
    {
      role: "user",
      content: `Descripcion del puesto:\n${input.jobDescription}`,
    },
  ];
}

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
      temperature: 0.3,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "<unreadable>");
    logger.warn({ status: response.status, body: errorBody }, "Groq API error");
    throw new AppError(502, `Groq API error ${response.status}: ${errorBody.slice(0, 200)}`);
  }

  return (await response.json()) as unknown;
}

function parseGroqEnvelope(envelope: unknown): Record<string, unknown> {
  const env = envelope as { choices?: Array<{ message?: { content?: string | null } }> };
  const content = env.choices?.[0]?.message?.content;

  if (typeof content !== "string" || content.trim().length === 0) {
    throw new AppError(502, "Groq returned empty response.");
  }

  try {
    const parsed = JSON.parse(content) as unknown;
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      throw new AppError(502, "Groq response is not a JSON object.");
    }
    return parsed as Record<string, unknown>;
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(502, "Groq returned invalid JSON.");
  }
}

// ============================================================================
// Public API
// ============================================================================

export async function analyze(input: AnalysisRequestDTO): Promise<AnalysisResponseDTO> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), GROQ_TIMEOUT_MS);

  try {
    const messages = buildGroqMessages(input);
    const envelope = await fetchGroq(messages, controller.signal);
    const raw = parseGroqEnvelope(envelope);

    const result = groqResponseSchema.safeParse(raw);
    if (!result.success) {
      logger.warn({ issues: result.error.issues, raw: JSON.stringify(raw).slice(0, 500) }, "Zod validation failed");
      throw new AppError(502, "AI response format was unexpected. Please try again.");
    }

    return {
      ...result.data,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new AppError(502, "Analysis timed out. Please try with a shorter job description.");
    }
    logger.error({ err: error }, "Unexpected analysis error");
    throw new AppError(502, "Analysis service unavailable.");
  } finally {
    clearTimeout(timeoutId);
  }
}
