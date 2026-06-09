import {
  JOB_ANALYSIS_INPUT_SCHEMA,
  JOB_ANALYSIS_SKILL_LEVEL,
  JOB_ANALYSIS_MESSAGE_TONE,
  type JobAnalysisMessageTone,
  type JobAnalysisInput,
  type JobAnalysisResult,
  type JobAnalysisGap,
  type JobAnalysisKeywords,
  type JobAnalysisSkill,
  type JobAnalysisSkillGroup,
  type JobAnalysisVacancySummary,
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

function normalizeGeneratedText(value: string) {
  return value
    .replace(/\s+/g, " ")
    .trim()
    .replace(/(?:\s*\.{3,}|\s*…|\s*[,:;-])+$/u, "")
    .trim();
}

function hashText(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function pickFromList<T>(items: readonly T[], seed: number) {
  return items[seed % items.length] ?? items[0];
}

function rotateList<T>(items: readonly T[], seed: number) {
  if (items.length === 0) {
    return [] as T[];
  }

  const rotation = seed % items.length;
  return [...items.slice(rotation), ...items.slice(0, rotation)];
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

function truncateText(value: string, maxLength: number) {
  const normalizedValue = normalizeGeneratedText(value);

  if (normalizedValue.length <= maxLength) {
    return normalizedValue;
  }

  const sliced = normalizedValue.slice(0, maxLength).trimEnd();
  const lastBreakIndex = Math.max(sliced.lastIndexOf(" "), sliced.lastIndexOf("\n"), sliced.lastIndexOf("\t"));

  if (lastBreakIndex > maxLength * 0.55) {
    return normalizeGeneratedText(sliced.slice(0, lastBreakIndex));
  }

  return normalizeGeneratedText(sliced);
}

function inferRoleFocus(jobDescription: string) {
  const lines = jobDescription
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const candidates = lines
    .map((line) => line.replace(/^[•*-]\s*/, "").replace(/\s+/g, " ").trim())
    .filter((line) => line.length > 0);

  const roleKeywordPattern = /(developer|engineer|desarrollador|analyst|analista|lead|manager|designer|product|frontend|backend|fullstack|stack|qa|testing|recruiter|talent|operations|ops|data)/i;
  const informativeLine = candidates.find((line) => roleKeywordPattern.test(line) && !/^acerca del empleo$/i.test(line));

  if (informativeLine) {
    return informativeLine;
  }

  return candidates[0] ?? "la vacante";
}

function buildVacancyFocus(jobDescription: string) {
  const roleFocus = inferRoleFocus(jobDescription);
  return truncateText(roleFocus, 84);
}

function inferSeniority(jobDescription: string) {
  const normalizedDescription = normalizeText(jobDescription);

  if (/\b(principal|staff|lead|head|director|manager)\b/i.test(normalizedDescription)) {
    return "senior";
  }

  if (/\b(junior|entry|associate|intern|trainee)\b/i.test(normalizedDescription)) {
    return "junior";
  }

  if (/\b(mid|semi[- ]?senior|intermediate)\b/i.test(normalizedDescription)) {
    return "mid";
  }

  return "general";
}

function inferDomain(jobDescription: string) {
  const normalizedDescription = normalizeText(jobDescription);

  if (/\b(frontend|ui|ux|product design|designer|react|tailwind|css|accessibility)\b/i.test(normalizedDescription)) {
    return "frontend";
  }

  if (/\b(backend|api|node|microservice|platform|architecture|infra|observability)\b/i.test(normalizedDescription)) {
    return "platform";
  }

  if (/\b(data|analytics|ml|machine learning|bi|etl|model)\b/i.test(normalizedDescription)) {
    return "data";
  }

  if (/\b(people|talent|recruiting|operations|ops|hr|onboarding)\b/i.test(normalizedDescription)) {
    return "operations";
  }

  return "general";
}

function buildSignalList(skillGroups: JobAnalysisSkillGroup[], seed: number) {
  const signalNames = skillGroups.flatMap((group) => group.skills).map((skill) => skill.name);
  const fallbackSignals = ["Síntesis de requisitos", "Comunicación transversal", "Enfoque en la ejecución"];
  const chosenSignals = signalNames.length > 0 ? signalNames : fallbackSignals;

  return rotateList(Array.from(new Set(chosenSignals)), seed).slice(0, 3);
}

function joinSignals(signals: string[]) {
  if (signals.length === 0) {
    return "una lectura clara del problema, buena comunicación y ejecución disciplinada";
  }

  if (signals.length === 1) {
    return signals[0];
  }

  if (signals.length === 2) {
    return `${signals[0]} y ${signals[1]}`;
  }

  return `${signals[0]}, ${signals[1]} y ${signals[2]}`;
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter((value) => value.length > 0)));
}

function detectWorkArrangement(jobDescription: string) {
  const normalizedDescription = normalizeText(jobDescription);

  if (/\b(remote|remoto|remota|100% remoto|fully remote)\b/i.test(normalizedDescription)) {
    return "Modalidad remota";
  }

  if (/\b(hybrid|híbrido|hibrido)\b/i.test(normalizedDescription)) {
    return "Modalidad híbrida";
  }

  if (/\b(presencial|onsite|on-site)\b/i.test(normalizedDescription)) {
    return "Modalidad presencial";
  }

  if (/\b(\bbs as\b|buenos aires|madrid|barcelona|mexico city|cdmx|montevideo|bogota|colombia|chile|argentina|latam|lima|peru|uruguay)\b/i.test(normalizedDescription)) {
    return "Ubicación / cobertura geográfica mencionada";
  }

  return "Modalidad o ubicación no especificada";
}

function takeTopSkills(skillGroups: JobAnalysisSkillGroup[], limit: number) {
  return uniqueStrings(skillGroups.flatMap((group) => group.skills).map((skill) => skill.name)).slice(0, limit);
}

function buildVacancySummary(jobDescription: string, skillGroups: JobAnalysisSkillGroup[], summary: string): JobAnalysisVacancySummary {
  const focus = buildVacancyFocus(jobDescription);
  const seed = hashText(jobDescription);
  const seniority = inferSeniority(jobDescription);
  const domain = inferDomain(jobDescription);
  const primarySkills = takeTopSkills(skillGroups, 5);
  const mustHave = primarySkills.slice(0, 3).concat(["Comunicación clara"]).slice(0, 3);
  const niceToHave = uniqueStrings([
    ...primarySkills.slice(3, 5),
    domain === "frontend" ? "Sistemas de diseño" : domain === "platform" ? "Observabilidad" : domain === "data" ? "Storytelling con datos" : "Colaboración transversal",
    seniority === "senior" ? "Autonomía para destrabar decisiones" : "Capacidad de aprender rápido",
  ]).slice(0, 3);

  const responsibilitySets: Record<string, string[]> = {
    frontend: [
      `Construir y mantener experiencias de interfaz alineadas con ${focus}`,
      "Traducir requerimientos de producto en entregables claros y medibles",
      "Cuidar performance, accesibilidad y consistencia visual en la entrega",
      "Colaborar con diseño y backend para destrabar dependencias rápidas",
      "Sostener calidad con tests y revisión de impacto antes de publicar",
    ],
    platform: [
      `Diseñar y sostener componentes de plataforma alrededor de ${focus}`,
      "Asegurar confiabilidad, observabilidad y diagnósticos accionables",
      "Coordinar integraciones con equipos consumidores sin fricción",
      "Reducir deuda técnica y simplificar despliegues o flujos críticos",
      "Documentar decisiones para que el equipo pueda operar con velocidad",
    ],
    data: [
      `Convertir señales en decisiones útiles para ${focus}`,
      "Modelar y ordenar la información para consumo del negocio",
      "Alinear calidad de datos, trazabilidad y comunicación de hallazgos",
      "Apoyar la lectura de métricas y el impacto de cambios sobre el producto",
      "Compartir hallazgos de forma clara con stakeholders no técnicos",
    ],
    operations: [
      `Ordenar procesos y flujos alrededor de ${focus}`,
      "Coordinar con equipos internos para destrabar entregas y seguimiento",
      "Documentar criterios y señales para sostener consistencia operativa",
      "Acompañar onboarding, coordinación y comunicación transversal",
      "Mejorar visibilidad de prioridades y estado de ejecución",
    ],
    general: [
      `Traducir la vacante en entregables concretos para ${focus}`,
      "Ordenar prioridades y comunicar avances de forma clara",
      "Colaborar con el equipo para sostener velocidad sin perder calidad",
      "Ajustar el trabajo a contexto, seniority y objetivos del negocio",
      "Cerrar ciclos con foco en impacto observable",
    ],
  };

  return {
    role: focus,
    seniority,
    modalityLocation: detectWorkArrangement(jobDescription),
    responsibilities: responsibilitySets[domain].slice(0, 5),
    mustHave,
    niceToHave,
  };
}

function buildKeywords(jobDescription: string, skillGroups: JobAnalysisSkillGroup[], vacancySummary: JobAnalysisVacancySummary): JobAnalysisKeywords {
  const skillNames = takeTopSkills(skillGroups, 10);
  const hardSkills = uniqueStrings([...skillNames.slice(0, 7), vacancySummary.role]).slice(0, 7);
  const softSkills = uniqueStrings([
    "Comunicación clara",
    "Colaboración transversal",
    "Priorización",
    "Ownership",
    "Adaptación al contexto",
    "Criterio de producto",
  ]).slice(0, 5);
  const domainKeywords = uniqueStrings([
    vacancySummary.seniority,
    vacancySummary.modalityLocation,
    vacancySummary.role,
    jobDescription.match(/\b(product|producto|negocio|cliente|usuarios|equipo|release|deploy|delivery)\b/gi)?.[0] ?? "Contexto de negocio",
  ]).slice(0, 5);
  const atsTerms = uniqueStrings([
    ...skillNames.slice(0, 5),
    vacancySummary.mustHave[0] ?? "",
    vacancySummary.mustHave[1] ?? "",
    vacancySummary.mustHave[2] ?? "",
    vacancySummary.niceToHave[0] ?? "",
    vacancySummary.modalityLocation,
  ]).slice(0, 6);

  return {
    hardSkills,
    softSkills,
    domainKeywords,
    atsTerms,
  };
}

function buildGapRecommendations(jobDescription: string, vacancySummary: JobAnalysisVacancySummary, skillGroups: JobAnalysisSkillGroup[]): JobAnalysisGap[] {
  const hasMetrics = /\b\d|%|impact|resultado|mejora|reduc|increase|increase|reduced/i.test(normalizeText(jobDescription));
  const topSkills = takeTopSkills(skillGroups, 4);
  const firstSkill = topSkills[0] ?? vacancySummary.mustHave[0] ?? "el requisito principal";

  return [
    {
      gap: hasMetrics ? "Los logros no se leen como métricas concretas" : "Faltan métricas explícitas para sostener el impacto",
      mitigation: "Acompañá cada logro con un estimado o rango aproximado cuando no exista un dato duro.",
      framing: "Enmarcalo como impacto observable: velocidad, claridad, calidad o reducción de fricción.",
    },
    {
      gap: `No queda del todo visible la profundidad en ${firstSkill}`,
      mitigation: "Conectá una experiencia o proyecto donde hayas usado un contexto equivalente.",
      framing: "Presentalo como transferencia de criterio y no como copia exacta del stack.",
    },
    {
      gap: "Puede faltar contexto del rol frente al negocio o al equipo",
      mitigation: "Mostrá colaboración con producto, diseño, ingeniería o stakeholders en el lenguaje de la vacante.",
      framing: "Decí qué problema del negocio ayudaste a destrabar y cómo tomaste decisiones.",
    },
  ];
}

function getImpactPhrases(domain: string) {
  if (domain === "frontend") {
    return [
      "mejoras estimadas en performance y experiencia de uso",
      "mayor claridad visual y menos fricción en flujos críticos",
      "más consistencia entre diseño y entrega técnica",
    ];
  }

  if (domain === "platform") {
    return [
      "más confiabilidad en despliegues y observabilidad",
      "reducción estimada de fricción en procesos compartidos",
      "mejor coordinación entre equipos que consumen la plataforma",
    ];
  }

  if (domain === "data") {
    return [
      "mayor claridad para convertir datos en decisiones",
      "mejor lectura de métricas y señales del negocio",
      "más orden en la exposición de hallazgos al equipo",
    ];
  }

  if (domain === "operations") {
    return [
      "más orden operativo y mejor seguimiento de procesos",
      "menos fricción en coordinación entre equipos",
      "mayor visibilidad sobre prioridades y estado de avance",
    ];
  }

  return [
    "mejoras estimadas en coordinación y tiempos de respuesta",
    "más claridad para destrabar prioridades críticas",
    "una ejecución consistente con foco en impacto",
  ];
}

function buildSummaryImplication(domain: string, seniority: string, signalCount: number) {
  if (domain === "frontend") {
    return seniority === "senior"
      ? "La contratación parece pedir criterio de producto, ejecución sólida y lectura fina de prioridades de interfaz."
      : "La contratación parece valorar claridad visual, entrega consistente y atención al detalle del producto.";
  }

  if (domain === "platform") {
    return seniority === "senior"
      ? "La lectura de contratación apunta a arquitectura, confiabilidad y coordinación técnica entre equipos."
      : "La lectura de contratación sugiere foco en soporte técnico estable, integración ordenada y buenas bases de ingeniería.";
  }

  if (domain === "data") {
    return signalCount > 2
      ? "La contratación parece priorizar criterio analítico, calidad de señales y capacidad de traducir datos en decisiones."
      : "La contratación sugiere una expectativa clara de análisis, orden de información y comunicación accionable.";
  }

  if (domain === "operations") {
    return seniority === "junior"
      ? "La búsqueda sugiere foco en orden operativo, comunicación directa y ritmo de aprendizaje sostenido."
      : "La búsqueda parece priorizar criterio operativo, coordinación transversal y capacidad de destrabar procesos.";
  }

  return signalCount > 2
    ? "La vacante parece valorar una entrega concreta, lectura rápida de prioridades y colaboración sin fricción."
    : "La vacante sugiere una expectativa de ejecución práctica, comunicación clara y adaptación al contexto del equipo.";
}

function buildSummary(jobDescription: string, skillGroups: JobAnalysisSkillGroup[]) {
  const focus = buildVacancyFocus(jobDescription);
  const seed = hashText(jobDescription);
  const domain = inferDomain(jobDescription);
  const seniority = inferSeniority(jobDescription);
  const summaryFamilies = [
    { lead: "Lectura rápida", signalLabel: "Señales clave", implicationLabel: "Implicación de contratación" },
    { lead: "Resumen ejecutivo", signalLabel: "Puntos que destacan", implicationLabel: "Lectura de contratación" },
    { lead: "Panorama", signalLabel: "Indicadores", implicationLabel: "Lo que sugiere para hiring" },
  ] as const;
  const family = pickFromList(summaryFamilies, seed);
  const signals = buildSignalList(skillGroups, seed);
  const signalText = joinSignals(signals);
  const implication = buildSummaryImplication(domain, seniority, signals.length);

  return `${family.lead}: rol para ${focus}. ${family.signalLabel}: ${signalText}. ${family.implicationLabel}: ${implication}`;
}

function buildRecruiterMessages(jobDescription: string, summary: string, vacancySummary: JobAnalysisVacancySummary, keywords: JobAnalysisKeywords, messageTone: JobAnalysisMessageTone) {
  const seed = hashText(`${jobDescription}:${messageTone}`);
  const topMustHave = vacancySummary.mustHave.slice(0, 3);
  const impactPhrases = getImpactPhrases(inferDomain(jobDescription));
  const selectedImpacts = rotateList(impactPhrases, seed).slice(0, 3);
  const toneCopy = getToneCopy(messageTone);
  const introFamilies = [
    "Me interesa esta vacante porque combina señales técnicas claras con un foco concreto en ejecución.",
    "Me interesa esta vacante porque el rol conecta criterio técnico, lectura de prioridades y coordinación con el equipo.",
    "Me interesa esta vacante porque el contexto pide impacto visible, comunicación clara y buen encaje con el negocio.",
  ] as const;
  const emailOpening = pickFromList(introFamilies, seed);
  const summaryLead = summary.split(".")[0]?.trim() ?? summary;
  const keywordLead = uniqueStrings([...keywords.hardSkills, ...keywords.domainKeywords]).slice(0, 3).join(", ");
  const subject = truncateText(`Interés en ${vacancySummary.role}`, 92);
  const emailBodyParts = [
    toneCopy.greeting,
    "",
    `${toneCopy.intro} ${emailOpening.toLowerCase()}`,
    `Veo un match fuerte en ${joinSignals(topMustHave.length > 0 ? topMustHave : ["los requisitos principales"])} y en el contexto de ${vacancySummary.modalityLocation.toLowerCase()}.`,
    `Además, la vacante deja ver foco en ${summaryLead.toLowerCase()} y en keywords como ${keywordLead}.`,
    `En una presentación breve, pondría en primer plano ${selectedImpacts[0]}, ${selectedImpacts[1]} y ${selectedImpacts[2]}.`,
    toneCopy.close,
    "",
    "Saludos,",
    "[Your Name]",
  ];

  const emailBody = truncateText(emailBodyParts.join("\n"), 1800);
  const dmBody = truncateText(
    [
      `Hola, me interesó ${vacancySummary.role} por el encaje con ${joinSignals(topMustHave.length > 0 ? topMustHave : ["los requisitos principales"])}.`,
      `Veo match en ${vacancySummary.modalityLocation.toLowerCase()} y en señales como ${keywordLead}.`,
      `Si te sirve, puedo contarte cómo abordaría el rol y coordinar una llamada corta.`,
    ].join(" "),
    600,
  );

  return {
    emailLinkedIn: {
      subject,
      body: emailBody,
    },
    dmShort: {
      body: dmBody,
    },
  };
}

function getToneCopy(messageTone: JobAnalysisMessageTone) {
  if (messageTone === JOB_ANALYSIS_MESSAGE_TONE.CASUAL) {
    return {
      greeting: "Hola equipo de recruiting,",
      intro: "Comparto una presentación breve porque",
      close: "Quedo atento para ampliar cómo este encaje puede traducirse en valor rápido y concreto.",
    };
  }

  if (messageTone === JOB_ANALYSIS_MESSAGE_TONE.PERSUASIVE) {
    return {
      greeting: "Hola equipo de recruiting,",
      intro: "Quiero compartir por qué este perfil puede sumar desde el primer intercambio porque",
      close: "Creo que mi perfil puede convertir esas prioridades en resultados concretos desde el primer ciclo.",
    };
  }

  return {
    greeting: "Hola equipo de recruiting,",
    intro: "Les comparto una lectura breve del perfil porque",
    close: "Me gustaría conversar sobre cómo puedo convertir esas prioridades en una entrega concreta y sostenida.",
  };
}

function buildOutreachMessage(jobDescription: string, summary: string, skillGroups: JobAnalysisSkillGroup[], messageTone: JobAnalysisMessageTone) {
  const roleTitle = buildVacancyFocus(jobDescription);
  const seed = hashText(`${jobDescription}:${messageTone}`);
  const orderedSignals = rotateList(buildSignalList(skillGroups, seed), seed);
  const primarySignals = joinSignals(orderedSignals);
  const toneCopy = getToneCopy(messageTone);
  const subjectFamilies = ["Interés en", "Presentación para", "Postulación a"] as const;
  const subject = truncateText(`${pickFromList(subjectFamilies, seed)} ${roleTitle}`, 92);
  const summaryLead = summary.split(".")[0]?.trim() ?? summary;
  const openingLink =
    messageTone === JOB_ANALYSIS_MESSAGE_TONE.CASUAL
      ? "Les dejo una nota breve para abrir conversación con contexto útil."
      : messageTone === JOB_ANALYSIS_MESSAGE_TONE.PERSUASIVE
        ? "Comparto el encaje principal y el tipo de valor que podría aportar al equipo."
        : "Dejo un encuadre breve para que la lectura del perfil sea directa y accionable.";

  const valueLine =
    orderedSignals.length > 0
      ? `La vacante pone el foco en ${primarySignals}, y eso encaja con un perfil que puede ordenar prioridades y ejecutar con consistencia.`
      : "La vacante pide una combinación de claridad, criterio y ejecución que permite sostener el ritmo del equipo.";

  return {
    subject,
    body: [
      toneCopy.greeting,
      "",
      `${toneCopy.intro} ${openingLink}`,
      summaryLead,
      valueLine,
      `Me interesa particularmente el encaje entre ese foco y mi experiencia, especialmente alrededor de ${primarySignals}.`,
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
  const vacancySummary = buildVacancySummary(jobDescription, skillGroups, summary);
  const keywords = buildKeywords(jobDescription, skillGroups, vacancySummary);
  const gaps = buildGapRecommendations(jobDescription, vacancySummary, skillGroups);
  const recruiterMessages = buildRecruiterMessages(jobDescription, summary, vacancySummary, keywords, messageTone);

  return {
    summary,
    vacancySummary,
    skillGroups,
    keywords,
    gaps,
    outreachMessage: recruiterMessages.emailLinkedIn,
    recruiterMessages,
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