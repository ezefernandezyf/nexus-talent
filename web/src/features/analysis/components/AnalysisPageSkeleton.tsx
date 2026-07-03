export function AnalysisPageSkeleton() {
  return (
    <div aria-label="Cargando análisis" className="animate-pulse space-y-6" role="status">
      {/* Page header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-48 rounded-lg bg-surface-container" />
        <div className="h-4 w-96 rounded bg-surface-container/60" />
      </div>

      {/* Form area skeleton — mimics JobDescriptionForm layout */}
      <div className="rounded-2xl bg-surface-container-low/40 p-6 sm:p-8">
        <div className="mb-4 h-5 w-32 rounded bg-surface-container" />
        <div className="mb-4 h-40 w-full rounded-xl bg-surface-container/60" />
        <div className="h-10 w-40 rounded-full bg-surface-container" />
      </div>

      {/* Result cards skeleton — mimics AnalysisResultView card stack */}
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-surface-container-low/40 p-6 sm:p-8">
            <div className="mb-3 h-4 w-24 rounded bg-surface-container" />
            <div className="space-y-3">
              <div className="h-4 w-3/4 rounded bg-surface-container/60" />
              <div className="h-4 w-1/2 rounded bg-surface-container/60" />
              <div className="h-4 w-5/6 rounded bg-surface-container/40" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
