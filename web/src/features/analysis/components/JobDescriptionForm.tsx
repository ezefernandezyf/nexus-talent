import { useEffect, useRef, useState, type FormEventHandler } from "react";
import { Button } from "@/shared/components/Button";
import { Badge } from "@/shared/components/Badge";
import { JOB_ANALYSIS_MESSAGE_TONE, type JobAnalysisMessageTone } from "@/features/analysis/schemas/job-analysis";

interface JobDescriptionFormProps {
  errorMessage?: string | null;
  initialGithubRepositoryUrl?: string | null;
  initialJobDescription?: string | null;
  initialPrefillKey?: string | null;
  isPending: boolean;
  onSubmit: (request: {
    jobDescription: string;
    messageTone: JobAnalysisMessageTone;
    githubRepositoryUrl?: string;
  }) => void;
}

export function JobDescriptionForm({
  errorMessage,
  initialGithubRepositoryUrl,
  initialJobDescription,
  initialPrefillKey,
  isPending,
  onSubmit,
}: JobDescriptionFormProps) {
  const [jobDescription, setJobDescription] = useState(initialJobDescription ?? "");
  const [githubRepositoryUrl, setGithubRepositoryUrl] = useState(initialGithubRepositoryUrl ?? "");
  const [messageTone, setMessageTone] = useState<JobAnalysisMessageTone>(JOB_ANALYSIS_MESSAGE_TONE.FORMAL);
  const [localError, setLocalError] = useState<string | null>(null);
  const appliedPrefillKeyRef = useRef<string | null>(null);
  const lastSeenPrefillKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (initialPrefillKey !== lastSeenPrefillKeyRef.current) {
      lastSeenPrefillKeyRef.current = initialPrefillKey ?? null;
      appliedPrefillKeyRef.current = null;
    }

    if (!initialPrefillKey || appliedPrefillKeyRef.current === initialPrefillKey) {
      return;
    }

    if (initialJobDescription === undefined && initialGithubRepositoryUrl === undefined) {
      return;
    }

    setJobDescription(initialJobDescription ?? "");
    setGithubRepositoryUrl(initialGithubRepositoryUrl ?? "");
    setLocalError(null);
    appliedPrefillKeyRef.current = initialPrefillKey;
  }, [initialGithubRepositoryUrl, initialJobDescription, initialPrefillKey]);

  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    const normalizedDescription = jobDescription.trim();
    if (normalizedDescription.length === 0) {
      setLocalError("Pegá una descripción del puesto antes de ejecutar el análisis.");
      return;
    }

    const normalizedGitHubRepositoryUrl = githubRepositoryUrl.trim();

    setLocalError(null);
    onSubmit({
      jobDescription: normalizedDescription,
      messageTone,
      githubRepositoryUrl: normalizedGitHubRepositoryUrl.length > 0 ? normalizedGitHubRepositoryUrl : undefined,
    });
  };

  return (
    <form className="grid gap-5 sm:gap-6" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="text-xs font-medium uppercase tracking-[0.2em] text-on-surface-variant" htmlFor="job-description">
          Descripción del puesto
        </label>
        <div className="relative group">
          <div className="absolute -inset-0.5 rounded-xl bg-primary/10 opacity-25 blur transition duration-500 group-focus-within:opacity-50" />
          <div className="relative overflow-hidden rounded-xl bg-surface-container-low">
            <textarea
              id="job-description"
              name="job-description"
              value={jobDescription}
              onChange={(event) => {
                appliedPrefillKeyRef.current = appliedPrefillKeyRef.current ?? initialPrefillKey ?? null;
                setJobDescription(event.target.value);
                setLocalError(null);
              }}
              placeholder="Pega aquí la Job Description completa... (Ctrl+V)"
                className="min-h-112 w-full resize-none bg-transparent px-6 py-6 text-sm leading-7 text-on-surface placeholder:text-on-surface-variant focus:outline-none sm:min-h-128"
              aria-invalid={Boolean(localError)}
              aria-describedby="job-description-error"
              data-testid="job-description-input"
            />

            <div className="absolute bottom-4 right-4 flex items-center gap-2 opacity-30 transition-opacity group-focus-within:opacity-100">
              <span className="material-symbols-outlined text-sm" aria-hidden="true">
                keyboard
              </span>
              <span className="font-label text-[10px] uppercase tracking-[0.18em] text-on-surface-variant">Ctrl+V</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-surface-container p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] sm:p-6">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-end md:gap-5">
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-[0.2em] text-on-surface-variant" htmlFor="message-tone">
              Tono del mensaje
            </label>
            <div className="overflow-hidden rounded-lg bg-surface-container-low">
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
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-[0.2em] text-on-surface-variant" htmlFor="github-repository-url">
              URL de GitHub (opcional)
            </label>
            <div className="overflow-hidden rounded-lg bg-surface-container-low">
              <input
                id="github-repository-url"
                name="github-repository-url"
                value={githubRepositoryUrl}
                onChange={(event) => {
                  appliedPrefillKeyRef.current = appliedPrefillKeyRef.current ?? initialPrefillKey ?? null;
                  setGithubRepositoryUrl(event.target.value);
                  setLocalError(null);
                }}
                placeholder="https://github.com/owner/repo"
                inputMode="url"
                autoComplete="url"
                className="w-full bg-transparent px-4 py-3 text-sm leading-6 text-on-surface placeholder:text-on-surface-variant focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <p id="job-description-error" className="min-h-6 text-sm text-error" aria-live="polite">
          {localError ?? errorMessage ?? " "}
        </p>
        <div className="flex flex-col items-stretch gap-1 sm:items-end">
          <Button className="w-full px-10 py-4 font-display text-sm tracking-wide sm:w-auto" type="submit" data-testid="analysis-submit" disabled={isPending}>
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true" style={{ fontVariationSettings: '"FILL" 1' }}>
              bolt
            </span>
            {isPending ? "Analizando..." : "Analizar con IA"}
          </Button>
        </div>
      </div>
    </form>
  );
}