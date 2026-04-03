import { useEffect, useState } from "react";
import { JOB_ANALYSIS_SKILL_LEVEL, type JobAnalysisResult } from "../../../schemas/job-analysis";

interface AnalysisResultViewProps {
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

const defaultCopyToClipboard = async (value: string) => {
  await navigator.clipboard.writeText(value);
};

export function AnalysisResultView({ result, copyToClipboard = defaultCopyToClipboard }: AnalysisResultViewProps) {
  const [subject, setSubject] = useState(result.outreachMessage.subject);
  const [body, setBody] = useState(result.outreachMessage.body);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");

  useEffect(() => {
    setSubject(result.outreachMessage.subject);
    setBody(result.outreachMessage.body);
    setCopyState("idle");
  }, [result]);

  async function handleCopy() {
    const copyText = formatOutreachCopy(subject, body);

    try {
      await copyToClipboard(copyText);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
  }

  return (
    <section className="space-y-6">
      <div className="surface-panel space-y-5 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="label-chip">Análisis validado</span>
            <h3 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-white">Análisis estructurado de la vacante</h3>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
            <span className="status-dot bg-success text-success" aria-hidden="true" />
            Listo
          </span>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-[0.24em] text-on-surface-variant">Resumen</h4>
          <p className="text-sm leading-7 text-on-surface sm:text-base">{result.summary}</p>
        </div>
      </div>

      <div className="surface-panel space-y-5 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="label-chip">Matriz de habilidades</span>
            <h4 className="mt-3 text-xl font-semibold tracking-[-0.02em] text-white">Señales que vale la pena destacar</h4>
          </div>
          <span className="text-xs uppercase tracking-[0.22em] text-on-surface-variant">Escaneo preciso</span>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {result.skillGroups.map((group) => (
            <article key={group.category} className="ghost-frame rounded-2xl bg-surface-container-lowest/85 p-4">
              <div className="flex items-center justify-between gap-3">
                <h5 className="text-sm font-semibold text-white">{group.category}</h5>
                <span className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">{group.skills.length} skills</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {group.skills.map((skill) => (
                  <span key={`${group.category}-${skill.name}`} className="tech-chip">
                    {skill.name}
                    <span className="text-[0.66rem] uppercase tracking-[0.18em] text-on-surface-variant">
                      {levelLabel(skill.level)}
                    </span>
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="surface-panel space-y-5 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="label-chip">Borrador de contacto</span>
            <h4 className="mt-3 text-xl font-semibold tracking-[-0.02em] text-white">Editá antes de copiar</h4>
          </div>
          <button className="secondary-button" type="button" onClick={handleCopy}>
            Copiar mensaje
          </button>
        </div>

        <div className="space-y-4">
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant">Asunto</span>
            <input
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              className="field-surface px-4 py-3 text-sm"
              aria-label="Asunto del mensaje"
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant">Mensaje</span>
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              className="field-surface min-h-52 px-4 py-4 text-sm leading-7"
              aria-label="Mensaje de contacto"
            />
          </label>
        </div>

        <div className="flex items-center justify-between gap-3 text-sm text-on-surface-variant" aria-live="polite">
          <span>
            {copyState === "copied"
              ? "Se copió el mensaje editado."
              : copyState === "error"
                ? "No se pudo acceder al portapapeles."
                : "La acción de copiar siempre usa el último texto editado."}
          </span>
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-on-surface-variant">
            {body.length} chars
          </span>
        </div>
      </div>
    </section>
  );
}