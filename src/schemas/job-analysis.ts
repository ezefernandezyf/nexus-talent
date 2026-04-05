import { z } from "zod";

export const JOB_ANALYSIS_SKILL_LEVEL = {
  CORE: "core",
  STRONG: "strong",
  ADJACENT: "adjacent",
} as const;

export type JobAnalysisSkillLevel = (typeof JOB_ANALYSIS_SKILL_LEVEL)[keyof typeof JOB_ANALYSIS_SKILL_LEVEL];

export const JOB_ANALYSIS_INPUT_SCHEMA = z.object({
  jobDescription: z
    .string({ error: "Pegá una descripción del puesto antes de analizarla." })
    .trim()
    .min(1, { error: "Pegá una descripción del puesto antes de analizarla." })
    .max(12_000, { error: "Las descripciones no deberían superar los 12.000 caracteres." }),
}).strict();

export type JobAnalysisInput = z.infer<typeof JOB_ANALYSIS_INPUT_SCHEMA>;

export const JOB_ANALYSIS_SUMMARY_SCHEMA = z
  .string({ error: "El resumen es obligatorio." })
  .trim()
  .min(1, { error: "El resumen es obligatorio." });

export const JOB_ANALYSIS_SKILL_SCHEMA = z.object({
  name: z
    .string({ error: "El nombre de la habilidad es obligatorio." })
    .trim()
    .min(1, { error: "El nombre de la habilidad es obligatorio." }),
  level: z.enum([
    JOB_ANALYSIS_SKILL_LEVEL.CORE,
    JOB_ANALYSIS_SKILL_LEVEL.STRONG,
    JOB_ANALYSIS_SKILL_LEVEL.ADJACENT,
  ]),
}).strict();

export const JOB_ANALYSIS_SKILL_GROUP_SCHEMA = z.object({
  category: z
    .string({ error: "La categoría del grupo de habilidades es obligatoria." })
    .trim()
    .min(1, { error: "La categoría del grupo de habilidades es obligatoria." }),
  skills: z.array(JOB_ANALYSIS_SKILL_SCHEMA).min(1, { error: "Cada grupo necesita al menos una habilidad." }),
}).strict();

export const JOB_ANALYSIS_OUTREACH_SCHEMA = z.object({
  subject: z
    .string({ error: "El asunto del mensaje es obligatorio." })
    .trim()
    .min(1, { error: "El asunto del mensaje es obligatorio." }),
  body: z
    .string({ error: "El cuerpo del mensaje es obligatorio." })
    .trim()
    .min(1, { error: "El cuerpo del mensaje es obligatorio." }),
}).strict();

export const JOB_ANALYSIS_EDITABLE_OUTREACH_SCHEMA = JOB_ANALYSIS_OUTREACH_SCHEMA.extend({
  draftBody: z.string().trim().min(1, { error: "Draft body is required." }).optional(),
}).strict();

export const JOB_ANALYSIS_RESULT_SCHEMA = z.object({
  summary: JOB_ANALYSIS_SUMMARY_SCHEMA,
  skillGroups: z.array(JOB_ANALYSIS_SKILL_GROUP_SCHEMA).min(1, { error: "Se requiere al menos un grupo de habilidades." }),
  outreachMessage: JOB_ANALYSIS_OUTREACH_SCHEMA,
}).strict();

export const SAVED_JOB_ANALYSIS_SCHEMA = JOB_ANALYSIS_RESULT_SCHEMA.extend({
  id: z.string().uuid({ error: "El identificador del historial es obligatorio." }),
  createdAt: z.string().datetime({ error: "La fecha de creación debe ser una fecha ISO válida." }),
  jobDescription: JOB_ANALYSIS_INPUT_SCHEMA.shape.jobDescription,
}).strict();

export type JobAnalysisSkill = z.infer<typeof JOB_ANALYSIS_SKILL_SCHEMA>;
export type JobAnalysisSkillGroup = z.infer<typeof JOB_ANALYSIS_SKILL_GROUP_SCHEMA>;
export type JobAnalysisOutreach = z.infer<typeof JOB_ANALYSIS_OUTREACH_SCHEMA>;
export type JobAnalysisEditableOutreach = z.infer<typeof JOB_ANALYSIS_EDITABLE_OUTREACH_SCHEMA>;
export type JobAnalysisResult = z.infer<typeof JOB_ANALYSIS_RESULT_SCHEMA>;
export type SavedJobAnalysis = z.infer<typeof SAVED_JOB_ANALYSIS_SCHEMA>;