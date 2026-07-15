import { useState } from "react";
import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import { Input } from "@/shared/components/Input";
import { Label } from "@/shared/components/label/Label";
import { Tooltip } from "@/shared/components/tooltip";
import { useToastStore } from "@/shared/components/toast";
import { useExperience } from "@/features/cv/hooks/useExperience";
import type { WorkExperienceCreateDTO, WorkExperienceDTO } from "@nexus-talent/shared";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FormMode = "closed" | "add" | { mode: "edit"; id: string };

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function ExperienceSkeleton() {
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

interface ExperienceFormProps {
  initialValues?: Partial<WorkExperienceCreateDTO>;
  onSave: (data: WorkExperienceCreateDTO) => void;
  onCancel: () => void;
  isPending: boolean;
}

function ExperienceForm({
  initialValues,
  onSave,
  onCancel,
  isPending,
}: ExperienceFormProps) {
  const [company, setCompany] = useState(initialValues?.company ?? "");
  const [role, setRole] = useState(initialValues?.role ?? "");
  const [startDate, setStartDate] = useState(initialValues?.startDate ?? "");
  const [endDate, setEndDate] = useState(initialValues?.endDate ?? "");
  const [description, setDescription] = useState(
    initialValues?.description ?? "",
  );
  const [location, setLocation] = useState(initialValues?.location ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !role.trim() || !startDate) return;

    onSave({
      company: company.trim(),
      role: role.trim(),
      startDate,
      endDate: endDate || null,
      description: description.trim() || null,
      location: location.trim() || null,
    });
  };

  const isSaveDisabled = !company.trim() || !role.trim() || !startDate || isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Empresa"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Ej: Acme Corp"
          required
        />
        <Input
          label="Rol"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="Ej: Senior Developer"
          required
        />

        <div className="space-y-2">
          <Tooltip content="Formato: YYYY-MM-DD. Ej: 2024-01-15">
            <Label htmlFor="exp-start">Fecha de inicio</Label>
          </Tooltip>
          <Input
            id="exp-start"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Tooltip content="Formato: YYYY-MM-DD. Ej: 2024-01-15">
            <Label htmlFor="exp-end">Fecha de fin</Label>
          </Tooltip>
          <Input
            id="exp-end"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <Input
          label="Ubicación"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Ej: Remoto, Buenos Aires"
        />
      </div>

      <Input
        label="Descripción"
        multiline
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describí tus responsabilidades, tecnologías usadas y desafíos que resolviste."
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
        ¿Estás seguro de eliminar esta experiencia?
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
// Experience Card
// ---------------------------------------------------------------------------

interface ExperienceCardProps {
  entry: WorkExperienceDTO;
  onEdit: () => void;
  onDelete: () => void;
}

function ExperienceCard({ entry, onEdit, onDelete }: ExperienceCardProps) {
  const dateRange = entry.endDate
    ? `${entry.startDate} – ${entry.endDate}`
    : `${entry.startDate} – Presente`;

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-text-primary">{entry.company}</p>
          <p className="text-sm text-text-secondary">{entry.role}</p>
          <p className="mt-0.5 text-xs text-text-tertiary">{dateRange}</p>
          {entry.location && (
            <p className="text-xs text-text-tertiary">{entry.location}</p>
          )}
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

export function ExperienceSection() {
  const {
    data: entries,
    isLoading,
    isError,
    error,
    createMutation,
    updateMutation,
    deleteMutation,
  } = useExperience();

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
    return <ExperienceSkeleton />;
  }

  // ── Error state ───────────────────────────────────────────────
  if (isError) {
    return (
      <div
        className="rounded-lg border border-[var(--color-error)] bg-[var(--color-error)]/5 p-4"
        role="alert"
      >
        <p className="text-sm font-medium text-[var(--color-error)]">
          Error al cargar experiencia
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
        Contanos tu experiencia laboral o proyectos relevantes. Incluí tu rol,
        tecnologías usadas y desafíos que resolviste.
      </p>

      {/* Add button */}
      {formMode === "closed" && !isEmpty && (
        <Button onClick={() => setFormMode("add")}>
          Agregar experiencia
        </Button>
      )}

      {/* Add form */}
      {formMode === "add" && (
        <Card padding="lg">
          <h4 className="mb-4 text-sm font-semibold">Nueva experiencia</h4>
          <ExperienceForm
            onSave={async (data) => {
              try {
                await createMutation.mutateAsync(data);
                addToast({
                  message: "Experiencia agregada correctamente.",
                  variant: "success",
                });
                setFormMode("closed");
              } catch {
                addToast({
                  message: "Error al guardar la experiencia.",
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
            Todavía no agregaste experiencia
          </p>
          <Button className="mt-3" onClick={() => setFormMode("add")}>
            Agregar experiencia
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
              <h4 className="mb-4 text-sm font-semibold">Editar experiencia</h4>
              <ExperienceForm
                initialValues={{
                  company: entry.company,
                  role: entry.role,
                  startDate: entry.startDate,
                  endDate: entry.endDate ?? "",
                  description: entry.description ?? "",
                  location: entry.location ?? "",
                }}
                onSave={async (data) => {
                  try {
                    await updateMutation.mutateAsync({ id: entry.id, data });
                    addToast({
                      message: "Experiencia actualizada correctamente.",
                      variant: "success",
                    });
                    setFormMode("closed");
                  } catch {
                    addToast({
                      message: "Error al actualizar la experiencia.",
                      variant: "error",
                    });
                  }
                }}
                onCancel={() => setFormMode("closed")}
                isPending={isPending}
              />
            </Card>
          ) : (
            <ExperienceCard
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
                    message: "Experiencia eliminada correctamente.",
                    variant: "success",
                  });
                  setDeleteTarget(null);
                } catch {
                  addToast({
                    message: "Error al eliminar la experiencia.",
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
