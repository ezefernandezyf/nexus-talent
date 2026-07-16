# Tasks: Phase 3 — CV + Analysis Unificado

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~2000 (additions + deletions) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (Foundation) → PR 2 (Unified Page) → PR 3 (Route Cleanup) |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Font loading + CVPreview Lapis restyle | PR 1 | base = `develop`. Standalone visual change, no new routes. |
| 2 | UnifiedPage + parallel API + empty filter | PR 2 | base = `develop`. New page + export changes, no routing yet. |
| 3 | Route cleanup + nav + delete dead pages | PR 3 | base = `develop`. Routes point to UnifiedPage, remove old pages. |

## Phase 1: Foundation

- [ ] 1.1 Add `<link>` tags in `web/index.html` for SourceHanSerifCN, SourceHanSansCN, JetBrainsMono from jsdelivr CDN
- [ ] 1.2 Rewrite `CVPreview.tsx` with Lapis CV styling: A4-like container (`max-w-[210mm]`, `shadow-lg`, `p-[20mm]`), SourceHanSerifCN h1/h2, SourceHanSansCN body, JetBrainsMono links, `h2` bottom border, centered name, contact blockquote
- [ ] 1.3 Update `CVPreview.test.tsx` for new Lapis layout assertions

## Phase 2: Core Implementation

- [x] 2.1 Create `UnifiedPage.tsx` — vertical stack: config panel (JD ≥30 chars, tone, SectionOrderEditor, AdHocItemForm) → GENERATE → results
- [x] 2.2 Implement parallel API orchestration: `useCVGenerate.mutateAsync()` + `useJobAnalysis().submitAnalysis()` — fire both, observe per-API states reactively. NOT Promise.allSettled (design decisions: one is promise-based, the other is reactive fire-and-forget with ref-synced callbacks)
- [x] 2.3 Filter empty CV sections (empty/null/whitespace body) in UnifiedPage before passing to CVPreview and exports

## Phase 3: Integration

- [ ] 3.1 Modify `AnalysisFeature.tsx` — accept `jd`, `tone`, `githubUrl` as props, hide own form when props provided
- [ ] 3.2 Update `export.tsx` with Lapis inline CSS in HTML export + empty-section-aware output
- [x] 3.3 Wire `export.tsx` changes in UnifiedPage (pass filtered sections to all export functions)

## Phase 4: Route Cleanup

- [ ] 4.1 Update `router.tsx` — UnifiedPage at `/app/cv`, remove `/app/cv/experience` + `/app/cv/education`, redirect `/app/analysis` → `/app/cv`, `/app/index` → `/app/cv`
- [ ] 4.2 Update `AppLayout.tsx` — single "CV" nav link, change "Nuevo análisis" CTA to `/app/cv`
- [ ] 4.3 Delete `CVPage.tsx`, `AnalysisPage.tsx`, `ExperienceManagerPage.tsx`, `EducationManagerPage.tsx` and their test files

## Phase 5: Testing & Verification

- [ ] 5.1 Unit test: UnifiedPage state transitions (mock hooks, assert per-API loading/error/success renders)
- [ ] 5.2 Unit test: empty section filter (pure function — `sections.filter(s => s.body.trim())`)
- [ ] 5.3 Unit test: export with filtered sections + Lapis inline CSS
- [ ] 5.4 Unit test: router changes (assert UnifiedPage renders, redirect from `/app/analysis`)
- [ ] 5.5 `pnpm test && tsc --noEmit` passes
