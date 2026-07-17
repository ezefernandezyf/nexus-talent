import { useState } from "react";
import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import { Input } from "@/shared/components/Input";
import { Label } from "@/shared/components/label/Label";
import { Tooltip } from "@/shared/components/tooltip";
import { useToastStore } from "@/shared/components/toast";
import { useEducation } from "@/features/cv/hooks/useEducation";
import type { EducationCreateDTO, EducationDTO } from "@nexus-talent/shared";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FormMode = "closed" | "add" | { mode: "edit"; id: string };

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function EducationSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="animate-pulse rounded-lg border border-border p-4"
        >
          <div className="space-y-2">
            <div className="h-4 w-1/3 rounded bg-surface-muted" />
            <div className="h-3 w-1/2 rounded bg-surface-muted" />
            <div className="h-3 w-2/3 rounded bg-surface-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inline Form
// ---------------------------------------------------------------------------

interface EducationFormProps {
  initialValues?: Partial<EducationCreateDTO>;
  onSave: (data: EducationCreateDTO) => void;
  onCancel: () => void;
  isPending: boolean;
}

function EducationForm({
  initialValues,
  onSave,
  onCancel,
  isPending,
}: EducationFormProps) {
  const [institution, setInstitution] = useState(
    initialValues?.institution ?? "",
  );
  const [degree, setDegree] = useState(initialValues?.degree ?? "");
  const [field, setField] = useState(initialValues?.field ?? "");
  const [startDate, setStartDate] = useState(initialValues?.startDate ?? "");
  const [endDate, setEndDate] = useState(initialValues?.endDate ?? "");
  const [description, setDescription] = useState(
    initialValues?.description ?? "",
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!institution.trim() || !degree.trim() || !startDate) return;

    onSave({
      institution: institution.trim(),
      degree: degree.trim(),
      startDate,
      field: field.trim() || null,
      endDate: endDate || null,
      description: description.trim() || null,
    });
  };

  const isSaveDisabled =
    !institution.trim() || !degree.trim() || !startDate || isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Institución"
          value={institution}
          onChange={(e) => setInstitution(e.target.value)}
          placeholder="Ej: Universidad de Buenos Aires"
          required
        />
        <Input
          label="Título"
          value={degree}
          onChange={(e) => setDegree(e.target.value)}
          placeholder="Ej: Lic. en Ciencias de la Computación"
          required
        />
        <Input
          label="Campo de estudio"
          value={field}
          onChange={(e) => setField(e.target.value)}
          placeholder="Ej: Inteligencia Artificial"
        />

        <div className="space-y-2">
          <Tooltip content="Formato: YYYY-MM-DD. Ej: 2024-01-15">
            <Label htmlFor="edu-start">Fecha de inicio</Label>
          </Tooltip>
          <Input
            id="edu-start"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Tooltip content="Formato: YYYY-MM-DD. Ej: 2024-01-15">
            <Label htmlFor="edu-end">Fecha de fin</Label>
          </Tooltip>
          <Input
            id="edu-end"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      <Input
        label="Descripción"
        multiline
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describí logros, proyectos destacados o áreas de especialización."
      />

      <div className="flex gap-2">
        <Button type="submit" disabled={isSaveDisabled}>
          {isPending ? "Guardando..." : "Guardar"}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Delete Confirmation
// ---------------------------------------------------------------------------

