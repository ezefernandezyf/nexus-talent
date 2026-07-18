import { prisma } from "../infra/prisma.js";
import { AppError } from "../infra/error-handler.js";
import { logger } from "../infra/logger.js";
import { cvGenerateResponseSchema } from "../../../shared/src/schemas.js";
import type {
  WorkExperienceCreateDTO,
  WorkExperienceUpdateDTO,
  EducationCreateDTO,
  EducationUpdateDTO,
  ProjectCreateDTO,
  ProjectUpdateDTO,
  CVGenerateRequestDTO,
  CVGenerateResponseDTO,
} from "../../../shared/src/schemas.js";

// ============================================================================
// Constants
// ============================================================================

const GROQ_CHAT_COMPLETIONS_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile";
const CV_GROQ_TIMEOUT_MS = 30_000;

// ============================================================================
// Types
// ============================================================================

interface GroqChatMessage {
  content: string;
  role: "system" | "user";
}

// ============================================================================
// Work Experience
// ============================================================================

export async function listExperience(userId: string) {
  return prisma.workExperience.findMany({
    where: { userId },
    orderBy: { startDate: "desc" },
  });
}

export async function getExperience(id: string, userId: string) {
  const item = await prisma.workExperience.findFirst({ where: { id, userId } });
  if (!item) throw new AppError(404, "Work experience not found");
  return item;
}

export async function createExperience(userId: string, data: WorkExperienceCreateDTO) {
  return prisma.workExperience.create({ data: { ...data, userId } });
}

export async function updateExperience(id: string, userId: string, data: WorkExperienceUpdateDTO) {
  const existing = await prisma.workExperience.findFirst({ where: { id, userId } });
  if (!existing) throw new AppError(404, "Work experience not found");
  return prisma.workExperience.update({ where: { id }, data });
}

export async function deleteExperience(id: string, userId: string) {
  const existing = await prisma.workExperience.findFirst({ where: { id, userId } });
  if (!existing) throw new AppError(404, "Work experience not found");
  await prisma.workExperience.delete({ where: { id } });
}

// ============================================================================
// Education
// ============================================================================

export async function listEducation(userId: string) {
  return prisma.education.findMany({
    where: { userId },
    orderBy: { startDate: "desc" },
  });
}

export async function getEducation(id: string, userId: string) {
  const item = await prisma.education.findFirst({ where: { id, userId } });
  if (!item) throw new AppError(404, "Education not found");
  return item;
}

export async function createEducation(userId: string, data: EducationCreateDTO) {
  return prisma.education.create({ data: { ...data, userId } });
}

export async function updateEducation(id: string, userId: string, data: EducationUpdateDTO) {
  const existing = await prisma.education.findFirst({ where: { id, userId } });
  if (!existing) throw new AppError(404, "Education not found");
  return prisma.education.update({ where: { id }, data });
}

export async function deleteEducation(id: string, userId: string) {
  const existing = await prisma.education.findFirst({ where: { id, userId } });
  if (!existing) throw new AppError(404, "Education not found");
  await prisma.education.delete({ where: { id } });
}

// ============================================================================
// Projects
// ============================================================================

export async function listProjects(userId: string) {
  return prisma.project.findMany({
    where: { userId },
    orderBy: { startDate: "desc" },
  });
}

export async function getProject(id: string, userId: string) {
  const item = await prisma.project.findFirst({ where: { id, userId } });
  if (!item) throw new AppError(404, "Project not found");
  return item;
}

export async function createProject(userId: string, data: ProjectCreateDTO) {
  return prisma.project.create({ data: { ...data, userId } });
}

export async function updateProject(id: string, userId: string, data: ProjectUpdateDTO) {
  const existing = await prisma.project.findFirst({ where: { id, userId } });
  if (!existing) throw new AppError(404, "Project not found");
  return prisma.project.update({ where: { id }, data });
}

export async function deleteProject(id: string, userId: string) {
  const existing = await prisma.project.findFirst({ where: { id, userId } });
  if (!existing) throw new AppError(404, "Project not found");
  await prisma.project.delete({ where: { id } });
}

// ============================================================================
// Internal helpers (CV Generation)
// ============================================================================

function formatExperience(items: Array<{ company: string; role: string; startDate: string; endDate: string | null; description: string | null; location: string | null }>): string {
  if (items.length === 0) return "None listed.";
  return items
    .map(
      (e) =>
        `- ${e.role} at ${e.company} (${e.startDate} – ${e.endDate ?? "Present"})${e.location ? `, ${e.location}` : ""}${e.description ? `\n  ${e.description}` : ""}`,
    )
    .join("\n");
}

