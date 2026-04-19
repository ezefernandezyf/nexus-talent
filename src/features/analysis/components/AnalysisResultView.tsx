import { useEffect, useState } from "react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { JOB_ANALYSIS_SKILL_LEVEL, type JobAnalysisGap, type JobAnalysisKeywords, type JobAnalysisResult, type JobAnalysisVacancySummary } from "../../../schemas/job-analysis";
import {
  buildOutreachExportPayload,
  createOutreachExportFilename,
  downloadTextFile,
} from "../export";

export interface AnalysisResultViewProps {
  result: JobAnalysisResult;
  copyToClipboard?: (value: string) => Promise<void> | void;
}

function formatOutreachCopy(subject: string, body: string) {
  return [`Subject: ${subject}`, "", body].join("\n");
}

function levelLabel(level: string) {
  if (level === JOB_ANALYSIS_SKILL_LEVEL.CORE) {
    return "Principal";
  }

  if (level === JOB_ANALYSIS_SKILL_LEVEL.STRONG) {
    return "Fuerte";
  }

  return "Adyacente";
}

function sourceLabel(source: string) {
  if (source === "languages") {
    return "Lenguajes";
  }

  if (source === "topics") {
    return "Topics";
  }

  if (source === "description") {
    return "Descripción";
  }

  return "GitHub";
}

