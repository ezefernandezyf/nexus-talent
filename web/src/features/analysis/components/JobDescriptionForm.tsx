import { useEffect, useRef, useState } from "react";
import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import { Label } from "@/shared/components/label/Label";
import { JOB_ANALYSIS_MESSAGE_TONE, type JobAnalysisMessageTone } from "@/features/analysis/schemas/job-analysis";

interface JobDescriptionFormProps {
  errorMessage?: string | null;
  initialJobDescription?: string | null;
  initialPrefillKey?: string | null;
  isPending: boolean;
  onSubmit: (request: {
    jobDescription: string;
    messageTone: JobAnalysisMessageTone;
  }) => void;
}

export function JobDescriptionForm({
  errorMessage,
  initialJobDescription,
  initialPrefillKey,
  isPending,
  onSubmit,
}: JobDescriptionFormProps) {
  const [jobDescription, setJobDescription] = useState(initialJobDescription ?? "");
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

    if (initialJobDescription === undefined) {
      return;
    }

    setJobDescription(initialJobDescription ?? "");
    setLocalError(null);
    appliedPrefillKeyRef.current = initialPrefillKey;
  }, [initialJobDescription, initialPrefillKey]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedDescription = jobDescription.trim();
    if (normalizedDescription.length < 30) {
      setLocalError("Información insuficiente. La descripción debe tener al menos 30 caracteres.");
      return;
    }

    setLocalError(null);
    onSubmit({
      jobDescription: normalizedDescription,
      messageTone,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="job-description">Descripción del puesto</Label>
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
            className="w-full min-h-40 resize-y rounded-md border border-border bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors duration-200"
            aria-invalid={Boolean(localError)}
            aria-describedby="job-description-error"
            data-testid="job-description-input"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="message-tone">Tono del mensaje</Label>
          <select
            id="message-tone"
            name="message-tone"
            value={messageTone}
            onChange={(event) => setMessageTone(event.target.value as JobAnalysisMessageTone)}
            className="w-full rounded-md border border-border bg-surface px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors duration-200"
          >
            <option value={JOB_ANALYSIS_MESSAGE_TONE.FORMAL}>Formal & Ejecutivo</option>
            <option value={JOB_ANALYSIS_MESSAGE_TONE.CASUAL}>Casual & Directo</option>
            <option value={JOB_ANALYSIS_MESSAGE_TONE.PERSUASIVE}>Persuasivo & Entusiasta</option>
          </select>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p id="job-description-error" className="text-sm text-error" aria-live="polite">
            {localError ?? errorMessage ?? " "}
          </p>
          <Button type="submit" data-testid="analysis-submit" disabled={isPending}>
            {isPending ? "Analizando..." : "Analizar con IA"}
          </Button>
        </div>
      </Card>
    </form>
  );
}