function formatEducation(items: Array<{ institution: string; degree: string; field: string | null; startDate: string; endDate: string | null; description: string | null }>): string {
  if (items.length === 0) return "None listed.";
  return items
    .map(
      (e) =>
        `- ${e.degree}${e.field ? ` in ${e.field}` : ""}, ${e.institution} (${e.startDate} – ${e.endDate ?? "Present"})${e.description ? `\n  ${e.description}` : ""}`,
    )
    .join("\n");
}

function formatAdHocItems(items: CVGenerateRequestDTO["adHocItems"]): string {
  if (!items || items.length === 0) return "";
  return items
    .map(
      (item) => `- ${item.title} (${item.type})${item.subtitle ? ` — ${item.subtitle}` : ""}${item.date ? `, ${item.date}` : ""}${item.description ? `\n  ${item.description}` : ""}`,
    )
    .join("\n");
}

function buildCVPrompt(
  experience: Array<{ company: string; role: string; startDate: string; endDate: string | null; description: string | null; location: string | null }>,
  education: Array<{ institution: string; degree: string; field: string | null; startDate: string; endDate: string | null; description: string | null }>,
  profile: { skills: string | null; experienceLevel: string | null; roleTitle: string | null; phone: string | null; portfolioUrl: string | null; linkedinUrl: string | null; githubUrl: string | null } | null,
  input: CVGenerateRequestDTO,
): GroqChatMessage[] {
  const sectionOrder = input.sectionOrder?.length ? input.sectionOrder.join(", ") : "auto (AI determines order)";
  const toneInstruction =
    input.tone === "casual"
      ? "Usa un tono casual, directo y cercano."
      : input.tone === "persuasive"
        ? "Usa un tono persuasivo, energetico y orientado a resultados."
        : "Usa un tono profesional, ejecutivo y claro.";

  let userPrompt = `Genera un CV en formato JSON con las siguientes secciones y datos.\n`;

  if (experience.length > 0) {
    userPrompt += `\n## Experiencia Laboral\n${formatExperience(experience)}\n`;
  }

  if (education.length > 0) {
    userPrompt += `\n## Educacion\n${formatEducation(education)}\n`;
  }

  if (profile) {
    const profileParts: string[] = [];
    if (profile.skills) profileParts.push(`Skills: ${profile.skills}`);
    if (profile.roleTitle) profileParts.push(`Rol deseado: ${profile.roleTitle}`);
    if (profile.experienceLevel) profileParts.push(`Nivel de experiencia: ${profile.experienceLevel}`);
    if (profile.phone) profileParts.push(`Teléfono: ${profile.phone}`);
    if (profile.portfolioUrl) profileParts.push(`Portfolio: ${profile.portfolioUrl}`);
    if (profile.linkedinUrl) profileParts.push(`LinkedIn: ${profile.linkedinUrl}`);
    if (profile.githubUrl) profileParts.push(`GitHub: ${profile.githubUrl}`);
    if (profileParts.length > 0) {
      userPrompt += `\n## Perfil del usuario\n${profileParts.join("\n")}\n`;
    }
  }

  const adHocText = formatAdHocItems(input.adHocItems);
  if (adHocText) {
    userPrompt += `\n## Items adicionales (no persistidos)\n${adHocText}\n`;
  }

  if (input.jobDescription) {
    userPrompt += `\n## Descripcion del puesto objetivo\n${input.jobDescription}\n`;
  }

  userPrompt += `\nOrden de secciones sugerido: ${sectionOrder}`;

  return [
    {
      role: "system",
      content: `SOS UN ASISTENTE QUE GENERA CVs EN FORMATO JSON. Genera secciones de CV profesionales basadas en los datos del usuario.

RESPONDE UNICAMENTE con un objeto JSON valido, sin markdown, sin explicaciones. El JSON debe tener estas claves: sections, metadata.

Formato exacto requerido:
{
  "sections": [
    {
      "heading": "string (titulo de la seccion, e.g. 'Professional Summary')",
      "body": "string (contenido en Markdown)",
      "order": number (indice de orden comenzando desde 0)
    }
  ],
  "metadata": {
    "generatedAt": "string (ISO timestamp)",
    "model": "string (nombre del modelo usado)",
    "sectionCount": number (cantidad de secciones generadas)
  }
}

REGLAS DE ESTILO (obligatorias):
1. HEADER: La PRIMERA seccion (order: 0) debe llamarse "Contacto" y contener el nombre completo del usuario (usando el campo "Rol deseado" o generando un nombre generico si no hay), seguido de telefono, email, LinkedIn, GitHub y portfolio. Cada dato en su propia linea. Ej:
   Juan Perez
   Tel: +54 11 5555-5555
   Email: juan@email.com
   LinkedIn: linkedin.com/in/juanperez
   GitHub: github.com/juanperez

2. ANTI-AI VOICE: NO uses frases genericas como "apasionado por", "results-driven", "proven track record", "spearheaded", "leveraged", "team player", "detail-oriented", "thrive in fast-paced environments". Suenan a IA y los reclutadores las detectan.

3. BULLETS CON TEXTURA TECNICA: Cada bullet point debe incluir tecnologia especifica (React 19, Node.js, PostgreSQL, Prisma, etc.) + accion concreta + resultado medible cuando sea posible. Ej:
   ❌ "Encargado del desarrollo frontend"
   ✅ "Desarrollé el frontend con React 19 + TypeScript, reduciendo el tiempo de carga en un 40%"

4. VARIACION: No todos los bullets deben seguir el mismo patron. Mezcla bullets cortos, tecnicos y de resultados.

5. SECCIONES SIN DATOS: Si el usuario no tiene datos para una seccion (educacion, experiencia, proyectos), NO incluyas esa seccion en el JSON.

${toneInstruction}`,
    },
    {
      role: "user",
      content: userPrompt,
    },
  ];
}

