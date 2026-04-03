import {
  JOB_ANALYSIS_INPUT_SCHEMA,
  JOB_ANALYSIS_RESULT_SCHEMA,
  JOB_ANALYSIS_SKILL_LEVEL,
  type JobAnalysisInput,
  type JobAnalysisResult,
  type JobAnalysisSkill,
  type JobAnalysisSkillGroup,
} from "../schemas/job-analysis";

export interface JobAnalysisClient {
  analyzeJobDescription(jobDescription: string): Promise<JobAnalysisResult>;
}

export type JobAnalysisTransport = (input: JobAnalysisInput) => Promise<unknown> | unknown;

interface CreateJobAnalysisClientOptions {
  transport?: JobAnalysisTransport;
}

const SKILL_LIBRARY: Array<{
  category: string;
  level: JobAnalysisSkill["level"];
  token: string;
  name: string;
}> = [
  { category: "Stack principal", level: JOB_ANALYSIS_SKILL_LEVEL.CORE, token: "react", name: "React" },
  { category: "Stack principal", level: JOB_ANALYSIS_SKILL_LEVEL.CORE, token: "typescript", name: "TypeScript" },
  { category: "Stack principal", level: JOB_ANALYSIS_SKILL_LEVEL.CORE, token: "tailwind", name: "Tailwind CSS" },
  { category: "Stack principal", level: JOB_ANALYSIS_SKILL_LEVEL.STRONG, token: "vite", name: "Vite" },
  { category: "Stack principal", level: JOB_ANALYSIS_SKILL_LEVEL.STRONG, token: "testing", name: "Testing" },
  { category: "Entrega", level: JOB_ANALYSIS_SKILL_LEVEL.STRONG, token: "api", name: "Integración de API" },
  { category: "Entrega", level: JOB_ANALYSIS_SKILL_LEVEL.STRONG, token: "performance", name: "Rendimiento" },
  { category: "Entrega", level: JOB_ANALYSIS_SKILL_LEVEL.ADJACENT, token: "accessibility", name: "Accesibilidad" },
  { category: "Colaboración", level: JOB_ANALYSIS_SKILL_LEVEL.STRONG, token: "communication", name: "Comunicación" },
  { category: "Colaboración", level: JOB_ANALYSIS_SKILL_LEVEL.ADJACENT, token: "stakeholder", name: "Alineación con stakeholders" },
  { category: "Colaboración", level: JOB_ANALYSIS_SKILL_LEVEL.ADJACENT, token: "ownership", name: "Responsabilidad" },
  { category: "Producto", level: JOB_ANALYSIS_SKILL_LEVEL.STRONG, token: "shipping", name: "Disciplina de entrega" },
  { category: "Producto", level: JOB_ANALYSIS_SKILL_LEVEL.ADJACENT, token: "design system", name: "Sistemas de diseño" },
  { category: "Producto", level: JOB_ANALYSIS_SKILL_LEVEL.ADJACENT, token: "supabase", name: "Supabase" },
];

function normalizeText(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function firstNonEmptyLine(value: string) {
  return value.split(/\r?\n/).find((line) => line.trim().length > 0)?.trim() ?? "";
}

function inferRoleTitle(jobDescription: string) {
  const firstLine = firstNonEmptyLine(jobDescription);
  if (!firstLine) {
    return "el puesto";
  }

  const cleaned = firstLine.replace(/[•|-]+/g, " ").replace(/\s+/g, " ").trim();
  if (cleaned.length <= 80) {
    return cleaned;
  }

  return cleaned.slice(0, 80).trimEnd();
}

function collectSkills(jobDescription: string) {
  const normalizedDescription = normalizeText(jobDescription);
  const matchedSkills = SKILL_LIBRARY.filter((item) => normalizedDescription.includes(item.token));

  if (matchedSkills.length === 0) {
    return [
      {
        category: "Encaje general",
        skills: [
          { name: "Síntesis de requisitos", level: JOB_ANALYSIS_SKILL_LEVEL.CORE },
          { name: "Comunicación transversal", level: JOB_ANALYSIS_SKILL_LEVEL.STRONG },
          { name: "Enfoque en la ejecución", level: JOB_ANALYSIS_SKILL_LEVEL.ADJACENT },
        ],
      },
    ] satisfies JobAnalysisSkillGroup[];
  }

  const groupedSkills = new Map<string, JobAnalysisSkill[]>();

  for (const item of matchedSkills) {
    const group = groupedSkills.get(item.category) ?? [];
    group.push({ name: item.name, level: item.level });
    groupedSkills.set(item.category, group);
  }

  return Array.from(groupedSkills.entries()).map(([category, skills]) => ({
    category,
    skills,
  }));
}

function summarizeSignals(skillGroups: JobAnalysisSkillGroup[]) {
  return skillGroups
    .flatMap((group) => group.skills)
    .slice(0, 4)
    .map((skill) => skill.name)
    .join(", ");
}

function buildSummary(jobDescription: string, skillGroups: JobAnalysisSkillGroup[]) {
  const roleTitle = inferRoleTitle(jobDescription);
  const signalSummary = summarizeSignals(skillGroups);

  if (signalSummary.length === 0) {
    return `La vacante para ${roleTitle} sugiere un rol con foco en entrega confiable, colaboración clara y ejecución disciplinada.`;
  }

  return `La vacante para ${roleTitle} se concentra en ${signalSummary} y parece un rol que valora la ejecución práctica por encima del brillo genérico.`;
}

function buildOutreachMessage(jobDescription: string, summary: string, skillGroups: JobAnalysisSkillGroup[]) {
  const roleTitle = inferRoleTitle(jobDescription);
  const topSkills = summarizeSignals(skillGroups) || "entrega estructurada y comunicación clara";

  return {
    subject: `Interés en ${roleTitle}`,
    body: [
      "Hola equipo,",
      "",
      `Revisé la vacante de ${roleTitle} y las señales más fuertes que identifiqué fueron ${topSkills}. ${summary}`,
      "",
      "Me gustaría conversar sobre cómo puedo convertir esas prioridades en una entrega concreta y sostenida.",
      "",
      "Saludos,",
      "[Your Name]",
    ].join("\n"),
  };
}

function buildLocalJobAnalysis(jobDescription: string): JobAnalysisResult {
  const skillGroups = collectSkills(jobDescription);
  const summary = buildSummary(jobDescription, skillGroups);

  return {
    summary,
    skillGroups,
    outreachMessage: buildOutreachMessage(jobDescription, summary, skillGroups),
  };
}

function parseRawPayload(payload: unknown) {
  if (typeof payload === "string") {
    return JSON.parse(payload) as unknown;
  }

  return payload;
}

export function createJobAnalysisClient(options: CreateJobAnalysisClientOptions = {}): JobAnalysisClient {
  const transport = options.transport ?? ((input: JobAnalysisInput) => buildLocalJobAnalysis(input.jobDescription));

  return {
    async analyzeJobDescription(jobDescription: string) {
      try {
        const validatedInput = JOB_ANALYSIS_INPUT_SCHEMA.parse({ jobDescription });
        const payload = await Promise.resolve(transport(validatedInput));
        const parsedPayload = parseRawPayload(payload);
        return JOB_ANALYSIS_RESULT_SCHEMA.parse(parsedPayload);
      } catch (error) {
        if (error instanceof Error && error.name === "ZodError") {
          throw new Error(`La respuesta de IA no es válida: ${error.message}`);
        }

        throw error;
      }
    },
  };
}

export const jobAnalysisClient = createJobAnalysisClient();