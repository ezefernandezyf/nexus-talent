import { JOB_ANALYSIS_SKILL_LEVEL, type JobAnalysisSkillLevel } from "../../schemas/job-analysis";

export interface RawJobAnalysisSkill {
  name?: unknown;
  level?: unknown;
  [key: string]: unknown;
}

export interface RawJobAnalysisSkillGroup {
  category?: unknown;
  skills?: unknown;
  [key: string]: unknown;
}

export interface RawJobAnalysisOutreachMessage {
  subject?: unknown;
  body?: unknown;
  draftBody?: unknown;
  [key: string]: unknown;
}

export interface RawJobAnalysisPayload {
  summary?: unknown;
  skillGroups?: unknown;
  outreachMessage?: unknown;
  [key: string]: unknown;
}

export interface NormalizedJobAnalysisSkill {
  name: string;
  level: JobAnalysisSkillLevel;
}

export interface NormalizedJobAnalysisSkillGroup {
  category: string;
  skills: NormalizedJobAnalysisSkill[];
}

export interface NormalizedJobAnalysisOutreachMessage {
  subject: string;
  body: string;
}

export interface NormalizedJobAnalysisPayload {
  summary: string;
  skillGroups: NormalizedJobAnalysisSkillGroup[];
  outreachMessage: NormalizedJobAnalysisOutreachMessage;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeString(value: unknown) {
  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value).trim();
  }

  return "";
}

function normalizeSkillLevel(value: unknown): JobAnalysisSkillLevel {
  const normalized = normalizeString(value).toLowerCase();

  if (normalized === JOB_ANALYSIS_SKILL_LEVEL.CORE) {
    return JOB_ANALYSIS_SKILL_LEVEL.CORE;
  }

  if (normalized === JOB_ANALYSIS_SKILL_LEVEL.STRONG) {
    return JOB_ANALYSIS_SKILL_LEVEL.STRONG;
  }

  return JOB_ANALYSIS_SKILL_LEVEL.ADJACENT;
}

function normalizeSkill(value: unknown): NormalizedJobAnalysisSkill {
  const skill = isRecord(value) ? value : {};

  return {
    name: normalizeString(skill.name),
    level: normalizeSkillLevel(skill.level),
  };
}

function normalizeSkillGroup(value: unknown): NormalizedJobAnalysisSkillGroup {
  const group = isRecord(value) ? value : {};
  const skills = Array.isArray(group.skills) ? group.skills.map(normalizeSkill) : [];

  return {
    category: normalizeString(group.category),
    skills,
  };
}

function normalizeOutreachMessage(value: unknown): NormalizedJobAnalysisOutreachMessage {
  const outreachMessage = isRecord(value) ? value : {};

  return {
    subject: normalizeString(outreachMessage.subject),
    body: normalizeString(outreachMessage.body),
  };
}

function parsePayload(value: unknown): unknown {
  if (typeof value === "string") {
    return JSON.parse(value) as unknown;
  }

  return value;
}

export function normalizeJobAnalysisResponse(raw: unknown): NormalizedJobAnalysisPayload {
  const parsed = parsePayload(raw);
  const payload = isRecord(parsed) ? parsed : {};

  return {
    summary: normalizeString(payload.summary),
    skillGroups: Array.isArray(payload.skillGroups) ? payload.skillGroups.map(normalizeSkillGroup) : [],
    outreachMessage: normalizeOutreachMessage(payload.outreachMessage),
  };
}