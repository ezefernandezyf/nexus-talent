import type { CVGenerateResponseDTO } from "@nexus-talent/shared";
import { Card } from "@/shared/components/card";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CVPreviewProps {
  data: CVGenerateResponseDTO;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CVPreview({ data }: CVPreviewProps) {
  const { sections, metadata } = data;

  if (sections.length === 0) {
    return (
      <Card padding="lg" className="text-center">
        <div className="py-8">
          <p className="text-lg font-medium text-text-primary">No CV generated yet</p>
          <p className="mt-1 text-sm text-text-secondary">
            Generate your CV to see a preview here.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6" data-testid="cv-preview">
      {/* Metadata header */}
      <div className="flex items-center gap-4 text-xs text-text-tertiary">
        {metadata.model && (
          <span>
            Model: <span className="font-medium text-text-secondary">{metadata.model}</span>
          </span>
        )}
        {metadata.generatedAt && (
          <span>
            Generated:{" "}
            <span className="font-medium text-text-secondary">
              {new Date(metadata.generatedAt).toLocaleDateString()}
            </span>
          </span>
        )}
        <span>
          {metadata.sectionCount} section{metadata.sectionCount !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Sections */}
      {sections.map((section, index) => (
        <Card key={`${section.heading}-${index}`} padding="lg" muted={index % 2 === 1}>
          <h3 className="font-display text-xl font-semibold text-text-primary">
            {section.heading}
          </h3>
          <div
            className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-text-secondary"
            data-testid={`section-body-${index}`}
          >
            {section.body}
          </div>
        </Card>
      ))}
    </div>
  );
}
