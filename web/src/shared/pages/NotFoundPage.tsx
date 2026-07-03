import { Link } from "react-router-dom";
import { Card } from "@/shared/components/Card";
import { Badge } from "@/shared/components/Badge";
import { cn } from "@/shared/utils/cn";

const linkBtnPrimary = cn(
  "inline-flex items-center justify-center rounded-full font-label select-none",
  "transition-all duration-[var(--duration-fast)] ease-[var(--ease-out-expo)]",
  "bg-[var(--color-brand)] text-[var(--color-on-brand)]",
  "hover:brightness-105 hover:-translate-y-0.5 active:scale-[0.97]",
  "h-10 px-4 text-label text-base gap-2",
);

const linkBtnSecondary = cn(
  "inline-flex items-center justify-center rounded-full font-label select-none",
  "transition-all duration-[var(--duration-fast)] ease-[var(--ease-out-expo)]",
  "bg-[var(--color-accent)] text-[var(--color-on-accent)]",
  "hover:brightness-105 hover:-translate-y-0.5 active:scale-[0.97]",
  "h-10 px-4 text-label text-base gap-2",
);

export default function NotFoundPage() {
  return (
    <main className="deep-space-shell flex min-h-screen items-center justify-center px-4 py-8 text-on-surface sm:px-6 lg:px-8">
      <Card variant="flat" className="flex w-full max-w-xl flex-col gap-4 p-6 text-center sm:p-8">
        <Badge variant="neutral" size="sm" className="mx-auto">404</Badge>
        <h1 className="text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">404</h1>
        <p className="text-base leading-8 text-on-surface-variant">La ruta no existe o fue movida. Volvé al inicio para seguir trabajando desde la entrada principal.</p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link className={linkBtnPrimary} to="/">
            Volver al inicio
          </Link>
          <Link className={linkBtnSecondary} to="/privacy">
            Ver privacidad
          </Link>
        </div>
      </Card>
    </main>
  );
}