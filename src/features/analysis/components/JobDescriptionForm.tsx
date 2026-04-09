import { useState } from "react";
import { Button } from "../../../components/ui/Button";
import { JOB_ANALYSIS_MESSAGE_TONE, type JobAnalysisMessageTone } from "../../../schemas/job-analysis";

interface JobDescriptionFormProps {
  errorMessage?: string | null;
  isPending: boolean;
  onSubmit: (request: { jobDescription: string; messageTone: JobAnalysisMessageTone }) => void;
}

export function JobDescriptionForm({ errorMessage, isPending, onSubmit }: JobDescriptionFormProps) {
  const [jobDescription, setJobDescription] = useState("");
  const [messageTone, setMessageTone] = useState<JobAnalysisMessageTone>(JOB_ANALYSIS_MESSAGE_TONE.FORMAL);
  const [localError, setLocalError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedDescription = jobDescription.trim();
    if (normalizedDescription.length === 0) {
      setLocalError("Pegá una descripción del puesto antes de ejecutar el análisis.");
      return;
    }

    setLocalError(null);
    onSubmit({
      jobDescription: normalizedDescription,
      messageTone,
    });
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="label-chip" htmlFor="job-description">
          Descripción del puesto
        </label>
        <div className="field-surface overflow-hidden">
          <textarea
            id="job-description"
            name="job-description"
            value={jobDescription}
            onChange={(event) => {
              setJobDescription(event.target.value);
              setLocalError(null);
            }}
            placeholder="Pegá la vacante completa, responsabilidades, requisitos obligatorios y cualquier contexto relevante."
            className="min-h-56 w-full resize-y bg-transparent px-4 py-4 text-sm leading-7 text-on-surface placeholder:text-on-surface-variant focus:outline-none"
            aria-invalid={Boolean(localError)}
            aria-describedby="job-description-help job-description-error"
          />
        </div>
        <p id="job-description-help" className="text-sm leading-6 text-on-surface-variant">
          La entrada se valida antes de correr el análisis. Los envíos vacíos se bloquean en el momento.
        </p>
      </div>

      <div className="space-y-2">
        <label className="label-chip" htmlFor="message-tone">
          Tono del mensaje
        </label>
        <div className="field-surface overflow-hidden">
          <select
            id="message-tone"
            name="message-tone"
            value={messageTone}
            onChange={(event) => setMessageTone(event.target.value as JobAnalysisMessageTone)}
            className="w-full bg-transparent px-4 py-3 text-sm leading-6 text-on-surface focus:outline-none"
          >
            <option value={JOB_ANALYSIS_MESSAGE_TONE.FORMAL}>Formal & Ejecutivo</option>
            <option value={JOB_ANALYSIS_MESSAGE_TONE.CASUAL}>Casual & Directo</option>
            <option value={JOB_ANALYSIS_MESSAGE_TONE.PERSUASIVE}>Persuasivo & Entusiasta</option>
          </select>
        </div>
        <p className="text-sm leading-6 text-on-surface-variant">
          El tono todavía no altera el prompt de IA, pero ya queda preparado para conectarlo en el siguiente corte.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p id="job-description-error" className="min-h-6 text-sm text-error" aria-live="polite">
          {localError ?? errorMessage ?? " "}
        </p>
        <Button className="sm:min-w-44" type="submit" disabled={isPending}>
          {isPending ? "Analizando..." : "Analizar vacante"}
        </Button>
      </div>
    </form>
  );
}