function countWords(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function truncateToMaxChars(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1).trimEnd()}…`;
}

function getRecruiterMessageVariants(result: JobAnalysisResult) {
  const emailLinkedIn = result.recruiterMessages?.emailLinkedIn ?? result.outreachMessage;
  const dmShort = result.recruiterMessages?.dmShort.body || truncateToMaxChars(emailLinkedIn.body.replace(/\n+/g, " "), 600);

  return {
    dmShort,
    emailLinkedIn,
  };
}

function renderChipList(values: string[]) {
  return values.length > 0 ? (
    <div className="flex flex-wrap gap-2">
      {values.map((value) => (
        <span key={value} className="tech-chip">
          {value}
        </span>
      ))}
    </div>
  ) : (
    <p className="text-sm leading-7 text-on-surface-variant">No hay datos para mostrar todavía.</p>
  );
}

function VacancySummaryPanel({ vacancySummary }: { vacancySummary?: JobAnalysisVacancySummary }) {
  if (!vacancySummary) {
    return (
      <div className="surface-panel space-y-5 p-6 sm:p-8">
        <div>
          <span className="label-chip">Vacancy snapshot</span>
          <h4 className="mt-3 text-xl font-semibold tracking-[-0.02em] text-white">Resumen de la vacante</h4>
        </div>
        <p className="text-sm leading-7 text-on-surface-variant">La IA no devolvió aún el bloque estructurado de la vacante.</p>
      </div>
    );
  }

  return (
    <div className="surface-panel space-y-5 p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="label-chip">Vacancy snapshot</span>
          <h4 className="mt-3 text-xl font-semibold tracking-[-0.02em] text-white">Resumen de la vacante</h4>
        </div>
        <span className="text-xs uppercase tracking-[0.22em] text-on-surface-variant">{vacancySummary.modalityLocation}</span>
      </div>

      <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl bg-surface-container-lowest/70 p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant">Rol + seniority</p>
          <p className="mt-2 text-base leading-7 text-on-surface">{vacancySummary.role} · {vacancySummary.seniority}</p>
        </div>
        <div className="rounded-2xl bg-surface-container-lowest/70 p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant">Modalidad / ubicación</p>
          <p className="mt-2 text-base leading-7 text-on-surface">{vacancySummary.modalityLocation}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-3 rounded-2xl bg-surface-container-lowest/70 p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant">Top 5 responsabilidades</p>
          <ul className="space-y-2 text-sm leading-7 text-on-surface-variant">
            {vacancySummary.responsibilities.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
        <div className="space-y-3 rounded-2xl bg-surface-container-lowest/70 p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant">Must-have</p>
          <ul className="space-y-2 text-sm leading-7 text-on-surface-variant">
            {vacancySummary.mustHave.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
        <div className="space-y-3 rounded-2xl bg-surface-container-lowest/70 p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant">Nice-to-have</p>
          <ul className="space-y-2 text-sm leading-7 text-on-surface-variant">
            {vacancySummary.niceToHave.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function KeywordsPanel({ keywords }: { keywords?: JobAnalysisKeywords }) {
  return (
    <div className="surface-panel space-y-5 p-6 sm:p-8">
      <div>
        <span className="label-chip">Keywords</span>
        <h4 className="mt-3 text-xl font-semibold tracking-[-0.02em] text-white">Skills y términos para repetir</h4>
      </div>

      {keywords ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant">Hard skills / tecnologías</p>
            {renderChipList(keywords.hardSkills)}
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant">Soft skills</p>
            {renderChipList(keywords.softSkills)}
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant">Dominio / negocio</p>
            {renderChipList(keywords.domainKeywords)}
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant">ATS exactos</p>
            {renderChipList(keywords.atsTerms)}
          </div>
        </div>
      ) : (
        <p className="text-sm leading-7 text-on-surface-variant">La IA no devolvió aún el bloque de keywords estructuradas.</p>
      )}
    </div>
  );
}

function GapsPanel({ gaps }: { gaps?: JobAnalysisGap[] }) {
  return (
    <div className="surface-panel space-y-5 p-6 sm:p-8">
      <div>
        <span className="label-chip">Gaps</span>
        <h4 className="mt-3 text-xl font-semibold tracking-[-0.02em] text-white">Posibles huecos y cómo cubrirlos</h4>
      </div>

      {gaps ? (
        <div className="grid gap-4 md:grid-cols-3">
          {gaps.map((gap) => (
            <article key={gap.gap} className="rounded-2xl bg-surface-container-lowest/70 p-4 sm:p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant">Gap</p>
              <p className="mt-2 text-sm leading-7 text-on-surface">{gap.gap}</p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant">Cómo cubrirlo</p>
              <p className="mt-2 text-sm leading-7 text-on-surface-variant">{gap.mitigation}</p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant">Cómo enmarcarlo</p>
              <p className="mt-2 text-sm leading-7 text-on-surface-variant">{gap.framing}</p>
            </article>
          ))}
        </div>
      ) : (
        <p className="text-sm leading-7 text-on-surface-variant">La IA no devolvió todavía los gaps sugeridos.</p>
      )}
    </div>
  );
}

const defaultCopyToClipboard = async (value: string) => {
  await navigator.clipboard.writeText(value);
};

export function AnalysisResultView({ result, copyToClipboard = defaultCopyToClipboard }: AnalysisResultViewProps) {
  const recruiterMessages = getRecruiterMessageVariants(result);
  const [subject, setSubject] = useState(recruiterMessages.emailLinkedIn.subject);
  const [body, setBody] = useState(recruiterMessages.emailLinkedIn.body);
  const [dmBody, setDmBody] = useState(recruiterMessages.dmShort);
  const [feedbackMessage, setFeedbackMessage] = useState("La acción de copiar siempre usa el último texto editado.");
  const [feedbackTone, setFeedbackTone] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    const nextRecruiterMessages = getRecruiterMessageVariants(result);

    setSubject(nextRecruiterMessages.emailLinkedIn.subject);
    setBody(nextRecruiterMessages.emailLinkedIn.body);
    setDmBody(nextRecruiterMessages.dmShort);
    setFeedbackMessage("La acción de copiar siempre usa el último texto editado.");
    setFeedbackTone("idle");
  }, [result]);

  async function handleCopy() {
    const copyText = formatOutreachCopy(subject, body);

    try {
      await copyToClipboard(copyText);
      setFeedbackTone("success");
      setFeedbackMessage("Se copió el mensaje editado.");
    } catch {
      setFeedbackTone("error");
      setFeedbackMessage("No se pudo acceder al portapapeles.");
    }
  }

  async function handleCopyDm() {
    try {
      await copyToClipboard(dmBody);
      setFeedbackTone("success");
      setFeedbackMessage("Se copió el DM corto editado.");
    } catch {
      setFeedbackTone("error");
      setFeedbackMessage("No se pudo acceder al portapapeles.");
    }
  }

  function handleOpenEmailDraft() {
    const exportPayload = buildOutreachExportPayload({ subject, body });
    const openedWindow = window.open(exportPayload.mailtoHref, "_self", "noopener,noreferrer");

    if (!openedWindow) {
      setFeedbackTone("error");
      setFeedbackMessage("No se pudo abrir el cliente de correo. Usá copiar o descargar el outreach.");
      return;
    }

    setFeedbackTone("success");
    setFeedbackMessage("Se abrió el borrador de email con el outreach editado.");
  }

  function handleDownloadMarkdown() {
    const exportPayload = buildOutreachExportPayload({ subject, body });
    const downloaded = downloadTextFile({
      content: exportPayload.markdown,
      filename: createOutreachExportFilename(subject, "md"),
      mimeType: "text/markdown;charset=utf-8",
    });

    if (!downloaded) {
      setFeedbackTone("error");
      setFeedbackMessage("No se pudo descargar el archivo markdown. Usá copiar como respaldo.");
      return;
    }

    setFeedbackTone("success");
    setFeedbackMessage("Se descargó el outreach en markdown.");
  }

  function handleDownloadJson() {
    const exportPayload = buildOutreachExportPayload({ subject, body });
    const downloaded = downloadTextFile({
      content: exportPayload.json,
      filename: createOutreachExportFilename(subject, "json"),
      mimeType: "application/json;charset=utf-8",
    });

    if (!downloaded) {
      setFeedbackTone("error");
      setFeedbackMessage("No se pudo descargar el archivo JSON. Usá copiar como respaldo.");
      return;
    }

    setFeedbackTone("success");
    setFeedbackMessage("Se descargó el outreach en JSON.");
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="surface-panel space-y-5 p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="label-chip">Análisis validado</span>
            <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">Análisis estructurado de la vacante</h3>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
            <span className="status-dot glow-pulse bg-success text-success" aria-hidden="true" />
            Listo
          </span>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-[0.24em] text-on-surface-variant">Resumen</h4>
          <p className="text-sm leading-7 text-on-surface sm:text-base">{result.summary}</p>
        </div>
      </div>

      <VacancySummaryPanel vacancySummary={result.vacancySummary} />

      <div className="surface-panel space-y-5 p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="label-chip">Skills Matrix</span>
            <h4 className="mt-3 text-xl font-semibold tracking-[-0.02em] text-white">Señales que vale la pena destacar</h4>
          </div>
          <div className="flex items-center gap-2">
            <span className="status-dot glow-pulse bg-primary text-primary" aria-hidden="true" />
            <span className="text-xs uppercase tracking-[0.22em] text-primary/80">Verified</span>
          </div>
        </div>

        <div className="flex snap-x gap-3 overflow-x-auto pb-2 pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {result.skillGroups.flatMap((group) => group.skills).map((skill) => (
            <span key={`${skill.name}-${skill.level}`} className="tech-chip shrink-0 snap-start border border-outline-variant/10 bg-surface-container-high px-4 py-2">
              <span className="text-xs font-medium text-on-surface">{skill.name}</span>
              <span className="text-[0.66rem] uppercase tracking-[0.18em] text-on-surface-variant">{levelLabel(skill.level)}</span>
            </span>
          ))}
        </div>
      </div>

      <KeywordsPanel keywords={result.keywords} />

      <GapsPanel gaps={result.gaps} />

      {result.githubEnrichment ? (
        <div className="surface-panel space-y-5 p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="label-chip">GitHub enriquecido</span>
              <h4 className="mt-3 text-xl font-semibold tracking-[-0.02em] text-white">Stack observado en el repositorio</h4>
            </div>
            <a
              href={result.githubEnrichment.repositoryUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs uppercase tracking-[0.22em] text-on-surface-variant transition-colors hover:text-white"
            >
              {result.githubEnrichment.repositoryName}
            </a>
          </div>

          {result.githubEnrichment.warningMessage ? (
            <p className="rounded-2xl bg-warning/10 px-4 py-3 text-sm leading-7 text-warning">{result.githubEnrichment.warningMessage}</p>
          ) : null}

          {result.githubEnrichment.detectedStack.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {result.githubEnrichment.detectedStack.map((signal) => (
                <span key={`${signal.name}-${signal.source}`} className="tech-chip">
                  {signal.name}
                  <span className="text-[0.66rem] uppercase tracking-[0.18em] text-on-surface-variant">{sourceLabel(signal.source)}</span>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm leading-7 text-on-surface-variant">No se detectaron señales claras de stack en este repositorio.</p>
          )}
        </div>
      ) : null}

      <div className="surface-panel relative overflow-hidden space-y-5 p-6 sm:p-8">
        <div className="absolute right-0 top-0 p-4 opacity-25">
          <span className="text-4xl text-primary">✦</span>
        </div>

          <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="label-chip">Message Generator</span>
            <h4 className="mt-3 text-xl font-semibold tracking-[-0.02em] text-white">Editá las dos versiones antes de copiar</h4>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end">
            <Button className="w-full sm:w-auto" variant="secondary" type="button" onClick={handleOpenEmailDraft}>
              Abrir email
            </Button>
            <Button className="w-full sm:w-auto" variant="secondary" type="button" onClick={handleDownloadMarkdown}>
              Descargar Markdown
            </Button>
            <Button className="w-full sm:w-auto" variant="secondary" type="button" onClick={handleDownloadJson}>
              Descargar JSON
            </Button>
            <Button className="w-full sm:w-auto" type="button" onClick={handleCopy}>
              Copiar mensaje
            </Button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-4 rounded-2xl bg-surface-container-lowest p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant">Versión A</p>
                <p className="mt-2 text-sm leading-7 text-on-surface-variant">Email / LinkedIn, 120–180 palabras.</p>
              </div>
              <span className="text-xs uppercase tracking-[0.22em] text-on-surface-variant">{countWords(body)} palabras</span>
            </div>
            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant">Asunto</span>
              <Input value={subject} onChange={(event) => setSubject(event.target.value)} aria-label="Asunto del mensaje" />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant">Mensaje</span>
              <textarea
                value={body}
                onChange={(event) => setBody(event.target.value)}
                className="field-surface min-h-40 px-4 py-4 text-sm leading-7"
                aria-label="Mensaje de contacto"
              />
            </label>
          </div>

          <div className="space-y-4 rounded-2xl bg-surface-container-lowest p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant">Versión B</p>
                <p className="mt-2 text-sm leading-7 text-on-surface-variant">DM corto, hasta 600 caracteres.</p>
              </div>
              <span className="text-xs uppercase tracking-[0.22em] text-on-surface-variant">{dmBody.length}/600</span>
            </div>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant">DM corto</span>
              <textarea
                value={dmBody}
                onChange={(event) => setDmBody(event.target.value)}
                className="field-surface min-h-40 px-4 py-4 text-sm leading-7"
                aria-label="Mensaje corto para reclutador"
              />
            </label>

            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" variant="secondary" onClick={handleCopyDm}>
                Copiar DM corto
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 text-sm text-on-surface-variant" aria-live="polite">
          <span className={feedbackTone === "error" ? "text-error" : feedbackTone === "success" ? "text-success" : ""}>{feedbackMessage}</span>
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-on-surface-variant">{body.length} chars / {dmBody.length} chars</span>
        </div>
      </div>
    </section>
  );
}