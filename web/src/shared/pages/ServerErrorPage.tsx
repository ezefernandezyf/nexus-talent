import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import { Badge } from "@/shared/components/Badge";

export default function ServerErrorPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8 text-[var(--color-on-surface)] sm:px-6 lg:px-8">
      <Card variant="flat" className="flex w-full max-w-xl flex-col gap-4 p-6 text-center sm:p-8">
        <Badge variant="neutral" size="sm" className="mx-auto">500</Badge>
        <h1 className="text-3xl font-semibold tracking-[-0.03em] text-[var(--color-on-surface)] sm:text-4xl">Error interno del servidor</h1>
        <p className="text-base leading-8 text-on-surface-variant">Algo salió mal del otro lado. Recargá la aplicación para intentar de nuevo.</p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Button variant="primary" type="button" onClick={() => window.location.reload()}>
            Recargar aplicación
          </Button>
        </div>
      </Card>
    </main>
  );
}
