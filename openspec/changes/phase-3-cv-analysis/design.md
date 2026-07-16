# Design: Phase 3 — CV + Analysis Unificado

## Technical Approach

Merge two separate pages into a single vertical workflow: **config panel → GENERATE → results**. CV and Analysis share the JD input and tone selector. Both API calls fire in parallel since they have zero data dependency. Each renders independently — one can fail while the other succeeds.

The core insight: `useCVGenerate` (mutation with `mutateAsync`) and `useJobAnalysis` (hook with internal state + `submitAnalysis`) are consumed directly from UnifiedPage — no intermediate wrapper components. `AnalysisResultView` renders analysis output as-is. `CVPreview` is restyled to Lapis CV aesthetic.

## Architecture Decisions

| Decision | Choice | Rejected | Why |
|----------|--------|----------|-----|
| Analysis hook consumption | Call `useJobAnalysis()` directly in UnifiedPage, render `AnalysisResultView` | Wrap `AnalysisFeature` with a `hideForm` prop | Avoids prop-drilling a boolean flag through a component designed for standalone use. `useJobAnalysis` already exposes all state reactively — let the page orchestrate. |
| Parallel coordination | Fire both, observe states reactively. CV uses `mutateAsync` (promise), analysis uses `submitAnalysis` (reactive state via hook) | `Promise.all` with both `mutateAsync` | `useJobAnalysis` uses internal `viewState` synced via `activeSubmissionKeyRef`. Calling `mutateAsync` directly bypasses this — the hook's `onSuccess` callback would return early because the ref wasn't set. `submitAnalysis` sets the ref before firing. We observe `analysis.status` reactively. |
| Font loading | `<link>` tags in `index.html` from jsdelivr CDN | npm packages or `@import` in CSS | CDN loads in parallel with the bundle, non-blocking. Fonts are SIL OFL — no licensing risk. Fallback: `font-family: 'SourceHanSerifCN', serif`. |
| Lapis CSS approach | Tailwind arbitrary values + inline `<style>` for font-face | Full CSS module or styled-components | The project uses Tailwind. Arbitrary values (`text-[9.5pt]`, `p-[20mm]`) are Tailwind 4's escape hatch for design tokens outside the theme — exactly our use case. Inline `<style>` inside the CV preview component handles `@font-face` declarations scoped to the preview. |
| Empty section filtering | Filter in `UnifiedPage` after API response, before passing to preview/export | Filter inside `CVPreview` | Separation of concerns: the page owns data transformation. The preview renders what it receives. Export functions also get pre-filtered arrays. |
| Analysis auth | Inherits from `/app` route group | Separate `ProtectedRoute` wrapper | `/app/cv` is already wrapped in `<ProtectedRoute>`. Analysis renders as a child — no additional guard needed. Old `/app/analysis` redirects to `/app/cv`. |

## Component Tree & Data Flow

```
UnifiedPage (state owner)
├── Config Panel
│   ├── JD textarea (shared, ≥30 chars validation)
│   ├── Tone selector (shared — one selector for both APIs)
│   ├── GitHub URL input (moved from AnalysisPage — optional enrichment)
│   ├── SectionOrderEditor (reused as-is)
│   └── AdHocItemForm (reused as-is)
├── GENERATE button
│   │
│   ├── cvHook.mutateAsync({ sectionOrder, adHocItems, jd, tone })
│   └── analysisHook.submitAnalysis({ jobDescription: jd, messageTone: tone })
│
├── CV Results (renders when cvHook.isSuccess || cvHook.isError)
│   ├── Export buttons (MD/HTML/PDF — HTML gets Lapis inline CSS)
│   └── CVPreview (restyled Lapis CV, filtered sections)
│
└── Analysis Results (renders when analysisHook.isSuccess || analysisHook.isError)
    └── AnalysisResultView (reused as-is)
```

**State machine**: `idle` → (click GENERATE) → `loading` (both skeletons) → per-section resolves to `success` or `error` independently. Re-generation clears previous results, shows skeletons, then new results.

**Scroll behavior**: results ref → `scrollIntoView({ behavior: "smooth" })` triggered on first data arrival (either CV or analysis).

## Lapis CV Typography Mapping

| CSS property | Tailwind value | Applies to |
|---|---|---|
| `font-size: 14pt` | `text-[14pt]` | h1 (name) |
| `font-size: 10.5pt` | `text-[10.5pt]` | h2 (section headings) |
| `font-size: 9.5pt` | `text-[9.5pt]` | Body text |
| `font-size: 9pt` | `text-[9pt]` | Links / monospace |
| `line-height: 1.55` | `leading-[1.55]` | All text |
| `padding: 20mm` | `p-[20mm]` | Preview container |
| `border-bottom: 1px solid` | `border-b` | h2 separator |
| `font-family` | Inline `style` | `@font-face` declarations |

Container: white background, `shadow-lg`, `max-w-[210mm]` (A4 width), centered.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `web/src/features/cv/pages/UnifiedPage.tsx` | Create | New unified page — state owner, parallel API coordinator, scroll behavior |
| `web/src/features/cv/pages/CVPage.tsx` | Delete | Merged into UnifiedPage |
| `web/src/features/cv/pages/ExperienceManagerPage.tsx` | Delete | Dead code — Settings handles CRUD |
| `web/src/features/cv/pages/EducationManagerPage.tsx` | Delete | Dead code — Settings handles CRUD |
| `web/src/features/analysis/pages/AnalysisPage.tsx` | Delete | Replaced by redirect to `/app/cv` |
| `web/src/features/cv/components/CVPreview.tsx` | Modify | Lapis CV restyle (typography, A4 layout, shadow). Accept `sections` pre-filtered. |
| `web/src/features/cv/utils/export.tsx` | Modify | HTML export gets Lapis inline CSS. All exports filter empty sections. |
| `web/src/core/router.tsx` | Modify | Replace CV + Analysis routes with single unified route. Redirect `/app/analysis` → `/app/cv`. Remove CV sub-routes. |
| `web/src/shared/layouts/AppLayout.tsx` | Modify | Single "CV" nav link (remove separate "Análisis" entry). Change "Nuevo análisis" CTA to link to `/app/cv`. |
| `web/index.html` | Modify | Add `<link>` tags for SourceHanSerifCN, SourceHanSansCN, JetBrainsMono from jsdelivr |

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | UnifiedPage state transitions | Vitest + React Testing Library — mock hooks, assert per-API loading/error/success renders |
| Unit | CVPreview Lapis styling | Vitest — assert font classes and structural elements |
| Unit | Empty section filter | Pure function test — `sections.filter(s => s.body.trim())` |
| Unit | Export with filtered sections + Lapis CSS | Vitest — assert HTML output contains `<style>` block with correct font-family |
| Unit | Router changes | Vitest — assert route renders UnifiedPage, redirect from `/app/analysis` |
| E2E | Full generate flow | Playwright — paste JD, click GENERATE, assert CV preview + Analysis panels render vertically, assert export buttons work |

## Open Questions

- [ ] Should the GitHub URL input be in the config panel or a separate card? (Current AnalysisPage has it in its own form — moving to shared config makes sense but may need design review.)
- [ ] Does `index.html` `<link>` approach work with the Vite dev server's CSP configuration?