function DeleteConfirm({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="mt-3 rounded-md border border-[var(--color-error)] bg-[var(--color-error)]/5 p-4">
      <p className="mb-3 text-sm font-medium text-[var(--color-error)]">
        ¿Estás seguro de eliminar esta formación?
      </p>
      <div className="flex gap-2">
        <Button
          variant="filled"
          style={{ background: "var(--color-error)", color: "white" }}
          onClick={onConfirm}
        >
          Eliminar
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Education Card
// ---------------------------------------------------------------------------

interface EducationCardProps {
  entry: EducationDTO;
  onEdit: () => void;
  onDelete: () => void;
}

function EducationCard({ entry, onEdit, onDelete }: EducationCardProps) {
  const dateRange = entry.endDate
    ? `${entry.startDate} – ${entry.endDate}`
    : `${entry.startDate} – Presente`;

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-text-primary">{entry.institution}</p>
          <p className="text-sm text-text-secondary">
            {entry.degree}
            {entry.field ? `, ${entry.field}` : ""}
          </p>
          <p className="mt-0.5 text-xs text-text-tertiary">{dateRange}</p>
          {entry.description && (
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              {entry.description}
            </p>
          )}
        </div>
        <div className="flex shrink-0 gap-1">
          <Button variant="ghost" size="sm" onClick={onEdit}>
            Editar
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete}>
            Eliminar
          </Button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Section
// ---------------------------------------------------------------------------

export function EducationSection() {
  const {
    data: entries,
    isLoading,
    isError,
    error,
    createMutation,
    updateMutation,
    deleteMutation,
  } = useEducation();

  const [formMode, setFormMode] = useState<FormMode>("closed");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const addToast = useToastStore((s) => s.addToast);

  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  const sortedEntries = entries ?? [];
  const isEmpty = sortedEntries.length === 0 && formMode === "closed";

  // ── Loading state ─────────────────────────────────────────────
  if (isLoading) {
    return <EducationSkeleton />;
  }

  // ── Error state ───────────────────────────────────────────────
  if (isError) {
    return (
      <div
        className="rounded-lg border border-[var(--color-error)] bg-[var(--color-error)]/5 p-4"
        role="alert"
      >
        <p className="text-sm font-medium text-[var(--color-error)]">
          Error al cargar formación académica
        </p>
        <p className="mt-1 text-sm text-text-secondary">
          {(error as Error)?.message ?? "Ocurrió un error inesperado."}
        </p>
      </div>
    );
  }

  // ── Content ───────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Help text */}
      <p className="text-sm text-text-secondary">
        Agregá tu formación académica – títulos, certificaciones, cursos
        relevantes.
      </p>

      {/* Add button */}
      {formMode === "closed" && !isEmpty && (
        <Button onClick={() => setFormMode("add")}>
          Agregar formación
        </Button>
      )}

      {/* Add form */}
      {formMode === "add" && (
        <Card padding="lg">
          <h4 className="mb-4 text-sm font-semibold">Nueva formación</h4>
          <EducationForm
            onSave={async (data) => {
              try {
                await createMutation.mutateAsync(data);
                addToast({
                  message: "Formación agregada correctamente.",
                  variant: "success",
                });
                setFormMode("closed");
              } catch {
                addToast({
                  message: "Error al guardar la formación.",
                  variant: "error",
                });
              }
            }}
            onCancel={() => setFormMode("closed")}
            isPending={isPending}
          />
        </Card>
      )}

      {/* Empty state */}
      {isEmpty && (
        <div className="py-8 text-center">
          <p className="text-sm font-medium text-text-primary">
            Todavía no agregaste formación académica
          </p>
          <Button className="mt-3" onClick={() => setFormMode("add")}>
            Agregar formación
          </Button>
        </div>
      )}

      {/* List of entries */}
      {sortedEntries.map((entry) => (
        <div key={entry.id}>
          {typeof formMode === "object" &&
          formMode.mode === "edit" &&
          formMode.id === entry.id ? (
            <Card padding="lg">
              <h4 className="mb-4 text-sm font-semibold">Editar formación</h4>
              <EducationForm
                initialValues={{
                  institution: entry.institution,
                  degree: entry.degree,
                  startDate: entry.startDate,
                  endDate: entry.endDate ?? "",
                  field: entry.field ?? "",
                  description: entry.description ?? "",
                }}
                onSave={async (data) => {
                  try {
                    await updateMutation.mutateAsync({ id: entry.id, data });
                    addToast({
                      message: "Formación actualizada correctamente.",
                      variant: "success",
                    });
                    setFormMode("closed");
                  } catch {
                    addToast({
                      message: "Error al actualizar la formación.",
                      variant: "error",
                    });
                  }
                }}
                onCancel={() => setFormMode("closed")}
                isPending={isPending}
              />
            </Card>
          ) : (
            <EducationCard
              entry={entry}
              onEdit={() => setFormMode({ mode: "edit", id: entry.id })}
              onDelete={() => setDeleteTarget(entry.id)}
            />
          )}

          {/* Delete confirmation */}
          {deleteTarget === entry.id && (
            <DeleteConfirm
              onConfirm={async () => {
                try {
                  await deleteMutation.mutateAsync(entry.id);
                  addToast({
                    message: "Formación eliminada correctamente.",
                    variant: "success",
                  });
                  setDeleteTarget(null);
                } catch {
                  addToast({
                    message: "Error al eliminar la formación.",
                    variant: "error",
                  });
                }
              }}
              onCancel={() => setDeleteTarget(null)}
            />
          )}
        </div>
      ))}
    </div>
  );
}
