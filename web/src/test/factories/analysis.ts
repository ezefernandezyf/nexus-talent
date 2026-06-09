import { vi } from "vitest";
import { type AnalysisRepository } from "../../lib/repositories";
import {
  JOB_ANALYSIS_MESSAGE_TONE,
  JOB_ANALYSIS_SKILL_LEVEL,
  type JobAnalysisRequest,
  type JobAnalysisResult,
  type SavedJobAnalysis,
} from "../../schemas/job-analysis";
import { createQueryClientWrapper } from "../mocks/query-client";

export function createAnalysisRequest(overrides: Partial<JobAnalysisRequest> = {}): JobAnalysisRequest {
  return {
    jobDescription: "Senior React engineer with TypeScript and testing",
    messageTone: JOB_ANALYSIS_MESSAGE_TONE.FORMAL,
    githubRepositoryUrl: undefined,
    ...overrides,
  };
}

export function createAnalysisResult(overrides: Partial<JobAnalysisResult> = {}): JobAnalysisResult {
  return {
    summary: "Un rol enfocado en construir experiencias de producto.",
    vacancySummary: {
      role: "Senior React engineer",
      seniority: "senior",
      modalityLocation: "Modalidad remota",
      responsibilities: [
        "Construir experiencias de producto",
        "Colaborar con diseño y backend",
        "Cuidar calidad y performance",
      ],
      mustHave: ["React", "TypeScript", "Comunicación clara"],
      niceToHave: ["Testing", "Sistemas de diseño", "Autonomía"],
    },
    skillGroups: [
      {
        category: "Stack principal",
        skills: [{ name: "React", level: JOB_ANALYSIS_SKILL_LEVEL.CORE }],
      },
    ],
    keywords: {
      hardSkills: ["React", "TypeScript"],
      softSkills: ["Comunicación clara", "Colaboración transversal"],
      domainKeywords: ["producto", "remoto"],
      atsTerms: ["React", "TypeScript", "comunicación"],
    },
    gaps: [
      {
        gap: "Faltan métricas explícitas para cerrar el mensaje",
        mitigation: "Sumá un estimado o rango aproximado cuando no exista una métrica dura.",
        framing: "Enmarcalo como impacto observable en velocidad, calidad o coordinación.",
      },
    ],
    outreachMessage: {
      subject: "Interés en el puesto",
      body: "Hola equipo,\n\nRevisé la vacante.\n\nSaludos,\n[Your Name]",
    },
    recruiterMessages: {
      emailLinkedIn: {
        subject: "Interés en el puesto",
        body: "Hola equipo de recruiting,\n\nLes comparto una lectura breve del perfil porque combina ejecución, criterio de producto y foco en entrega.\nVeo un match fuerte en React, TypeScript y Comunicación clara y en el contexto de modalidad remota.\nAdemás, la vacante deja ver foco en un rol enfocado en construir experiencias de producto y en keywords como React, TypeScript, producto.\nEn una presentación breve, pondría en primer plano mejoras estimadas en performance y experiencia de uso, más claridad visual y menos fricción en flujos críticos y más consistencia entre diseño y entrega técnica.\nMe gustaría conversar sobre cómo puedo convertir esas prioridades en una entrega concreta y sostenida.\n\nSaludos,\n[Your Name]",
      },
      dmShort: {
        body: "Hola, me interesó Senior React engineer por el encaje con React, TypeScript y Comunicación clara. Veo match en Modalidad remota y en señales como React, TypeScript, producto. Si te sirve, puedo contarte cómo abordaría el rol y coordinar una llamada corta.",
      },
    },
    ...overrides,
  };
}

export function createSavedAnalysis(overrides: Partial<SavedJobAnalysis> = {}): SavedJobAnalysis {
  return {
    id: "550e8400-e29b-41d4-a716-446655440000",
    createdAt: "2026-04-05T12:00:00.000Z",
    jobDescription: "Senior React engineer with TypeScript and testing",
    ...createAnalysisResult(),
    ...overrides,
  };
}

interface CreateAnalysisRepositoryOptions {
  analyses?: SavedJobAnalysis[];
  savedAnalysis?: SavedJobAnalysis;
  overrides?: Partial<AnalysisRepository>;
}

export function createAnalysisRepository(options: CreateAnalysisRepositoryOptions = {}): AnalysisRepository {
  const analyses = options.analyses ?? [createSavedAnalysis()];
  const savedAnalysis = options.savedAnalysis ?? analyses[0] ?? createSavedAnalysis();

  return {
    save: vi.fn(async (jobDescription, result) => ({
      ...savedAnalysis,
      jobDescription,
      ...result,
    })),
    getAll: vi.fn(async () => analyses),
    getById: vi.fn(async (id) => analyses.find((analysis) => analysis.id === id) ?? null),
    update: vi.fn(async (id, patch) => {
      const index = analyses.findIndex((analysis) => analysis.id === id);

      if (index < 0) {
        return null;
      }

      const nextAnalysis = {
        ...analyses[index],
        ...(patch.displayName !== undefined ? { displayName: patch.displayName } : {}),
        ...(patch.notes !== undefined ? { notes: patch.notes } : {}),
      };

      analyses[index] = nextAnalysis;
      return nextAnalysis;
    }),
    delete: vi.fn(async () => undefined),
    ...options.overrides,
  };
}

export { createQueryClientWrapper } from "../mocks/query-client";