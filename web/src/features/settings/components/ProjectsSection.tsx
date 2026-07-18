import { useState } from "react";
import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import { Input } from "@/shared/components/Input";
import { Label } from "@/shared/components/label/Label";
import { Tooltip } from "@/shared/components/tooltip";
import { useToastStore } from "@/shared/components/toast";
import { useProjects } from "@/features/cv/hooks/useProjects";
import type { ProjectCreateDTO, ProjectDTO } from "@nexus-talent/shared";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FormMode = "closed" | "add" | { mode: "edit"; id: string };

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function ProjectsSkeleton() {
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

interface ProjectFormProps {
  initialValues?: Partial<ProjectCreateDTO>;
  onSave: (data: ProjectCreateDTO) => void;
  onCancel: () => void;
  isPending: boolean;
}

function ProjectForm({
  initialValues,
  onSave,
  onCancel,
  isPending,
}: ProjectFormProps) {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [role, setRole] = useState(initialValues?.role ?? "");
  const [startDate, setStartDate] = useState(initialValues?.startDate ?? "");
  const [endDate, setEndDate] = useState(initialValues?.endDate ?? "");
  const [description, setDescription] = useState(
    initialValues?.description ?? "",
  );
  const [technologies, setTechnologies] = useState(
    initialValues?.technologies ?? "",
  );
  const [demoUrl, setDemoUrl] = useState(initialValues?.demoUrl ?? "");
  const [repoUrl, setRepoUrl] = useState(initialValues?.repoUrl ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !startDate) return;

    onSave({
      name: name.trim(),
      role: role.trim() || null,
      startDate,
      endDate: endDate || null,
      description: description.trim() || null,
      technologies: technologies.trim() || null,
      demoUrl: demoUrl.trim() || null,
      repoUrl: repoUrl.trim() || null,
    });
  };

  const isSaveDisabled = !name.trim() || !startDate || isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Nombre del proyecto"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Nexus Talent"
          required
        />
        <Input
          label="Rol"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="Ej: Full-stack Developer"
        />

        <div className="space-y-2">
          <Tooltip content="Formato: YYYY-MM-DD. Ej: 2024-01-15">
            <Label htmlFor="proj-start">Fecha de inicio</Label>
          </Tooltip>
          <Input
            id="proj-start"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Tooltip content="Formato: YYYY-MM-DD. Dejalo vacío si es tu proyecto actual.">
            <Label htmlFor="proj-end">Fecha de fin</Label>
          </Tooltip>
          <Input
            id="proj-end"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <Input
          label="Tecnologías"
          value={technologies}
          onChange={(e) => setTechnologies(e.target.value)}
          placeholder="Ej: React, Node.js, PostgreSQL"
        />
        <Input
          label="URL del demo"
          type="url"
          value={demoUrl}
          onChange={(e) => setDemoUrl(e.target.value)}
          placeholder="https://..."
        />
        <Input
          label="URL del repositorio"
          type="url"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          placeholder="https://github.com/..."
        />
      </div>

      <Input
        label="Descripción"
        multiline
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describí el proyecto, tu rol, tecnologías clave y desafíos que resolviste."
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
        ¿Estás seguro de eliminar este proyecto?
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
// Project Card
// ---------------------------------------------------------------------------

interface ProjectCardProps {
  entry: ProjectDTO;
  onEdit: () => void;
  onDelete: () => void;
}

function ProjectCard({ entry, onEdit, onDelete }: ProjectCardProps) {
  const dateRange = entry.endDate
    ? `${entry.startDate} – ${entry.endDate}`
    : `${entry.startDate} – Presente`;

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-text-primary">{entry.name}</p>
          {entry.role && (
            <p className="text-sm text-text-secondary">{entry.role}</p>
          )}
          <p className="mt-0.5 text-xs text-text-tertiary">{dateRange}</p>
          {entry.technologies && (
            <p className="mt-1 text-xs text-text-tertiary">
              {entry.technologies}
            </p>
          )}
          {entry.description && (
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              {entry.description}
            </p>
          )}
          {(entry.demoUrl || entry.repoUrl) && (
            <div className="mt-2 flex gap-3">
              {entry.demoUrl && (
                <a
                  href={entry.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-accent hover:underline"
                >
                  Demo
                </a>
              )}
              {entry.repoUrl && (
                <a
                  href={entry.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-accent hover:underline"
                >
                  Repositorio
                </a>
              )}
            </div>
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

export function ProjectsSection() {
  const {
    data: entries,
    isLoading,
    isError,
    error,
    createMutation,
    updateMutation,
    deleteMutation,
  } = useProjects();

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
    return <ProjectsSkeleton />;
  }

  // ── Error state ───────────────────────────────────────────────
  if (isError) {
    return (
      <div
        className="rounded-lg border border-[var(--color-error)] bg-[var(--color-error)]/5 p-4"
        role="alert"
      >
        <p className="text-sm font-medium text-[var(--color-error)]">
          Error al cargar proyectos
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
        Agregá tus proyectos personales, freelance o de código abierto. Incluí
        tu rol, tecnologías usadas y URLs relevantes.
      </p>

      {/* Add button */}
      {formMode === "closed" && !isEmpty && (
        <Button onClick={() => setFormMode("add")}>
          Agregar proyecto
        </Button>
      )}

      {/* Add form */}
      {formMode === "add" && (
        <Card padding="lg">
          <h4 className="mb-4 text-sm font-semibold">Nuevo proyecto</h4>
          <ProjectForm
            onSave={async (data) => {
              try {
                await createMutation.mutateAsync(data);
                addToast({
                  message: "Proyecto agregado correctamente.",
                  variant: "success",
                });
                setFormMode("closed");
              } catch {
                addToast({
                  message: "Error al guardar el proyecto.",
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
            Todavía no agregaste proyectos
          </p>
          <Button className="mt-3" onClick={() => setFormMode("add")}>
            Agregar proyecto
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
              <h4 className="mb-4 text-sm font-semibold">Editar proyecto</h4>
              <ProjectForm
                initialValues={{
                  name: entry.name,
                  role: entry.role ?? "",
                  startDate: entry.startDate,
                  endDate: entry.endDate ?? "",
                  description: entry.description ?? "",
                  technologies: entry.technologies ?? "",
                  demoUrl: entry.demoUrl ?? "",
                  repoUrl: entry.repoUrl ?? "",
                }}
                onSave={async (data) => {
                  try {
                    await updateMutation.mutateAsync({ id: entry.id, data });
                    addToast({
                      message: "Proyecto actualizado correctamente.",
                      variant: "success",
                    });
                    setFormMode("closed");
                  } catch {
                    addToast({
                      message: "Error al actualizar el proyecto.",
                      variant: "error",
                    });
                  }
                }}
                onCancel={() => setFormMode("closed")}
                isPending={isPending}
              />
            </Card>
          ) : (
            <ProjectCard
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
                    message: "Proyecto eliminado correctamente.",
                    variant: "success",
                  });
                  setDeleteTarget(null);
                } catch {
                  addToast({
                    message: "Error al eliminar el proyecto.",
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
