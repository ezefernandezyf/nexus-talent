# Tasks: Module 19 - UI Parity and Responsive Polish

## Phase 1: Shared Shell Polish
- [x] 1.1 Tune `src/components/ui/FeaturePageShell.tsx` and `src/components/ui/PageHeader.tsx` for consistent responsive spacing and action wrapping.
- [x] 1.2 Adjust `src/components/ui/EmptyState.tsx` to keep CTA alignment and message rhythm consistent across breakpoints.

## Phase 2: Page-Level Polish
- [x] 2.1 Refine `src/features/analysis/components/JobDescriptionForm.tsx` and `src/features/analysis/components/AnalysisResultView.tsx` for mobile-friendly control stacking and toolbar wrapping.
- [x] 2.2 Refine `src/features/history/components/HistoryList.tsx` and `src/features/history/components/HistoryCard.tsx` for tighter row spacing and mobile readability.
- [x] 2.3 Refine `src/features/settings/SettingsFeature.tsx` and `src/features/settings/components/SettingsForm.tsx` for card spacing and narrow-screen flow.

## Phase 3: Regression Checks
- [x] 3.1 Re-run `src/pages/AnalysisPage.test.tsx` and `src/features/analysis/components/AnalysisResultView.test.tsx` after the layout updates.
- [x] 3.2 Re-run `src/pages/HistoryPage.test.tsx` and `src/pages/SettingsPage.test.tsx` to confirm the polished layouts still render.
- [x] 3.3 Re-run `src/layouts/AppLayout.test.tsx` and `src/pages/LandingPage.test.tsx` as shell regressions.