import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import { Badge } from "@/shared/components/Badge";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8 text-[var(--text-primary)] sm:px-6 lg:px-8">
      <Card className="flex w-full max-w-xl flex-col gap-4 p-6 text-center sm:p-8">
        <Badge className="mx-auto">404</Badge>
        <h1 className="text-3xl font-semibold tracking-[-0.03em] text-[var(--text-primary)] sm:text-4xl">404</h1>
        <p className="text-base leading-8 text-[var(--color-on-surface-variant)]">La ruta no existe o fue movida. Volvé al inicio para seguir trabajando desde la entrada principal.</p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Button variant="filled" type="button" onClick={() => navigate("/")}>
            Volver al inicio
          </Button>
          <Button variant="outline" type="button" onClick={() => navigate("/privacy")}>
            Ver privacidad
          </Button>
        </div>
      </Card>
    </main>
  );
}