import { useState } from "react";
import { FeaturePageShell } from "@/shared/components";
import { Eyebrow } from "@/shared/components/eyebrow/Eyebrow";
import { Button } from "@/shared/components/button";
import { Card } from "@/shared/components/card";
import { Input } from "@/shared/components/input";
import { useExperience } from "@/features/cv/hooks/useExperience";
import type { WorkExperienceCreateDTO, WorkExperienceDTO, WorkExperienceUpdateDTO } from "@nexus-talent/shared";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FormMode = "closed" | "add" | { mode: "edit"; id: string };

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function ExperienceSkeleton() {
  return (
    <div data-testid="experience-skeleton" className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} padding="lg">
          <div className="space-y-3 animate-pulse">
            <div className="h-4 w-1/3 rounded bg-surface-muted" />
            <div className="h-3 w-1/2 rounded bg-surface-muted" />
            <div className="h-3 w-2/3 rounded bg-surface-muted" />
          </div>
        </Card>
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

function ExperienceForm({ initialValues, onSave, onCancel, isPending }: ExperienceFormProps) {
  const [company, setCompany] = useState(initialValues?.company ?? "");
  const [role, setRole] = useState(initialValues?.role ?? "");
  const [startDate, setStartDate] = useState(initialValues?.startDate ?? "");
  const [endDate, setEndDate] = useState(initialValues?.endDate ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="e.g. Acme Corp"
          required
        />
        <Input
          label="Role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="e.g. Senior Developer"
          required
        />
        <Input
          label="Start Date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
        />
        <Input
          label="End Date"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <Input
          label="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g. Remote"
        />
      </div>
      <div>
        <Input
          label="Description"
          multiline
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your responsibilities and achievements"
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={!company.trim() || !role.trim() || !startDate || isPending}>
          Save
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Delete Confirmation
// ---------------------------------------------------------------------------

function DeleteConfirm({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="mt-3 rounded-md border border-[var(--color-error)] bg-[var(--color-error)]/5 p-4">
      <p className="mb-3 text-sm font-medium text-[var(--color-error)]">
        Are you sure you want to delete this entry?
      </p>
      <div className="flex gap-2">
        <Button
          variant="filled"
          style={{ background: "var(--color-error)", color: "white" }}
          onClick={onConfirm}
        >
          Confirm
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
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
    : `${entry.startDate} – Present`;

  return (
    <Card padding="lg">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-text-primary">{entry.company}</h3>
          <p className="text-base text-text-secondary">{entry.role}</p>
          <p className="mt-1 text-xs text-text-tertiary">{dateRange}</p>
          {entry.location && (
            <p className="mt-0.5 text-xs text-text-tertiary">{entry.location}</p>
          )}
          {entry.description && (
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              {entry.description}
            </p>
          )}
        </div>
        <div className="flex shrink-0 gap-1">
          <Button variant="ghost" size="sm" onClick={onEdit}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete}>
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export function ExperienceManagerPage() {
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

  // Loading state
  if (isLoading) {
    return (
      <FeaturePageShell>
        <Eyebrow>CV</Eyebrow>
        <h1 className="text-h1 mt-2">Work Experience</h1>
        <div className="mt-8">
          <ExperienceSkeleton />
        </div>
      </FeaturePageShell>
    );
  }

  // Error state
  if (isError) {
    return (
      <FeaturePageShell>
        <Eyebrow>CV</Eyebrow>
        <h1 className="text-h1 mt-2">Work Experience</h1>
        <Card padding="lg" className="mt-8">
          <div className="text-center">
            <p className="text-[var(--color-error)] font-medium">Error loading experience</p>
            <p className="mt-1 text-sm text-text-secondary">{(error as Error)?.message ?? "An unexpected error occurred."}</p>
            <Button className="mt-4" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </Card>
      </FeaturePageShell>
    );
  }

  const sortedEntries = entries ?? [];
  const isPending =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  // Empty state
  const isEmpty = sortedEntries.length === 0 && formMode === "closed";

  return (
    <FeaturePageShell>
      <Eyebrow>CV</Eyebrow>
      <h1 className="text-h1 mt-2">Work Experience</h1>

      {/* Add button (when no form is open) */}
      {formMode === "closed" && !isEmpty && (
        <div className="mt-6">
          <Button onClick={() => setFormMode("add")}>Add Experience</Button>
        </div>
      )}

      <div className="mt-6 space-y-4">
        {/* Add form */}
        {formMode === "add" && (
          <Card padding="lg">
            <h2 className="mb-4 text-base font-semibold">New Experience</h2>
            <ExperienceForm
              onSave={async (data) => {
                await createMutation.mutateAsync(data);
                setFormMode("closed");
              }}
              onCancel={() => setFormMode("closed")}
              isPending={isPending}
            />
          </Card>
        )}

        {/* Empty state */}
        {isEmpty && (
          <Card padding="lg">
            <div className="py-8 text-center">
              <p className="text-lg font-medium text-text-primary">No hay experiencia laboral</p>
              <p className="mt-1 text-sm text-text-secondary">
                Agregá tu primera experiencia laboral para empezar a construir tu CV.
              </p>
              <Button className="mt-4" onClick={() => setFormMode("add")}>
                Add Experience
              </Button>
            </div>
          </Card>
        )}

        {/* List of entries */}
        {sortedEntries.map((entry) => (
          <div key={entry.id}>
            {typeof formMode === "object" && formMode.mode === "edit" && formMode.id === entry.id ? (
              <Card padding="lg">
                <h2 className="mb-4 text-base font-semibold">Edit Experience</h2>
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
                    await updateMutation.mutateAsync({ id: entry.id, data });
                    setFormMode("closed");
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
                  await deleteMutation.mutateAsync(entry.id);
                  setDeleteTarget(null);
                }}
                onCancel={() => setDeleteTarget(null)}
              />
            )}
          </div>
        ))}
      </div>
    </FeaturePageShell>
  );
}
