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

export interface RawJobAnalysisVacancySummary {
  role?: unknown;
  seniority?: unknown;
  modalityLocation?: unknown;
  responsibilities?: unknown;
  mustHave?: unknown;
  niceToHave?: unknown;
  [key: string]: unknown;
}

export interface RawJobAnalysisKeywords {
  hardSkills?: unknown;
  softSkills?: unknown;
  domainKeywords?: unknown;
  atsTerms?: unknown;
  [key: string]: unknown;
}

export interface RawJobAnalysisGap {
  gap?: unknown;
  mitigation?: unknown;
  framing?: unknown;
  [key: string]: unknown;
}

export interface RawJobAnalysisRecruiterMessages {
  emailLinkedIn?: unknown;
  dmShort?: unknown;
  [key: string]: unknown;
}

export interface RawJobAnalysisPayload {
  summary?: unknown;
  vacancySummary?: unknown;
  skillGroups?: unknown;
  keywords?: unknown;
  gaps?: unknown;
  outreachMessage?: unknown;
  recruiterMessages?: unknown;
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

export interface NormalizedJobAnalysisVacancySummary {
  role: string;
  seniority: string;
  modalityLocation: string;
  responsibilities: string[];
  mustHave: string[];
  niceToHave: string[];
}

export interface NormalizedJobAnalysisKeywords {
  hardSkills: string[];
  softSkills: string[];
  domainKeywords: string[];
  atsTerms: string[];
}

export interface NormalizedJobAnalysisGap {
  gap: string;
  mitigation: string;
  framing: string;
}

export interface NormalizedJobAnalysisRecruiterMessages {
  emailLinkedIn: NormalizedJobAnalysisOutreachMessage;
  dmShort: {
    body: string;
  };
}

export interface NormalizedJobAnalysisPayload {
  summary: string;
  vacancySummary?: NormalizedJobAnalysisVacancySummary;
  skillGroups: NormalizedJobAnalysisSkillGroup[];
  keywords?: NormalizedJobAnalysisKeywords;
  gaps?: NormalizedJobAnalysisGap[];
  outreachMessage: NormalizedJobAnalysisOutreachMessage;
  recruiterMessages?: NormalizedJobAnalysisRecruiterMessages;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeString(value: unknown) {
  if (typeof value === "string") {
    return value.trim().replace(/(?:\s*\.{3,}|\s*…|\s*[,:;-])+$/u, "").trim();
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

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as string[];
  }

  return value.map((item) => normalizeString(item)).filter((item) => item.length > 0);
}

function normalizeVacancySummary(value: unknown): NormalizedJobAnalysisVacancySummary | undefined {
  const vacancySummary = isRecord(value) ? value : null;

  if (!vacancySummary) {
    return undefined;
  }

  return {
    role: normalizeString(vacancySummary.role),
    seniority: normalizeString(vacancySummary.seniority),
    modalityLocation: normalizeString(vacancySummary.modalityLocation),
    responsibilities: normalizeStringArray(vacancySummary.responsibilities),
    mustHave: normalizeStringArray(vacancySummary.mustHave),
    niceToHave: normalizeStringArray(vacancySummary.niceToHave),
  };
}

function normalizeKeywords(value: unknown): NormalizedJobAnalysisKeywords | undefined {
  const keywords = isRecord(value) ? value : null;

  if (!keywords) {
    return undefined;
  }

  return {
    hardSkills: normalizeStringArray(keywords.hardSkills),
    softSkills: normalizeStringArray(keywords.softSkills),
    domainKeywords: normalizeStringArray(keywords.domainKeywords),
    atsTerms: normalizeStringArray(keywords.atsTerms),
  };
}

function normalizeGaps(value: unknown): NormalizedJobAnalysisGap[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const gaps = value
    .map((gapValue) => {
      const gap = isRecord(gapValue) ? gapValue : {};

      return {
        gap: normalizeString(gap.gap),
        mitigation: normalizeString(gap.mitigation),
        framing: normalizeString(gap.framing),
      };
    })
    .filter((gap) => gap.gap.length > 0 && gap.mitigation.length > 0 && gap.framing.length > 0);

  return gaps.length > 0 ? gaps : undefined;
}

function truncate(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength).trimEnd()}…`;
}

function normalizeRecruiterMessages(value: unknown, fallbackOutreachMessage: unknown): NormalizedJobAnalysisRecruiterMessages | undefined {
  const recruiterMessages = isRecord(value) ? value : null;
  const fallbackEmailLinkedIn = normalizeOutreachMessage(fallbackOutreachMessage);

  if (!recruiterMessages) {
    if (fallbackEmailLinkedIn.subject.length === 0 && fallbackEmailLinkedIn.body.length === 0) {
      return undefined;
    }

    return {
      emailLinkedIn: fallbackEmailLinkedIn,
      dmShort: {
        body: truncate(fallbackEmailLinkedIn.body.replace(/\s+/g, " ").trim(), 600),
      },
    };
  }

  const emailLinkedIn = normalizeOutreachMessage(recruiterMessages.emailLinkedIn);
  const dmShort = normalizeString(isRecord(recruiterMessages.dmShort) ? recruiterMessages.dmShort.body : recruiterMessages.dmShort);

  if (emailLinkedIn.subject.length === 0 && emailLinkedIn.body.length === 0 && dmShort.length === 0) {
    if (fallbackEmailLinkedIn.subject.length === 0 && fallbackEmailLinkedIn.body.length === 0) {
      return undefined;
    }

    return {
      emailLinkedIn: fallbackEmailLinkedIn,
      dmShort: {
        body: truncate(fallbackEmailLinkedIn.body.replace(/\s+/g, " ").trim(), 600),
      },
    };
  }

  return {
    emailLinkedIn,
    dmShort: {
      body: dmShort,
    },
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

  const vacancySummary = normalizeVacancySummary(payload.vacancySummary);
  const keywords = normalizeKeywords(payload.keywords);
  const gaps = normalizeGaps(payload.gaps);
  const recruiterMessages = normalizeRecruiterMessages(payload.recruiterMessages, payload.outreachMessage);

  return {
    summary: normalizeString(payload.summary),
    skillGroups: Array.isArray(payload.skillGroups) ? payload.skillGroups.map(normalizeSkillGroup) : [],
    outreachMessage: normalizeOutreachMessage(payload.outreachMessage),
    ...(vacancySummary ? { vacancySummary } : {}),
    ...(keywords ? { keywords } : {}),
    ...(gaps ? { gaps } : {}),
    ...(recruiterMessages ? { recruiterMessages } : {}),
  };
}