async function fetchGroq(messages: GroqChatMessage[], signal: AbortSignal): Promise<unknown> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    logger.error("GROQ_API_KEY not configured on the server.");
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
    const errorBody = await response.text().catch((readErr) => {
      logger.debug({ err: readErr }, "Failed to read Groq error body");
      return "<unreadable>";
    });
    logger.warn({ status: response.status, body: errorBody }, "Groq API error");
    throw new AppError(502, `Groq API error (status ${response.status})`);
  }

  return (await response.json()) as unknown;
}

function parseGroqEnvelope(envelope: unknown): Record<string, unknown> {
  const env = envelope as { choices?: Array<{ message?: { content?: string | null } }> };
  const content = env.choices?.[0]?.message?.content;

  if (typeof content !== "string" || content.trim().length === 0) {
    logger.warn({ content }, "Groq returned empty response.");
    throw new AppError(502, "Groq returned empty response.");
  }

  try {
    const parsed = JSON.parse(content) as unknown;
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      logger.warn({ parsedType: typeof parsed, isNull: parsed === null }, "Groq response is not a JSON object.");
      throw new AppError(502, "Groq response is not a JSON object.");
    }
    return parsed as Record<string, unknown>;
  } catch (err) {
    if (err instanceof AppError) throw err;
    logger.warn({ err }, "Groq returned invalid JSON.");
    throw new AppError(502, "Groq returned invalid JSON.");
  }
}

// ============================================================================
// CV Generation
// ============================================================================

export async function generateCV(userId: string, input: CVGenerateRequestDTO): Promise<CVGenerateResponseDTO> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CV_GROQ_TIMEOUT_MS);

  try {
    // Fetch user data in parallel
    const [experience, education, profile] = await Promise.all([
      prisma.workExperience.findMany({
        where: { userId },
        orderBy: { startDate: "desc" },
      }),
      prisma.education.findMany({
        where: { userId },
        orderBy: { startDate: "desc" },
      }),
      prisma.profile.findUnique({ where: { id: userId } }),
    ]);

    // Build prompt — empty experience list still proceeds
    const messages = buildCVPrompt(experience, education, profile, input);
    const envelope = await fetchGroq(messages, controller.signal);
    const raw = parseGroqEnvelope(envelope);

    // Validate response against schema
    const result = cvGenerateResponseSchema.safeParse(raw);
    if (!result.success) {
      logger.warn({ issues: result.error.issues, raw: JSON.stringify(raw).slice(0, 500) }, "CV Zod validation failed");
      throw new AppError(502, "AI response validation failed");
    }

    return result.data;
  } catch (error) {
    if (error instanceof AppError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      logger.warn({ userId }, "CV generation timed out after 30s");
      throw new AppError(502, "CV generation timed out. Please try again.");
    }
    logger.error({ err: error }, "Unexpected CV generation error");
    throw new AppError(502, "CV generation service unavailable.");
  } finally {
    clearTimeout(timeoutId);
  }
}
