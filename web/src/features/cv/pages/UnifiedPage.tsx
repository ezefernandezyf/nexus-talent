import { useRef, useState } from "react";
import { FeaturePageShell } from "@/shared/components";
import { Button } from "@/shared/components/button";
import { Card } from "@/shared/components/card";
import { useExperience } from "@/features/cv/hooks/useExperience";
import { useEducation } from "@/features/cv/hooks/useEducation";
import { useCVGenerate } from "@/features/cv/hooks/useCVGenerate";
import { SectionOrderEditor, type SectionOption } from "@/features/cv/components/SectionOrderEditor";
import { AdHocItemForm, type AdHocItem } from "@/features/cv/components/AdHocItemForm";
import { CVPreview } from "@/features/cv/components/CVPreview";
import { exportAsMarkdown, exportAsHtml, exportAsPdf, downloadBlob } from "@/features/cv/utils/export";
import { useJobAnalysis } from "@/features/analysis/hooks/useJobAnalysis";
import { useAnalysisRepository } from "@/features/analysis/hooks/useAnalysisRepository";
import { AnalysisResultView } from "@/features/analysis/components/AnalysisResultView";
import { JOB_ANALYSIS_MESSAGE_TONE } from "@/features/analysis/schemas/job-analysis";
import type { CVGenerateResponseDTO } from "@nexus-talent/shared";

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
// Empty section filter
// ---------------------------------------------------------------------------

/**
 * Removes CV sections whose body is empty, null, or whitespace-only.
 * Also updates the metadata sectionCount to match.
 */
export function filterEmptySections(response: CVGenerateResponseDTO): CVGenerateResponseDTO {
  const filtered = response.sections.filter((s) => s.body.trim().length > 0);
  return {
    ...response,
    sections: filtered,
    metadata: {
      ...response.metadata,
      sectionCount: filtered.length,
    },
  };
}

// ---------------------------------------------------------------------------
// Tone map: CV tone values ("professional") → Analysis tone ("formal")
// ---------------------------------------------------------------------------

const TONE_TO_ANALYSIS: Record<string, (typeof JOB_ANALYSIS_MESSAGE_TONE)[keyof typeof JOB_ANALYSIS_MESSAGE_TONE]> = {
  professional: JOB_ANALYSIS_MESSAGE_TONE.FORMAL,
  casual: JOB_ANALYSIS_MESSAGE_TONE.CASUAL,
  persuasive: JOB_ANALYSIS_MESSAGE_TONE.PERSUASIVE,
};

// ---------------------------------------------------------------------------
// Skeleton placeholder
// ---------------------------------------------------------------------------

