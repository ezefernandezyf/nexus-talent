import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import { Badge } from "@/shared/components/Badge";
import { Footer } from "@/shared/components/Footer";

export default function PrivacyPage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen px-4 py-8 text-[var(--text-primary)] sm:px-6 lg:px-8">
      <Card variant="flat" className="mx-auto flex w-full max-w-4xl flex-col gap-5 p-6 sm:p-8">
        <Badge variant="neutral" size="sm">Privacidad</Badge>
        <h1 className="text-3xl font-semibold tracking-[-0.03em] text-[var(--text-primary)] sm:text-4xl">Privacidad y manejo de datos</h1>
        <p className="max-w-3xl text-base leading-8 text-[var(--color-on-surface-variant)]">
          Nexus Talent guarda únicamente la información necesaria para analizar vacantes, historial local y configuraciones operativas. No vendemos datos y no agregamos tracking extra en esta página.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Button variant="primary" type="button" onClick={() => navigate("/")}>
            Volver al inicio
          </Button>
          <Button variant="secondary" type="button" onClick={() => navigate("/app/analysis")}>
            Ir al análisis
          </Button>
        </div>
      </Card>

      <Footer variant="landing" />
    </main>
  );
}