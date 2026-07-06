export function SettingsPageSkeleton() {
  return (
    <div aria-label="Cargando configuración" className="animate-pulse space-y-6" role="status">
      {/* Eyebrow + heading skeleton */}
      <div className="space-y-2">
        <div className="h-4 w-24 rounded bg-surface-muted" />
        <div className="h-8 w-48 rounded-lg bg-surface-muted" />
      </div>

      {/* Card 01 skeleton — Account */}
      <div className="rounded-lg border border-border bg-surface p-8">
        <div className="mb-4 h-8 w-8 rounded bg-surface-muted" />
        <div className="mb-2 h-6 w-32 rounded bg-surface-muted" />
        <div className="mb-6 h-4 w-64 rounded bg-surface-muted/60" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="h-4 w-20 rounded bg-surface-muted" />
            <div className="h-11 w-full rounded-md bg-surface-muted/60" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-16 rounded bg-surface-muted" />
            <div className="h-11 w-full rounded-md bg-surface-muted/60" />
          </div>
        </div>
        <div className="mt-6 h-11 w-36 rounded-md bg-surface-muted" />
      </div>

      {/* Card 02 skeleton — Appearance */}
      <div className="rounded-lg border border-border bg-surface p-8">
        <div className="mb-4 h-8 w-8 rounded bg-surface-muted" />
        <div className="mb-2 h-6 w-40 rounded bg-surface-muted" />
        <div className="h-4 w-72 rounded bg-surface-muted/60" />
      </div>

      {/* Card 03 skeleton — Data */}
      <div className="rounded-lg border border-border bg-surface p-8">
        <div className="mb-4 h-8 w-8 rounded bg-surface-muted" />
        <div className="mb-2 h-6 w-24 rounded bg-surface-muted" />
        <div className="mb-6 h-4 w-56 rounded bg-surface-muted/60" />
        <div className="flex gap-3">
          <div className="h-11 w-36 rounded-md border border-border bg-surface-muted/60" />
          <div className="h-11 w-28 rounded-md bg-surface-muted/60" />
        </div>
      </div>
    </div>
  );
}