function ResultSkeleton({ label }: { label: string }) {
  return (
    <Card padding="lg" className="animate-pulse" aria-label={`Loading ${label}`} role="status">
      <div className="space-y-4">
        <div className="h-6 w-48 rounded bg-[var(--surface-muted)]" />
        <div className="space-y-2">
          <div className="h-4 w-full rounded bg-[var(--surface-muted)]" />
          <div className="h-4 w-3/4 rounded bg-[var(--surface-muted)]" />
          <div className="h-4 w-5/6 rounded bg-[var(--surface-muted)]" />
        </div>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Error card
// ---------------------------------------------------------------------------

function ErrorCard({
  title,
  message,
  onRetry,
}: {
  title: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <Card padding="lg" className="border-[var(--color-error)]/30">
      <div className="py-6 text-center">
        <p className="text-lg font-semibold text-[var(--color-error)]">{title}</p>
        <p className="mt-2 text-sm text-text-secondary">{message}</p>
        {onRetry && (
          <Button className="mt-4" variant="outline" onClick={onRetry}>
            Try Again
          </Button>
        )}
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// UnifiedPage
// ---------------------------------------------------------------------------

/**
 * Unified CV + Analysis page.
 *
 * ## Parallel API Orchestration Pattern
 *
 * The two APIs fire in parallel from `handleGenerate`, but they use different
 * consumption patterns because each hook was designed differently:
 *
 * **useCVGenerate** — returns a standard TanStack `useMutation`. We call
 * `mutateAsync()` which returns a Promise. The result is captured via `.then()`
 * and stored in local `useState`. This gives us explicit control over when the
 * CV result appears and lets us run `filterEmptySections()` before rendering.
 *
 * **useJobAnalysis** — has internal reactive state (`viewState`) synced via an
 * `activeSubmissionKeyRef`. Calling `mutateAsync` directly would bypass this ref
 * and the hook's `onSuccess` would return early because the key was never set.
 * Instead we use `submitAnalysis()`, which sets the ref, resets the internal
 * state to "pending", and calls `mutation.mutate()` (fire-and-forget). We
 * observe the result reactively through `isSuccess` / `data` / `isError`.
 *
 * This is NOT Promise.all — each path resolves independently. If one fails,
 * the other still renders. Loading skeletons are per-section.
 */
export function UnifiedPage() {
  // Data from hooks
  useExperience();
  useEducation();
  const cvMutation = useCVGenerate();
  const { repository, scope } = useAnalysisRepository();
  const {
    submitAnalysis,
    data: analysisResult,
    isPending: analysisIsPending,
    isSuccess: analysisIsSuccess,
    isError: analysisIsError,
    error: analysisError,
  } = useJobAnalysis({ repository, scope });

  // Local state
  const [sectionOrder, setSectionOrder] = useState<string[]>(DEFAULT_SECTION_ORDER);
  const [adHocItems, setAdHocItems] = useState<AdHocItem[]>([]);
  const [jobDescription, setJobDescription] = useState("");
  const [tone, setTone] = useState<string>("professional");
  const [jdError, setJdError] = useState<string | null>(null);

  // CV result & error (separate from mutation state — we control them manually)
  const [cvResult, setCVResult] = useState<CVGenerateResponseDTO | null>(null);
  const [cvError, setCVError] = useState<Error | null>(null);

  // Scroll behavior
  const resultsRef = useRef<HTMLDivElement>(null);
  const hasScrolledRef = useRef(false);

  // Scroll to results on first data arrival (either CV or analysis)
  const hasAnyResult = cvResult !== null || analysisIsSuccess;
  if (hasAnyResult && !hasScrolledRef.current) {
    hasScrolledRef.current = true;
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }

  // -------------------------------------------------------------------
  // GENERATE handler — fires both APIs in parallel
  // -------------------------------------------------------------------

  const handleGenerate = () => {
    const normalizedJd = jobDescription.trim();

    // JD validation (≥30 chars — matches JobDescriptionForm pattern)
    if (normalizedJd.length < 30) {
      setJdError("Información insuficiente. La descripción debe tener al menos 30 caracteres.");
      return;
    }
    setJdError(null);

    // Clear previous CV results
    setCVResult(null);
    setCVError(null);
    hasScrolledRef.current = false;

    // ── Fire CV (promise-based via mutateAsync) ─────────────────
    cvMutation.mutateAsync({
      sectionOrder,
      adHocItems: adHocItems.length > 0 ? adHocItems : undefined,
      jobDescription: normalizedJd,
      tone: tone as "professional" | "casual" | "persuasive",
    })
      .then((result) => setCVResult(filterEmptySections(result)))
      .catch((err: Error) => setCVError(err));

    // ── Fire Analysis (reactive via submitAnalysis) ─────────────
    // submitAnalysis sets the internal activeSubmissionKeyRef before
    // calling mutation.mutate(), which ensures onSuccess/onError fire
    // correctly. We observe the result reactively via hook state.
    submitAnalysis({
      jobDescription: normalizedJd,
      messageTone: TONE_TO_ANALYSIS[tone],
    });
  };

  // -------------------------------------------------------------------
  // Export handlers
  // -------------------------------------------------------------------

  const handleExportMarkdown = () => {
    if (!cvResult) return;
    const md = exportAsMarkdown(cvResult.sections);
    downloadBlob(md, "cv.md", "text/markdown");
  };

  const handleExportHtml = () => {
    if (!cvResult) return;
    const html = exportAsHtml(cvResult.sections);
    downloadBlob(html, "cv.html", "text/html");
  };

  const handleExportPdf = () => {
    if (!cvResult) return;
    void exportAsPdf(cvResult.sections);
  };

  const isGenerating = cvMutation.isPending || analysisIsPending;

  // -------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------

  return (
    <FeaturePageShell>
      <h1 className="text-h1 mt-2">CV Generator &amp; Analysis</h1>

      {/* ── Config Panel ──────────────────────────────────────── */}
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
            Pegá la descripción del puesto para personalizar el CV y analizar la compatibilidad.
          </p>
          <textarea
            data-testid="unified-job-description"
            placeholder="Descripción del puesto (mín. 30 caracteres, hasta 12.000)"
            className="min-h-32 w-full rounded-md border border-border bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary transition-colors duration-200 resize-y font-sans focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] aria-[invalid=true]:border-[var(--color-error)]"
            value={jobDescription}
            onChange={(e) => {
              setJobDescription(e.target.value);
              if (jdError) setJdError(null);
            }}
            maxLength={12000}
            aria-invalid={jdError !== null}
            aria-describedby="jd-error"
          />
          {jdError && (
            <p id="jd-error" className="mt-2 text-sm text-[var(--color-error)]" role="alert">
              {jdError}
            </p>
          )}
        </Card>

        {/* Tone + Generate */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="w-full sm:w-48">
            <label
              htmlFor="unified-tone"
              className="mb-2 block text-sm font-medium text-text-primary"
            >
              Tone
            </label>
            <select
              id="unified-tone"
              data-testid="unified-tone-select"
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
            data-testid="unified-generate"
            onClick={handleGenerate}
            disabled={isGenerating}
            size="lg"
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Generating...
              </span>
            ) : (
              "Generate CV & Analysis"
            )}
          </Button>
        </div>
      </div>

      {/* ── Results Area ──────────────────────────────────────── */}
      <div ref={resultsRef} className="mt-10 space-y-10">
        {/* Empty / idle state */}
        {!cvMutation.isPending &&
          cvResult === null &&
          cvError === null &&
          !analysisIsPending &&
          !analysisIsSuccess &&
          !analysisIsError && (
            <Card padding="lg" className="text-center">
              <div className="py-8">
                <p className="text-lg font-medium text-text-primary">Generá tu CV y Análisis</p>
                <p className="mt-2 text-sm text-text-secondary">
                  Completá los datos de configuración y hace clic en "Generate CV &amp; Analysis"
                  para obtener un CV personalizado y un análisis de compatibilidad con el puesto.
                </p>
              </div>
            </Card>
          )}

        {/* ── CV Section ─────────────────────────────────────── */}
        <div className="space-y-6">
          {cvResult !== null && (
            <h2 className="text-h2 text-text-primary">Curriculum Vitae</h2>
          )}

          {cvMutation.isPending && <ResultSkeleton label="CV" />}

          {cvError && (
            <ErrorCard
              title="502 – CV Generation Failed"
              message={cvError.message ?? "AI response validation failed. Please try again."}
              onRetry={() => {
                setCVError(null);
                handleGenerate();
              }}
            />
          )}

          {cvResult && (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  data-testid="cv-export-md"
                  onClick={handleExportMarkdown}
                >
                  Download .md
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  data-testid="cv-export-html"
                  onClick={handleExportHtml}
                >
                  Download .html
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  data-testid="cv-export-pdf"
                  onClick={handleExportPdf}
                >
                  Download .pdf
                </Button>
              </div>

              <div data-testid="cv-preview">
                <CVPreview data={cvResult} />
              </div>
            </div>
          )}
        </div>

        {/* ── Analysis Section ────────────────────────────────── */}
        <div className="space-y-6">
          {analysisIsSuccess && (
            <h2 className="text-h2 text-text-primary">Análisis de Compatibilidad</h2>
          )}

          {analysisIsPending && <ResultSkeleton label="Analysis" />}

          {analysisIsError && (
            <ErrorCard
              title="Analysis Failed"
              message={analysisError?.message ?? "No se pudo completar el análisis."}
            />
          )}

          {analysisIsSuccess && analysisResult && (
            <AnalysisResultView result={analysisResult} />
          )}
        </div>
      </div>
    </FeaturePageShell>
  );
}
