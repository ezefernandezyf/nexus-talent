import { useEffect, useState } from "react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { JOB_ANALYSIS_SKILL_LEVEL, type JobAnalysisResult } from "../../../schemas/job-analysis";
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

const defaultCopyToClipboard = async (value: string) => {
  await navigator.clipboard.writeText(value);
};

export function AnalysisResultView({ result, copyToClipboard = defaultCopyToClipboard }: AnalysisResultViewProps) {
  const [subject, setSubject] = useState(result.outreachMessage.subject);
  const [body, setBody] = useState(result.outreachMessage.body);
  const [feedbackMessage, setFeedbackMessage] = useState("La acción de copiar siempre usa el último texto editado.");
  const [feedbackTone, setFeedbackTone] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    setSubject(result.outreachMessage.subject);
    setBody(result.outreachMessage.body);
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
            <h4 className="mt-3 text-xl font-semibold tracking-[-0.02em] text-white">Editá antes de copiar</h4>
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

        <div className="rounded-lg bg-surface-container-lowest p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
          <p className="text-sm leading-7 text-on-surface italic">{body}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant">Asunto</span>
            <Input value={subject} onChange={(event) => setSubject(event.target.value)} aria-label="Asunto del mensaje" />
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant">Mensaje</span>
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              className="field-surface min-h-40 px-4 py-4 text-sm leading-7"
              aria-label="Mensaje de contacto"
            />
          </label>
        </div>

        <div className="flex items-center justify-between gap-3 text-sm text-on-surface-variant" aria-live="polite">
          <span className={feedbackTone === "error" ? "text-error" : feedbackTone === "success" ? "text-success" : ""}>{feedbackMessage}</span>
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-on-surface-variant">{body.length} chars</span>
        </div>
      </div>
    </section>
  );
}