import {
  JOB_ANALYSIS_INPUT_SCHEMA,
  JOB_ANALYSIS_SKILL_LEVEL,
  JOB_ANALYSIS_MESSAGE_TONE,
  type JobAnalysisMessageTone,
  type JobAnalysisInput,
  type JobAnalysisResult,
  type JobAnalysisSkill,
  type JobAnalysisSkillGroup,
} from "../schemas/job-analysis";
import { normalizeJobAnalysisResponse } from "./mappers";
import { createAIOrchestrator } from "./ai-orchestrator";
import { createGroqProviderAdapter, type JobAnalysisPromptInput } from "./ai-provider";
import { isAIOrchestratorError } from "./ai-errors";
import { validateJobAnalysisResult } from "./validation";

export interface JobAnalysisClient {
  analyzeJobDescription(jobDescription: string, messageTone?: JobAnalysisMessageTone): Promise<JobAnalysisResult>;
}

export type JobAnalysisTransport = (input: JobAnalysisPromptInput) => Promise<unknown> | unknown;

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

function getToneCopy(messageTone: JobAnalysisMessageTone) {
  if (messageTone === JOB_ANALYSIS_MESSAGE_TONE.CASUAL) {
    return {
      intro: "Te escribo porque",
      close: "Me gustaría charlar sobre cómo puedo aportar rápido y con foco al equipo.",
    };
  }

  if (messageTone === JOB_ANALYSIS_MESSAGE_TONE.PERSUASIVE) {
    return {
      intro: "Veo una oportunidad muy fuerte para sumar valor porque",
      close: "Creo que mi perfil puede convertir esas prioridades en resultados concretos desde el primer ciclo.",
    };
  }

  return {
    intro: "Revisé la vacante y",
    close: "Me gustaría conversar sobre cómo puedo convertir esas prioridades en una entrega concreta y sostenida.",
  };
}

function buildOutreachMessage(jobDescription: string, summary: string, skillGroups: JobAnalysisSkillGroup[], messageTone: JobAnalysisMessageTone) {
  const roleTitle = inferRoleTitle(jobDescription);
  const topSkills = summarizeSignals(skillGroups) || "entrega estructurada y comunicación clara";
  const toneCopy = getToneCopy(messageTone);

  return {
    subject: `Interés en ${roleTitle}`,
    body: [
      "Hola equipo,",
      "",
      `${toneCopy.intro} las señales más fuertes que identifiqué fueron ${topSkills}. ${summary}`,
      "",
      toneCopy.close,
      "",
      "Saludos,",
      "[Your Name]",
    ].join("\n"),
  };
}

function buildLocalJobAnalysis(jobDescription: string, messageTone: JobAnalysisMessageTone): JobAnalysisResult {
  const skillGroups = collectSkills(jobDescription);
  const summary = buildSummary(jobDescription, skillGroups);

  return {
    summary,
    skillGroups,
    outreachMessage: buildOutreachMessage(jobDescription, summary, skillGroups, messageTone),
  };
}

export function createJobAnalysisClient(options: CreateJobAnalysisClientOptions = {}): JobAnalysisClient {
  const transport = options.transport ?? ((input: JobAnalysisPromptInput) => buildLocalJobAnalysis(input.jobDescription, input.messageTone));
  const orchestrator = createAIOrchestrator(
    createGroqProviderAdapter({
      fallbackTransport: transport,
    }),
  );

  return {
    async analyzeJobDescription(jobDescription: string, messageTone: JobAnalysisMessageTone = JOB_ANALYSIS_MESSAGE_TONE.FORMAL) {
      const validatedInput = JOB_ANALYSIS_INPUT_SCHEMA.parse({ jobDescription });

      try {
        const payload = await orchestrator.run({
          ...validatedInput,
          messageTone,
        });
        const normalizedPayload = normalizeJobAnalysisResponse(payload);
        return validateJobAnalysisResult(normalizedPayload);
      } catch (error) {
        if (error instanceof Error && error.name === "ZodError") {
          throw new Error(`La respuesta de IA no es válida: ${error.message}`);
        }

        if (isAIOrchestratorError(error)) {
          throw error;
        }

        throw error;
      }
    },
  };
}

export const jobAnalysisClient = createJobAnalysisClient();