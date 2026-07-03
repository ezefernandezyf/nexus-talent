export function HistoryDetailPageSkeleton() {
  return (
    <div aria-label="Cargando detalle del análisis" className="animate-pulse space-y-6" role="status">
      {/* Back button skeleton */}
      <div className="h-10 w-32 rounded-full bg-surface-container" />

      {/* Page header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-64 rounded-lg bg-surface-container" />
        <div className="h-4 w-96 rounded bg-surface-container/60" />
      </div>

      {/* Summary card skeleton — mimics detail summary */}
      <div className="rounded-2xl bg-surface-container-low/40 p-6 sm:p-8">
        <div className="mb-4 h-4 w-24 rounded bg-surface-container" />
        <div className="space-y-3">
          <div className="h-4 w-3/4 rounded bg-surface-container/60" />
          <div className="h-4 w-1/2 rounded bg-surface-container/60" />
          <div className="h-4 w-5/6 rounded bg-surface-container/40" />
        </div>
      </div>

      {/* Editor form skeleton — mimics HistoryDetailEditor */}
      <div className="rounded-2xl bg-surface-container-low/40 p-6 sm:p-8">
        <div className="mb-4 h-4 w-20 rounded bg-surface-container" />
        <div className="space-y-4">
          <div className="h-10 w-full rounded-lg bg-surface-container/60" />
          <div className="h-24 w-full rounded-xl bg-surface-container/60" />
        </div>
        <div className="mt-4 h-10 w-32 rounded-full bg-surface-container" />
      </div>

      {/* Result section skeleton — mimics AnalysisResultView */}
      <div className="space-y-4">
        <div className="rounded-2xl bg-surface-container-low/40 p-6 sm:p-8">
          <div className="mb-3 h-4 w-24 rounded bg-surface-container" />
          <div className="space-y-3">
            <div className="h-4 w-3/4 rounded bg-surface-container/60" />
            <div className="h-4 w-1/2 rounded bg-surface-container/60" />
          </div>
        </div>
      </div>
    </div>
  );
}
