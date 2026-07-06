import { Link } from "react-router-dom";
import { Card } from "@/shared/components/Card";
import { Button } from "@/shared/components/Button";

interface HistoryEmptyStateProps {
  analysisHref: string;
}

export function HistoryEmptyState({ analysisHref }: HistoryEmptyStateProps) {
  return (
    <Card className="p-8 text-center">
      <div className="mx-auto max-w-lg space-y-4">
        <h3 className="text-h3 text-text-primary">Las vacantes analizadas aparecerán acá cuando guardes la primera.</h3>
        <p className="text-body text-text-secondary">
          El historial conserva los análisis persistidos para que puedas volver a leer el resumen,
          las señales técnicas y el mensaje sugerido sin repetir trabajo.
        </p>
        <div className="flex justify-center pt-2">
          <Link to={analysisHref}>
            <Button>Ir al análisis</Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
