import { useEffect, useState } from "react";
import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import { Badge } from "@/shared/components/Badge";
import { Input } from "@/shared/components/Input";
import { Label } from "@/shared/components/label/Label";
import { cn } from "@/shared/utils/cn";
import { JOB_ANALYSIS_SKILL_LEVEL, type JobAnalysisGap, type JobAnalysisKeywords, type JobAnalysisResult, type JobAnalysisVacancySummary } from "@/features/analysis/schemas/job-analysis";
import {
  buildOutreachExportPayload,
  createOutreachExportFilename,
  downloadTextFile,
} from "@/features/analysis/export";

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

function levelWeight(level: string): number {
  if (level === JOB_ANALYSIS_SKILL_LEVEL.CORE) return 100;
  if (level === JOB_ANALYSIS_SKILL_LEVEL.STRONG) return 66;
  return 33;
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

function getOutreachVariants(result: JobAnalysisResult) {
  const primary = result.candidateOutreach ?? result.outreachMessage;
  const dmShort = truncateToMaxChars(primary.body.replace(/\n+/g, " "), 600);

  return {
    dmShort,
    emailLinkedIn: primary,
  };
}

function renderChipList(values: string[]) {
  return values.length > 0 ? (
    <div className="flex flex-wrap gap-2">
      {values.map((value) => (
        <Badge key={value}>
          {value}
        </Badge>
      ))}
    </div>
  ) : (
    <p className="text-sm leading-7 text-text-secondary">No hay datos para mostrar todavía.</p>
  );
}

// ---------------------------------------------------------------------------
// Section number component
// ---------------------------------------------------------------------------

function SectionNumber({ num }: { num: string }) {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent-muted font-display font-black text-lg text-accent">
      {num}
    </span>
  );
}

// ---------------------------------------------------------------------------
// 01 — Summary / Vacancy panel
// ---------------------------------------------------------------------------

