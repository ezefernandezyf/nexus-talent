import { LandingIcon } from "./LandingIcon";

export function HeroMetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="ghost-frame rounded-2xl bg-surface-container-lowest/70 px-4 py-4">
      <p className="font-label text-[0.68rem] uppercase tracking-[0.28em] text-on-surface-variant">{label}</p>
      <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-white">{value}</p>
    </div>
  );
}

export function HeroFeatureCard({ title, copy, icon }: { title: string; copy: string; icon: string }) {
  return (
    <div className="surface-panel flex flex-col justify-between gap-5 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-[inset_0_0_0_1px_rgba(142,213,255,0.14)]">
          <LandingIcon aria-hidden="true" className="h-6 w-6 text-primary" name={icon as never} />
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold tracking-[-0.03em] text-white">{title}</h3>
        <p className="text-sm leading-6 text-on-surface-variant">{copy}</p>
      </div>
    </div>
  );
}
