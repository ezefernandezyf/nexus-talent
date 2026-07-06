export function HistoryDetailPageSkeleton() {
  return (
    <div aria-label="Cargando detalle del análisis" className="animate-pulse space-y-6" role="status">
      {/* Back link skeleton */}
      <div className="h-4 w-32 rounded bg-surface-muted" />

      {/* Heading skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-64 rounded-lg bg-surface-muted" />
        <div className="h-4 w-96 rounded bg-surface-muted/60" />
      </div>

      {/* Editor card skeleton */}
      <div className="rounded-lg border border-border bg-surface p-8">
        <div className="space-y-4">
          <div className="h-4 w-24 rounded bg-surface-muted" />
          <div className="h-11 w-full rounded-md bg-surface-muted/60" />
          <div className="h-4 w-16 rounded bg-surface-muted" />
          <div className="h-40 w-full rounded-md bg-surface-muted/60" />
        </div>
        <div className="mt-4 h-11 w-36 rounded-md bg-surface-muted" />
      </div>

      {/* Result card 1 skeleton — Summary */}
      <div className="rounded-lg border border-border bg-surface p-8">
        <div className="mb-4 h-8 w-8 rounded bg-surface-muted" />
        <div className="mb-2 h-6 w-24 rounded bg-surface-muted" />
        <div className="space-y-3">
          <div className="h-4 w-3/4 rounded bg-surface-muted/60" />
          <div className="h-4 w-1/2 rounded bg-surface-muted/60" />
        </div>
      </div>

      {/* Result card 2 skeleton — Keywords */}
      <div className="rounded-lg border border-border bg-surface p-8">
        <div className="mb-4 h-8 w-8 rounded bg-surface-muted" />
        <div className="mb-2 h-6 w-24 rounded bg-surface-muted" />
        <div className="flex gap-2">
          <div className="h-6 w-20 rounded-md bg-surface-muted/60" />
          <div className="h-6 w-24 rounded-md bg-surface-muted/60" />
          <div className="h-6 w-16 rounded-md bg-surface-muted/60" />
        </div>
      </div>

      {/* Result card 3 skeleton — Outreach */}
      <div className="rounded-lg border border-border bg-surface p-8">
        <div className="mb-4 h-8 w-8 rounded bg-surface-muted" />
        <div className="mb-2 h-6 w-24 rounded bg-surface-muted" />
        <div className="h-24 w-full rounded-md bg-surface-muted/60" />
      </div>
    </div>
  );
}
