import type { PropsWithChildren } from "react";
import { cn } from "@/shared/utils/cn";

interface FeaturePageShellProps extends PropsWithChildren {
  className?: string;
}

export function FeaturePageShell({ children, className }: FeaturePageShellProps) {
  return (
    <main className={cn("deep-space-shell relative overflow-hidden px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10", className)}>
      {/* Deep Teal accent line at top */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 right-0 top-0 z-10 h-[2px] bg-gradient-to-r from-transparent via-[var(--color-brand)] to-transparent opacity-60"
      />

      {/* Subtle grid pattern — Apex geometric texture */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: [
            "linear-gradient(135deg, var(--color-brand) 1px, transparent 1px)",
            "linear-gradient(45deg, var(--color-brand) 1px, transparent 1px)",
          ].join(", "),
          backgroundSize: "64px 64px",
        }}
      />

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 sm:gap-10">{children}</div>
    </main>
  );
}
