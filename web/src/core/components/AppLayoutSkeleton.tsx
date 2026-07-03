export function AppLayoutSkeleton() {
  return (
    <div
      aria-label="Cargando aplicación"
      className="relative mx-auto flex min-h-screen w-full flex-col gap-6 bg-surface-container-lowest px-4 py-4 sm:px-6 lg:px-8"
      role="status"
    >
      {/* Header skeleton — fixed top bar */}
      <div className="fixed left-0 top-0 flex h-16 w-full animate-pulse items-center justify-between bg-surface-container-low px-6">
        <div className="flex items-center gap-8">
          <div className="h-6 w-32 rounded-lg bg-surface-container" />
          <div className="hidden gap-6 md:flex">
            <div className="h-4 w-16 rounded bg-surface-container" />
            <div className="h-4 w-20 rounded bg-surface-container" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden h-10 w-10 rounded-full bg-surface-container md:block" />
          <div className="hidden h-10 w-10 rounded-full bg-surface-container md:block" />
        </div>
      </div>

      {/* Body: sidebar + content */}
      <div className="flex flex-1 gap-6 pt-16">
        {/* Sidebar skeleton — desktop only */}
        <aside className="fixed left-0 top-16 hidden h-[calc(100vh-64px)] w-64 flex-col gap-5 bg-surface-container-lowest p-4 lg:flex">
          <div className="mb-4 space-y-2 px-2">
            <div className="h-4 w-28 animate-pulse rounded bg-surface-container" />
            <div className="h-3 w-36 animate-pulse rounded bg-surface-container/60" />
          </div>
          <div className="h-10 w-full animate-pulse rounded-full bg-surface-container" />
          <div className="flex flex-1 flex-col gap-3 pr-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-14 w-full animate-pulse rounded-lg bg-surface-container/40" />
            ))}
          </div>
          <div className="mt-auto space-y-3 border-t border-outline-variant/15 pt-4">
            <div className="h-10 w-full animate-pulse rounded-2xl bg-surface-container/40" />
            <div className="h-10 w-full animate-pulse rounded-2xl bg-surface-container/40" />
          </div>
        </aside>

        {/* Content area skeleton */}
        <div className="flex min-w-0 flex-1 flex-col gap-6 lg:ml-64">
          <div className="flex flex-col gap-6 p-6">
            <div className="h-8 w-48 animate-pulse rounded-lg bg-surface-container" />
            <div className="grid gap-6 md:grid-cols-2">
              <div className="h-32 animate-pulse rounded-2xl bg-surface-container/60" />
              <div className="h-32 animate-pulse rounded-2xl bg-surface-container/60" />
            </div>
            <div className="h-64 animate-pulse rounded-2xl bg-surface-container/40" />
          </div>
        </div>
      </div>

      {/* Footer skeleton */}
      <div className="h-16 w-full animate-pulse rounded-2xl bg-surface-container/30" />
    </div>
  );
}
