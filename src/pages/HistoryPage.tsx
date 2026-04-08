import { HistoryFeature } from "../features/history";
import { useAnalysisRepository } from "../features/analysis/hooks/useAnalysisRepository";

export function HistoryPage() {
  const { repository, scope } = useAnalysisRepository();

  return <HistoryFeature repository={repository} scope={scope} />;
}
