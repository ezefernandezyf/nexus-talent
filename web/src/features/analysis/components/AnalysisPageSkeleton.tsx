export function AnalysisPageSkeleton() {
  return (
    <div aria-label="Cargando análisis" className="animate-pulse space-y-6" role="status">
      {/* Form area skeleton */}
      <div className="rounded-lg border border-border bg-surface p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="mb-2 h-4 w-32 rounded bg-surface-muted" />
        <div className="mb-4 h-40 w-full rounded-md bg-surface-muted/60" />
        <div className="h-4 w-24 rounded bg-surface-muted" />
        <div className="mt-2 h-10 w-28 rounded-md bg-surface-muted" />
        <div className="mt-4 h-4 w-36 rounded bg-surface-muted" />
        <div className="mt-2 h-10 w-56 rounded-md bg-surface-muted" />
      </div>

      {/* 5 numbered result section skeletons */}
      {[1, 2, 3, 4, 5].map((section) => (
        <div key={section} className="rounded-lg border border-border bg-surface p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-surface-muted">
              <div className="h-5 w-5 rounded bg-surface-muted/60" />
            </div>
            <div className="flex-1 space-y-3">
              <div className="h-6 w-48 rounded bg-surface-muted" />
              <div className="h-4 w-3/4 rounded bg-surface-muted/60" />
              <div className="h-4 w-1/2 rounded bg-surface-muted/60" />
              <div className="h-4 w-5/6 rounded bg-surface-muted/40" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
