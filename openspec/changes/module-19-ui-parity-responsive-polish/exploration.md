# Exploration: Module 19 - UI Parity and Responsive Polish

### Current State
The active app already follows the dark, deep-space design system, but the remaining gap is polish: shared feature pages rely on the same shell wrapper, yet their spacing, action groups, and empty/loading states are not uniformly tuned across mobile and desktop. The strongest candidates are `FeaturePageShell`, `PageHeader`, `AnalysisFeature`, `HistoryFeature`, `SettingsFeature`, and the shared empty/loading/card components.

### Affected Areas
- `src/components/ui/FeaturePageShell.tsx` — shared page spacing and content width.
- `src/components/ui/PageHeader.tsx` — title/action stacking on narrow viewports.
- `src/components/ui/EmptyState.tsx` — shared empty-state rhythm and CTA sizing.
- `src/features/analysis/components/JobDescriptionForm.tsx` — input stack and submit row on mobile.
- `src/features/analysis/components/AnalysisResultView.tsx` — multi-action toolbar and chip wrapping.
- `src/features/history/components/HistoryList.tsx` / `HistoryCard.tsx` — list density and mobile row behavior.
- `src/features/settings/SettingsFeature.tsx` / `SettingsForm.tsx` — section spacing, cards, and danger-zone layout.

### Approaches
1. **Shared-wrapper polish** — tune `FeaturePageShell`, `PageHeader`, `EmptyState`, and the common form/card primitives first.
   - Pros: fixes the majority of spacing issues at once, keeps pages consistent.
   - Cons: some pages may still need small follow-up tweaks.
   - Effort: Medium.

2. **Screen-by-screen adjustments** — patch each page independently (analysis, history, settings) based on the reference assets.
   - Pros: more precise per-screen alignment.
   - Cons: more duplication, easier to miss shared issues.
   - Effort: Medium/High.

### Recommendation
Start with shared-wrapper polish and then apply a few page-specific fixes where the reference diverges most. That gives the best ratio of consistency to effort and keeps the module strictly visual.

### Risks
- Scope drift into new layout features or navigation changes.
- Over-tuning one page while regressing another because the same shared wrapper feeds multiple screens.

### Ready for Proposal
Yes — the next step should formalize a compact UI-parity delta focused on responsive spacing, action wrapping, and state surfaces.