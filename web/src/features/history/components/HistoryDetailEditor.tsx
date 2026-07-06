import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import { Label } from "@/shared/components/label/Label";
import { Input } from "@/shared/components/Input";
import { HISTORY_DETAIL_FORM_SCHEMA, type HistoryDetailFormInput } from "@/features/history/api/validation";
import type { SavedJobAnalysis } from "@/features/analysis/schemas/job-analysis";
import { getHistoryCardTitle } from "@/features/history/history-formatters";

interface HistoryDetailEditorProps {
  analysis: SavedJobAnalysis;
  errorMessage?: string | null;
  isLoading?: boolean;
  isPending?: boolean;
  successMessage?: string | null;
  onSubmit: (payload: HistoryDetailFormInput) => Promise<void> | void;
}

export function HistoryDetailEditor({ analysis, errorMessage, isLoading = false, isPending = false, successMessage, onSubmit }: HistoryDetailEditorProps) {
  const [draftDisplayName, setDraftDisplayName] = useState(analysis.displayName ?? "");
  const [draftNotes, setDraftNotes] = useState(analysis.notes ?? "");
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  useEffect(() => {
    setDraftDisplayName(analysis.displayName ?? "");
    setDraftNotes(analysis.notes ?? "");
  }, [analysis.displayName, analysis.id, analysis.notes]);

  const helperText = useMemo(
    () => `Podés renombrar el guardado y dejar notas para volver a revisarlo después. El título actual es ${getHistoryCardTitle(analysis)}.`,
    [analysis],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = HISTORY_DETAIL_FORM_SCHEMA.safeParse({
      displayName: draftDisplayName,
      notes: draftNotes,
    });

    if (!payload.success) {
      setValidationMessage("Revisá el nombre visible y las notas antes de guardar.");
      return;
    }

    setValidationMessage(null);

    try {
      await onSubmit(payload.data);
    } catch {
      return;
    }
  }

  const isFormDisabled = isPending || isLoading;

  return (
    <Card className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        <p className="text-body text-text-secondary">{helperText}</p>

        {errorMessage ? (
          <p className="rounded-lg bg-[var(--color-error)]/10 px-4 py-3 text-sm leading-6 text-[var(--color-error)]" role="alert">
            {errorMessage}
          </p>
        ) : null}

        {isLoading ? (
          <p className="rounded-lg bg-[var(--accent)]/10 px-4 py-3 text-sm leading-6 text-text-secondary" role="status">
            Estamos cargando el detalle para sincronizar la edición.
          </p>
        ) : null}

        {validationMessage ? (
          <p className="rounded-lg bg-[var(--color-error)]/10 px-4 py-3 text-sm leading-6 text-[var(--color-error)]" role="alert">
            {validationMessage}
          </p>
        ) : null}

        {successMessage ? (
          <p className="rounded-lg bg-[var(--color-success)]/10 px-4 py-3 text-sm leading-6 text-[var(--color-success)]" role="status">
            {successMessage}
          </p>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="detail-title">Nombre visible</Label>
          <Input
            id="detail-title"
            aria-label="Nombre visible del guardado"
            disabled={isFormDisabled}
            maxLength={120}
            placeholder={getHistoryCardTitle(analysis)}
            value={draftDisplayName}
            onChange={(event) => setDraftDisplayName(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="detail-notes">Notas</Label>
          <Input
            multiline
            id="detail-notes"
            aria-label="Notas del guardado"
            className="min-h-40"
            disabled={isFormDisabled}
            maxLength={2000}
            placeholder="Dejá contexto, links o recordatorios para este análisis."
            value={draftNotes}
            onChange={(event) => setDraftNotes(event.target.value)}
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-6 text-text-secondary">
            El score visible sigue siendo derivado. Solo se guardan los metadatos editables.
          </p>
          <Button className="w-full sm:w-auto" disabled={isFormDisabled} type="submit">
            {isPending ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
