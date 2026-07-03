import { Link } from "react-router-dom";
import { Card } from "@/shared/components/Card";
import { Badge } from "@/shared/components/Badge";
import { Footer } from "@/shared/components/Footer";
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

export default function PrivacyPage() {
  return (
    <main className="deep-space-shell min-h-screen px-4 py-8 text-on-surface sm:px-6 lg:px-8">
      <Card variant="flat" className="mx-auto flex w-full max-w-4xl flex-col gap-5 p-6 sm:p-8">
        <Badge variant="neutral" size="sm">Privacidad</Badge>
        <h1 className="text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">Privacidad y manejo de datos</h1>
        <p className="max-w-3xl text-base leading-8 text-on-surface-variant">
          Nexus Talent guarda únicamente la información necesaria para analizar vacantes, historial local y configuraciones operativas. No vendemos datos y no agregamos tracking extra en esta página.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link className={linkBtnPrimary} to="/">
            Volver al inicio
          </Link>
          <Link className={linkBtnSecondary} to="/app/analysis">
            Ir al análisis
          </Link>
        </div>
      </Card>

      <Footer variant="landing" />
    </main>
  );
}