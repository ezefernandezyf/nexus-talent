import { useState } from "react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";

interface JobDescriptionFormProps {
  errorMessage?: string | null;
  isPending: boolean;
  onSubmit: (request: { githubRepositoryUrl?: string; jobDescription: string }) => void;
}

export function JobDescriptionForm({ errorMessage, isPending, onSubmit }: JobDescriptionFormProps) {
  const [jobDescription, setJobDescription] = useState("");
  const [githubRepositoryUrl, setGitHubRepositoryUrl] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedDescription = jobDescription.trim();
    if (normalizedDescription.length === 0) {
      setLocalError("Pegá una descripción del puesto antes de ejecutar el análisis.");
      return;
    }

    setLocalError(null);
    const normalizedRepositoryUrl = githubRepositoryUrl.trim();

    onSubmit({
      jobDescription: normalizedDescription,
      githubRepositoryUrl: normalizedRepositoryUrl.length > 0 ? normalizedRepositoryUrl : undefined,
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
        <label className="label-chip" htmlFor="github-repository-url">
          URL del repositorio de GitHub <span className="text-on-surface-variant">(opcional)</span>
        </label>
        <Input
          id="github-repository-url"
          name="github-repository-url"
          value={githubRepositoryUrl}
          onChange={(event) => setGitHubRepositoryUrl(event.target.value)}
          placeholder="https://github.com/owner/repository"
          autoComplete="off"
          inputMode="url"
          aria-describedby="github-repository-help"
        />
        <p id="github-repository-help" className="text-sm leading-6 text-on-surface-variant">
          Si lo completás, el análisis intentará enriquecer el resultado con señales públicas del stack.
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