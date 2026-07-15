import type { CVGenerateResponseDTO } from "@nexus-talent/shared";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CVPreviewProps {
  data: CVGenerateResponseDTO;
}

// ---------------------------------------------------------------------------
// Lapis CV — inline styles (for elements Tailwind can't easily express)
// ---------------------------------------------------------------------------

const LAPIS_ACCENT = "#4870ad";
const LAPIS_TEXT = "#353a42";

const styles = {
  sectionHeadingBorder: {
    borderBottom: `1px solid #dae3ea`,
    paddingBottom: "2pt",
  } as const,
  link: {
    color: LAPIS_ACCENT,
    textDecoration: "underline",
    textUnderlineOffset: "2pt",
  } as const,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CVPreview({ data }: CVPreviewProps) {
  const { sections, metadata } = data;

  if (sections.length === 0) {
    return (
      <div className="mx-auto flex max-w-[210mm] items-center justify-center bg-white p-[20mm] shadow-lg">
        <p className="text-center font-['Noto_Sans_SC'] text-[9.5pt] leading-[1.55] text-[#353a42]">
          No CV generated yet
        </p>
      </div>
    );
  }

  // Sort sections by order
  const sorted = [...sections].sort((a, b) => a.order - b.order);

  return (
    <div
      className="mx-auto max-w-[210mm] bg-white p-[20mm] shadow-lg"
      data-testid="cv-preview"
      style={{ color: LAPIS_TEXT }}
    >
      {/* Metadata line */}
      <div
        className="mb-4 text-[8pt] font-['JetBrains_Mono'] leading-[1.4]"
        style={{ color: "rgba(53,58,66,0.55)" }}
      >
        {metadata.model && (
          <span>
            Model: {metadata.model}
            {metadata.generatedAt && " · "}
          </span>
        )}
        {metadata.generatedAt && (
          <span>{new Date(metadata.generatedAt).toLocaleDateString()}</span>
        )}
      </div>

      {/* Sections */}
      {sorted.map((section, index) => {
        // First section = Name (h1)
        if (index === 0) {
          return (
            <div key={section.heading} className="mb-6">
              <h1
                className="text-center font-['Noto_Serif_SC'] text-[14pt] font-bold leading-[1.2]"
                style={{ color: LAPIS_TEXT }}
              >
                {section.heading}
              </h1>
              <div
                className="mt-2 whitespace-pre-wrap font-['Noto_Sans_SC'] text-[9.5pt] leading-[1.55]"
                data-testid="section-body-0"
                style={{ color: LAPIS_TEXT }}
              >
                {section.body}
              </div>
            </div>
          );
        }

        // Subsequent sections = h2 with border-bottom
        return (
          <div key={`${section.heading}-${index}`} className="mb-5">
            <h2
              className="mb-2 font-['Noto_Serif_SC'] text-[10.5pt] font-semibold leading-[1.3]"
              style={{ ...styles.sectionHeadingBorder, color: LAPIS_TEXT }}
            >
              {section.heading}
            </h2>
            <div
              className="whitespace-pre-wrap font-['Noto_Sans_SC'] text-[9.5pt] leading-[1.55]"
              data-testid={`section-body-${index}`}
              style={{ color: LAPIS_TEXT }}
            >
              {section.body}
            </div>
          </div>
        );
      })}
    </div>
  );
}
