import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { HISTORY_DETAIL_FORM_SCHEMA, type HistoryDetailFormInput } from "../../../lib/validation";
import type { SavedJobAnalysis } from "../../../schemas/job-analysis";
import { getHistoryCardTitle } from "../history-formatters";

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
    <form className="surface-panel space-y-5 p-6 sm:p-8" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <span className="label-chip">Edición</span>
        <h2 className="text-2xl font-semibold tracking-[-0.02em] text-white sm:text-3xl">Renombrá y anotá este guardado</h2>
        <p className="text-base leading-7 text-on-surface-variant">{helperText}</p>
      </div>

      {errorMessage ? (
        <p className="ghost-frame rounded-2xl bg-error/10 px-4 py-3 text-sm leading-6 text-error" role="alert">
          {errorMessage}
        </p>
      ) : null}
      {isLoading ? (
        <p className="ghost-frame rounded-2xl bg-primary/10 px-4 py-3 text-sm leading-6 text-on-surface-variant" role="status">
          Estamos cargando el detalle para sincronizar la edición.
        </p>
      ) : null}
      {validationMessage ? (
        <p className="ghost-frame rounded-2xl bg-error/10 px-4 py-3 text-sm leading-6 text-error" role="alert">
          {validationMessage}
        </p>
      ) : null}
      {successMessage ? (
        <p className="ghost-frame rounded-2xl bg-success/10 px-4 py-3 text-sm leading-6 text-success" role="status">
          {successMessage}
        </p>
      ) : null}

      <label className="space-y-2">
        <span className="text-sm font-medium uppercase tracking-[0.2em] text-on-surface-variant">Nombre visible</span>
        <Input
          aria-label="Nombre visible del guardado"
          disabled={isFormDisabled}
          maxLength={120}
          placeholder={getHistoryCardTitle(analysis)}
          value={draftDisplayName}
          onChange={(event) => setDraftDisplayName(event.target.value)}
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm font-medium uppercase tracking-[0.2em] text-on-surface-variant">Notas</span>
        <textarea
          aria-label="Notas del guardado"
          className="field-surface min-h-40 px-4 py-4 text-sm leading-7"
          disabled={isFormDisabled}
          maxLength={2000}
          placeholder="Dejá contexto, links o recordatorios para este análisis."
          value={draftNotes}
          onChange={(event) => setDraftNotes(event.target.value)}
        />
      </label>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-on-surface-variant">El score visible sigue siendo derivado. Solo se guardan los metadatos editables.</p>
        <Button className="w-full sm:w-auto" disabled={isFormDisabled} type="submit">
          {isPending ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}