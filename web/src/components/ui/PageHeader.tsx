import type { ReactNode } from "react";

interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl space-y-2">
        <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">{title}</h1>
        {description ? <p className="text-on-surface-variant">{description}</p> : null}
      </div>
      {action ? <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end sm:gap-3">{action}</div> : null}
    </header>
  );
}
