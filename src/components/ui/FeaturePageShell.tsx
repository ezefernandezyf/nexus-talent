import type { PropsWithChildren } from "react";

interface FeaturePageShellProps extends PropsWithChildren {
  className?: string;
}

export function FeaturePageShell({ children }: FeaturePageShellProps) {
  return (
    <main className="deep-space-shell relative overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
      <div className="absolute left-0 top-0 -z-10 h-72 w-72 rounded-full bg-primary/10 blur-[140px]" />
      <div className="absolute right-0 top-24 -z-10 h-80 w-80 rounded-full bg-primary-container/10 blur-[160px]" />

      <div className="mx-auto flex max-w-4xl flex-col gap-10">{children}</div>
    </main>
  );
}
