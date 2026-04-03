import { useState } from "react";

interface JobDescriptionFormProps {
  errorMessage?: string | null;
  isPending: boolean;
  onSubmit: (jobDescription: string) => void;
}

export function JobDescriptionForm({ errorMessage, isPending, onSubmit }: JobDescriptionFormProps) {
  const [jobDescription, setJobDescription] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedDescription = jobDescription.trim();
    if (normalizedDescription.length === 0) {
      setLocalError("Pegá una descripción del puesto antes de ejecutar el análisis.");
      return;
    }

    setLocalError(null);
    onSubmit(normalizedDescription);
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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p id="job-description-error" className="min-h-6 text-sm text-error" aria-live="polite">
          {localError ?? errorMessage ?? " "}
        </p>
        <button className="primary-button sm:min-w-44" type="submit" disabled={isPending}>
          {isPending ? "Analizando..." : "Analizar vacante"}
        </button>
      </div>
    </form>
  );
}