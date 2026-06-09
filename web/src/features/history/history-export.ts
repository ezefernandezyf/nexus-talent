import type { SavedJobAnalysis } from "../../schemas/job-analysis";

interface BuildHistoryExportPayloadResult {
  content: string;
  filename: string;
}

function createExportFilename() {
  return `nexus-talent-history-${new Date().toISOString().slice(0, 10)}.json`;
}

export function buildHistoryExportPayload(analyses: SavedJobAnalysis[]): BuildHistoryExportPayloadResult {
  return {
    content: JSON.stringify(
      {
        analyses,
        exportedAt: new Date().toISOString(),
      },
      null,
      2,
    ),
    filename: createExportFilename(),
  };
}