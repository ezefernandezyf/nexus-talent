import { EmptyState } from "../../../components/ui";

interface HistoryEmptyStateProps {
  analysisHref: string;
}

export function HistoryEmptyState({ analysisHref }: HistoryEmptyStateProps) {
  return (
    <EmptyState
      ctaHref={analysisHref}
      ctaLabel="Ir al análisis"
      description="El historial conserva los análisis persistidos para que puedas volver a leer el resumen, las señales técnicas y el mensaje sugerido sin repetir trabajo."
      title="Las vacantes analizadas aparecerán acá cuando guardes la primera."
    />
  );
}