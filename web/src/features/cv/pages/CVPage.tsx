import { useState } from "react";
import { FeaturePageShell } from "@/shared/components";
import { Eyebrow } from "@/shared/components/eyebrow/Eyebrow";
import { Button } from "@/shared/components/button";
import { Card } from "@/shared/components/card";
import { Input } from "@/shared/components/input";
import { useExperience } from "@/features/cv/hooks/useExperience";
import { useEducation } from "@/features/cv/hooks/useEducation";
import { useCVGenerate } from "@/features/cv/hooks/useCVGenerate";
import { SectionOrderEditor, type SectionOption } from "@/features/cv/components/SectionOrderEditor";
import { AdHocItemForm, type AdHocItem } from "@/features/cv/components/AdHocItemForm";
import { CVPreview } from "@/features/cv/components/CVPreview";
import { exportAsMarkdown, exportAsHtml, exportAsPdf, downloadBlob } from "@/features/cv/utils/export";

// ---------------------------------------------------------------------------
// Default sections
// ---------------------------------------------------------------------------

const DEFAULT_SECTION_OPTIONS: SectionOption[] = [
  { id: "professional-summary", label: "Resumen Profesional" },
  { id: "experience", label: "Experiencia Laboral" },
  { id: "education", label: "Educacion" },
  { id: "skills", label: "Habilidades" },
  { id: "projects", label: "Proyectos" },
];

const DEFAULT_SECTION_ORDER = DEFAULT_SECTION_OPTIONS.map((o) => o.id);

const TONE_OPTIONS = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "persuasive", label: "Persuasive" },
] as const;

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function CVPage() {
  // Data from hooks
  useExperience();
  useEducation();
  const generateMutation = useCVGenerate();

  // Local state
  const [sectionOrder, setSectionOrder] = useState<string[]>(DEFAULT_SECTION_ORDER);
  const [adHocItems, setAdHocItems] = useState<AdHocItem[]>([]);
  const [jobDescription, setJobDescription] = useState("");
  const [tone, setTone] = useState<string>("professional");

  const handleGenerate = async () => {
    await generateMutation.mutateAsync({
      sectionOrder,
      adHocItems: adHocItems.length > 0 ? adHocItems : undefined,
      ...(jobDescription.trim() ? { jobDescription: jobDescription.trim() } : {}),
      tone: tone as "professional" | "casual" | "persuasive",
    });
  };

  const handleExportMarkdown = () => {
    if (!generateMutation.data) return;
    const md = exportAsMarkdown(generateMutation.data.sections);
    downloadBlob(md, "cv.md", "text/markdown");
  };

  const handleExportHtml = () => {
    if (!generateMutation.data) return;
    const html = exportAsHtml(generateMutation.data.sections);
    downloadBlob(html, "cv.html", "text/html");
  };

  const handleExportPdf = () => {
    if (!generateMutation.data) return;
    void exportAsPdf(generateMutation.data.sections);
  };

  return (
    <FeaturePageShell>
      <Eyebrow>CV</Eyebrow>
      <h1 className="text-h1 mt-2">CV Generator</h1>

      {/* Configuration panel */}
      <div className="mt-8 space-y-6">
        {/* Section order editor */}
        <Card padding="lg">
          <h2 className="mb-3 text-base font-semibold text-text-primary">Section Order</h2>
          <div data-testid="cv-section-order">
            <SectionOrderEditor
              options={DEFAULT_SECTION_OPTIONS}
              value={sectionOrder}
              onChange={setSectionOrder}
            />
          </div>
        </Card>

        {/* Ad-hoc items */}
        <Card padding="lg">
          <h2 className="mb-3 text-base font-semibold text-text-primary">Add Extra Items</h2>
          <p className="mb-4 text-sm text-text-secondary">
            Agregá items temporales que no están en tu perfil (proyectos, certificaciones, etc.)
          </p>
          <AdHocItemForm items={adHocItems} onChange={setAdHocItems} />
        </Card>

        {/* Job description */}
        <Card padding="lg">
          <h2 className="mb-3 text-base font-semibold text-text-primary">Job Description</h2>
          <p className="mb-4 text-sm text-text-secondary">
            Opcional — pegá la descripción del puesto para personalizar el CV.
          </p>
          <textarea
            data-testid="cv-job-description"
            placeholder="Descripción del puesto (opcional, hasta 12.000 caracteres)"
            className="min-h-32 w-full rounded-md border border-border bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary transition-colors duration-200 resize-y font-sans focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            maxLength={12000}
          />
        </Card>

        {/* Tone + Generate */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="w-full sm:w-48">
            <label
              htmlFor="cv-tone"
              className="mb-2 block text-sm font-medium text-text-primary"
            >
              Tone
            </label>
            <select
              id="cv-tone"
              data-testid="cv-tone-select"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full h-11 rounded-md border border-border bg-surface px-4 text-sm text-text-primary focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
            >
              {TONE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <Button
            data-testid="cv-generate-button"
            onClick={handleGenerate}
            disabled={generateMutation.isPending}
            size="lg"
          >
            {generateMutation.isPending ? (
              <span className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating...
              </span>
            ) : (
              "Generate CV"
            )}
          </Button>
        </div>
      </div>

      {/* Results section */}
      <div className="mt-10">
        {/* Empty state */}
        {generateMutation.isIdle && !generateMutation.isPending && (
          <Card padding="lg" className="text-center">
            <div className="py-8">
              <p className="text-lg font-medium text-text-primary">Generá tu CV</p>
              <p className="mt-2 text-sm text-text-secondary">
                Completá los datos de configuración y hace clic en "Generate CV" para obtener
                un CV personalizado basado en tu perfil y experiencia.
              </p>
            </div>
          </Card>
        )}

        {/* Error state */}
        {generateMutation.isError && (
          <Card padding="lg" className="border-[var(--color-error)]/30">
            <div className="py-6 text-center">
              <p className="text-lg font-semibold text-[var(--color-error)]">
                502 — Generation Failed
              </p>
              <p className="mt-2 text-sm text-text-secondary">
                {(generateMutation.error as Error)?.message ??
                  "AI response validation failed. Please try again."}
              </p>
              <Button
                className="mt-4"
                variant="outline"
                onClick={() => {
                  generateMutation.reset();
                }}
              >
                Try Again
              </Button>
            </div>
          </Card>
        )}

        {/* Success state: CVPreview + Export */}
        {generateMutation.isSuccess && generateMutation.data && (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" data-testid="cv-export-md" onClick={handleExportMarkdown}>
                Download .md
              </Button>
              <Button variant="outline" size="sm" data-testid="cv-export-html" onClick={handleExportHtml}>
                Download .html
              </Button>
              <Button variant="outline" size="sm" data-testid="cv-export-pdf" onClick={handleExportPdf}>
                Download .pdf
              </Button>
            </div>

            <div data-testid="cv-preview">
              <CVPreview data={generateMutation.data} />
            </div>
          </div>
        )}
      </div>
    </FeaturePageShell>
  );
}
