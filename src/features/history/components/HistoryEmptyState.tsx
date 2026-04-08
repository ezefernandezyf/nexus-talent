import { Card } from "../../../components/ui/Card";
import { Link } from "react-router-dom";

interface HistoryEmptyStateProps {
  analysisHref: string;
}

export function HistoryEmptyState({ analysisHref }: HistoryEmptyStateProps) {
  return (
    <Card className="flex min-h-80 items-center justify-center p-8 sm:p-12">
      <div className="max-w-xl space-y-4 text-center">
        <span className="label-chip">Sin historial todavía</span>
        <div className="space-y-3">
          <h3 className="text-2xl font-semibold tracking-[-0.02em] text-white sm:text-3xl">
            Las vacantes analizadas aparecerán acá cuando guardes la primera.
          </h3>
          <p className="text-base leading-7 text-on-surface-variant sm:text-lg">
            El historial conserva los análisis persistidos para que puedas volver a leer el resumen, las señales técnicas y el mensaje sugerido sin repetir trabajo.
          </p>
        </div>
        <Link className="primary-button" to={analysisHref}>
          Ir al análisis
        </Link>
      </div>
    </Card>
  );
}