function VacancySummaryPanel({ vacancySummary }: { vacancySummary?: JobAnalysisVacancySummary }) {
  if (!vacancySummary) {
    return (
      <div className="space-y-4">
        <p className="text-sm leading-7 text-text-secondary">La IA no devolvió aún el bloque estructurado de la vacante.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-lg bg-surface-muted p-4">
          <p className="text-eyebrow">Rol + seniority</p>
          <p className="mt-2 text-base leading-7 text-text-primary">{vacancySummary.role} · {vacancySummary.seniority}</p>
        </div>
        <div className="rounded-lg bg-surface-muted p-4">
          <p className="text-eyebrow">Modalidad / ubicación</p>
          <p className="mt-2 text-base leading-7 text-text-primary">{vacancySummary.modalityLocation}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-3 rounded-lg bg-surface-muted p-4">
          <p className="text-eyebrow">Top 5 responsabilidades</p>
          <ul className="space-y-2 text-sm leading-7 text-text-secondary">
            {vacancySummary.responsibilities.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
        <div className="space-y-3 rounded-lg bg-surface-muted p-4">
          <p className="text-eyebrow">Must-have</p>
          <ul className="space-y-2 text-sm leading-7 text-text-secondary">
            {vacancySummary.mustHave.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
        <div className="space-y-3 rounded-lg bg-surface-muted p-4">
          <p className="text-eyebrow">Nice-to-have</p>
          <ul className="space-y-2 text-sm leading-7 text-text-secondary">
            {vacancySummary.niceToHave.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 03 — Keywords panel
// ---------------------------------------------------------------------------

function KeywordsPanel({ keywords }: { keywords?: JobAnalysisKeywords }) {
  return (
    <div className="space-y-4">
      {keywords ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-eyebrow">Hard skills / tecnologías</p>
            {renderChipList(keywords.hardSkills)}
          </div>
          <div className="space-y-2">
            <p className="text-eyebrow">Soft skills</p>
            {renderChipList(keywords.softSkills)}
          </div>
          <div className="space-y-2">
            <p className="text-eyebrow">Dominio / negocio</p>
            {renderChipList(keywords.domainKeywords)}
          </div>
          <div className="space-y-2">
            <p className="text-eyebrow">ATS exactos</p>
            {renderChipList(keywords.atsTerms)}
          </div>
        </div>
      ) : (
        <p className="text-sm leading-7 text-text-secondary">La IA no devolvió aún el bloque de keywords estructuradas.</p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 04 — Gaps panel
// ---------------------------------------------------------------------------

function GapsPanel({ gaps }: { gaps?: JobAnalysisGap[] }) {
  return (
    <div className="space-y-4">
      {gaps ? (
        <div className="grid gap-4 md:grid-cols-3">
          {gaps.map((gap) => (
            <article key={gap.gap} className="rounded-lg bg-surface-muted p-4">
              <p className="text-eyebrow">Gap</p>
              <p className="mt-2 text-sm leading-7 text-text-primary">{gap.gap}</p>
              <p className="mt-4 text-eyebrow">Cómo cubrirlo</p>
              <p className="mt-2 text-sm leading-7 text-text-secondary">{gap.mitigation}</p>
              <p className="mt-4 text-eyebrow">Cómo enmarcarlo</p>
              <p className="mt-2 text-sm leading-7 text-text-secondary">{gap.framing}</p>
            </article>
          ))}
        </div>
      ) : (
        <p className="text-sm leading-7 text-text-secondary">La IA no devolvió todavía los gaps sugeridos.</p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 02 — Skills progress bar
// ---------------------------------------------------------------------------

function SkillProgressBar({ name, level }: { name: string; level: string }) {
  const weight = levelWeight(level);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text-primary">{name}</span>
        <span className="font-mono text-xs text-text-secondary">{weight}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-surface-muted">
        <div
          className="h-full rounded-full bg-accent transition-all duration-500"
          style={{ width: `${weight}%` }}
        />
      </div>
      <p className="text-xs text-text-secondary">{levelLabel(level)}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Default clipboard
// ---------------------------------------------------------------------------

const defaultCopyToClipboard = async (value: string) => {
  await navigator.clipboard.writeText(value);
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function AnalysisResultView({ result, copyToClipboard = defaultCopyToClipboard }: AnalysisResultViewProps) {
  const outreachVariants = getOutreachVariants(result);
  const [subject, setSubject] = useState(outreachVariants.emailLinkedIn.subject);
  const [body, setBody] = useState(outreachVariants.emailLinkedIn.body);
  const [dmBody, setDmBody] = useState(outreachVariants.dmShort);
  const [feedbackMessage, setFeedbackMessage] = useState("La acción de copiar siempre usa el último texto editado.");
  const [feedbackTone, setFeedbackTone] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    const nextOutreach = getOutreachVariants(result);

    setSubject(nextOutreach.emailLinkedIn.subject);
    setBody(nextOutreach.emailLinkedIn.body);
    setDmBody(nextOutreach.dmShort);
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

  const allSkills = result.skillGroups.flatMap((group) => group.skills);
  const groupedSkills = result.skillGroups;

  return (
    <section className="flex flex-col gap-6">
      {/* 01 Summary */}
      <Card className="space-y-6">
        <div className="flex items-start gap-4">
          <SectionNumber num="01" />
          <div className="flex-1">
            <h3 className="text-h3 text-text-primary">Summary</h3>
          </div>
        </div>

        <p className="text-body text-text-primary">{result.applicantSummary ?? result.summary}</p>

        {result.applicationTips && result.applicationTips.length > 0 && (
          <details className="group rounded-lg bg-surface-muted p-4">
            <summary className="cursor-pointer text-sm font-semibold text-text-primary select-none list-none flex items-center gap-2">
              <span className="transition-transform duration-200 group-open:rotate-90 text-xs text-text-secondary">▶</span>
              Tips para tu postulación
            </summary>
            <ul className="mt-3 space-y-2 pl-5 list-disc text-sm leading-7 text-text-secondary">
              {result.applicationTips.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </details>
        )}

        <VacancySummaryPanel vacancySummary={result.vacancySummary} />
      </Card>

      {/* 02 Skills Matrix */}
      <Card className="space-y-6">
        <div className="flex items-start gap-4">
          <SectionNumber num="02" />
          <div className="flex-1">
            <h3 className="text-h3 text-text-primary">Skills Matrix</h3>
          </div>
        </div>

        <div className="space-y-5">
          {groupedSkills.map((group) => (
            <div key={group.category} className="space-y-3">
              <p className="text-sm font-semibold text-text-primary">{group.category}</p>
              <div className="space-y-4">
                {group.skills.map((skill) => (
                  <SkillProgressBar key={`${skill.name}-${skill.level}`} name={skill.name} level={skill.level} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* GitHub enrichment — inside Skills Matrix as it relates to technical signals */}
        {result.githubEnrichment ? (
          <div className="space-y-4 rounded-lg bg-surface-muted p-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <p className="text-sm font-semibold text-text-primary">Stack observado en el repositorio</p>
              <a
                href={result.githubEnrichment.repositoryUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-text-secondary transition-colors hover:text-text-primary"
              >
                {result.githubEnrichment.repositoryName}
              </a>
            </div>

            {result.githubEnrichment.warningMessage ? (
              <p className="rounded-md bg-warning/10 px-4 py-3 text-sm leading-7 text-warning">{result.githubEnrichment.warningMessage}</p>
            ) : null}

            {result.githubEnrichment.detectedStack.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {result.githubEnrichment.detectedStack.map((signal) => (
                  <Badge key={`${signal.name}-${signal.source}`}>
                    {signal.name}
                    <span className="text-[0.66rem] uppercase tracking-[0.18em] text-text-secondary">{sourceLabel(signal.source)}</span>
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm leading-7 text-text-secondary">No se detectaron señales claras de stack en este repositorio.</p>
            )}
          </div>
        ) : null}
      </Card>

      {/* 03 Keywords */}
      <Card className="space-y-6">
        <div className="flex items-start gap-4">
          <SectionNumber num="03" />
          <div className="flex-1">
            <h3 className="text-h3 text-text-primary">Keywords</h3>
          </div>
        </div>

        <KeywordsPanel keywords={result.keywords} />
      </Card>

      {/* 04 Gaps & Watch-outs */}
      <Card className="space-y-6">
        <div className="flex items-start gap-4">
          <SectionNumber num="04" />
          <div className="flex-1">
            <h3 className="text-h3 text-text-primary">Gaps &amp; Watch-outs</h3>
          </div>
        </div>

        <GapsPanel gaps={result.gaps} />
      </Card>

      {/* 05 Outreach Draft */}
      <Card className="space-y-6">
        <div className="flex items-start gap-4">
          <SectionNumber num="05" />
          <div className="flex-1">
            <h3 className="text-h3 text-text-primary">Outreach Draft</h3>
          </div>
        </div>

        {/* Mono-font preview block */}
        <div className="rounded-lg bg-surface-muted p-4 font-mono text-sm leading-relaxed text-text-primary whitespace-pre-wrap">
          {formatOutreachCopy(subject, body)}
        </div>

        {/* Copy + regenerate actions */}
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" onClick={handleCopy}>
            Copiar mensaje
          </Button>
          <Button type="button" variant="outline" onClick={handleCopyDm}>
            Copiar DM corto
          </Button>
        </div>

        {/* Dual editor */}
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-4 rounded-lg bg-surface-muted p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-text-primary">Versión A</p>
                <p className="mt-1 text-sm text-text-secondary">Email / LinkedIn, 120-180 palabras.</p>
              </div>
              <span className="text-sm text-text-secondary">{countWords(body)} palabras</span>
            </div>
            <div className="space-y-2">
              <Label htmlFor="outreach-subject">Asunto</Label>
              <Input id="outreach-subject" value={subject} onChange={(event) => setSubject(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="outreach-body">Mensaje</Label>
              <Input
                id="outreach-body"
                multiline
                value={body}
                onChange={(event) => setBody(event.target.value)}
                className="min-h-40"
              />
            </div>
          </div>

          <div className="space-y-4 rounded-lg bg-surface-muted p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-text-primary">Versión B</p>
                <p className="mt-1 text-sm text-text-secondary">DM corto, hasta 600 caracteres.</p>
              </div>
              <span className="text-sm text-text-secondary">{dmBody.length}/600</span>
            </div>
            <div className="space-y-2">
              <Label htmlFor="outreach-dm">DM corto</Label>
              <Input
                id="outreach-dm"
                multiline
                value={dmBody}
                onChange={(event) => setDmBody(event.target.value)}
                className="min-h-40"
              />
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="outline" onClick={handleOpenEmailDraft}>
            Abrir email
          </Button>
          <Button type="button" variant="outline" onClick={handleDownloadMarkdown}>
            Descargar Markdown
          </Button>
          <Button type="button" variant="outline" onClick={handleDownloadJson}>
            Descargar JSON
          </Button>
        </div>

        {/* Feedback */}
        <div className="flex items-center justify-between gap-3 text-sm" aria-live="polite">
          <span className={cn(
            feedbackTone === "error" ? "text-error" : feedbackTone === "success" ? "text-success" : "text-text-secondary"
          )}>
            {feedbackMessage}
          </span>
          <span className="font-mono text-xs text-text-secondary">{body.length} chars / {dmBody.length} chars</span>
        </div>
      </Card>
    </section>
  );
}
