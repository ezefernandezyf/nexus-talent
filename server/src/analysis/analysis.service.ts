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

function buildGroqMessages(input: AnalysisRequestDTO, profileContext?: string | null): GroqChatMessage[] {
  const toneInstruction =
    input.messageTone === "casual"
      ? "Usa un tono casual, directo y cercano."
      : input.messageTone === "persuasive"
        ? "Usa un tono persuasivo, energetico y orientado a resultados."
        : "Usa un tono formal, ejecutivo y claro.";

  return [
    {
      role: "system",
      content: `SOS UN ASISTENTE PARA PERSONAS QUE BUSCAN TRABAJO. El usuario es un POSTULANTE que pego la descripcion de un puesto al que quiere aplicar. Tu trabajo es ayudarlo a entender el puesto y preparar su postulacion.

RESPONDE UNICAMENTE con un objeto JSON valido, sin markdown, sin explicaciones. El JSON debe tener estas claves: summary, vacancySummary, skillGroups, keywords, gaps, outreachMessage, recruiterMessages, applicantSummary, candidateOutreach, applicationTips.

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
  },
  "applicantSummary": "string",
  "candidateOutreach": {
    "subject": "string",
    "body": "string"
  },
  "applicationTips": ["string"]
}

INSTRUCCIONES PARA CADA CAMPO. TODO desde la perspectiva del POSTULANTE, nunca del reclutador:

- summary: Lectura ejecutiva del puesto PARA EL POSTULANTE. Explica en 3-4 oraciones que busca la empresa, que tecnologias pide, y que tipo de perfil encaja. NO escribas "el candidato ideal" — escribi "este puesto busca a alguien que...".

- vacancySummary: Desglose estructurado del puesto. role es el titulo, seniority es "junior", "semi-senior" o "senior", modalityLocation incluye si es remoto/presencial/hibrido y donde. responsibilities son las 5 tareas principales. mustHave y niceToHave son requisitos excluyentes y deseables.

- skillGroups: Agrupa las skills en categorias (ej: Frontend, Backend, DevOps, Soft Skills). Cada skill tiene un nivel: "core" (excluyente), "strong" (muy valorado), "adjacent" (diferencial).

- keywords: hardSkills son tecnologias y herramientas especificas. softSkills son habilidades blandas mencionadas. domainKeywords son terminos del negocio/industria. atsTerms son palabras exactas que el ATS va a buscar en tu CV.

- gaps: Exactamente 3 areas donde un postulante TIPICO podria tener que reforzar. Para cada uno: gap (que falta), mitigation (como compensarlo), framing (como presentarlo positivamente en la entrevista). NO asumas que el postulante no sabe — escribi "si no tenes experiencia en X, podes...".

- outreachMessage: MENSAJE QUE EL POSTULANTE LE ENVIA AL RECLUTADOR. Escribi en PRIMERA PERSONA como si el postulante lo escribiera. Ejemplo: "Hola [Nombre], vi la busqueda de Frontend y me interesa porque...". 120-180 palabras. Tono profesional, directo, seguro. NUNCA escribas "Estimado/a candidato/a" ni "le presento una oportunidad".

- recruiterMessages: NO USAR. Devolve un objeto vacio: { "emailLinkedIn": { "subject": "", "body": "" }, "dmShort": { "body": "" } }.

- applicantSummary: LO MISMO QUE SUMMARY pero mas personal. Explica POR QUE este puesto le conviene al postulante, que puede aprender, que puertas le abre. Usa "vos" (no "el candidato"). Maximo 80 palabras.

- candidateOutreach: Version ALTERNATIVA del outreachMessage. Otro angulo de contacto para que el postulante elija. Mismo formato (subject + body), misma longitud, primera persona. Que no suene igual al outreachMessage.

- applicationTips: Exactamente 5 consejos ACCIONABLES para preparar la postulacion. Cosas como: "adapta tu CV usando estas keywords: [X, Y, Z]", "prepara un mini-portfolio con proyectos de [tecnologia]", "investiga la empresa en LinkedIn y Glassdoor", "preguntas para hacer en la entrevista sobre [tema]", "certificaciones o cursos que suman para este rol".

${toneInstruction}
${profileContext ? `\nSobre el postulante:\n${profileContext}\n` : ""}

REGLAS DE ORO:
- NUNCA escribas desde la perspectiva del reclutador. El usuario es el POSTULANTE.
- NUNCA uses "el candidato", "el postulante ideal", "buscamos a alguien que". Escribi "vos" o en primera persona segun el campo.
- NUNCA uses placeholders como [Nombre] o [Empresa]. Si no sabes un dato, no lo inventes.
- Responde en espanol.`,
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

export async function analyze(input: AnalysisRequestDTO, profileContext?: string | null): Promise<AnalysisResponseDTO> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), GROQ_TIMEOUT_MS);

  try {
    const messages = buildGroqMessages(input, profileContext);
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
