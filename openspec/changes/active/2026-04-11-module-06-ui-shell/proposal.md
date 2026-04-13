# Proposal: 2026-04-11 — Module 06 — UI/UX Feature Shells (Analysis & History)

## Summary

This change completes the UI/UX feature shells for `Analysis` and `History` features: componentization of blocks, content refactor to props/data, and page assembly. The goal is pixel-faithful React components matching `docs/assets/` while keeping logic separated into hooks and services (no business logic in presentational components).

## Goals

- Extract reusable presentational components from existing page HTML (hero, cards, lists, skeletons).
- Ensure components are fully prop-driven and accept typed data models (use `JobAnalysisResult`/`SavedJobAnalysis`).
- Assemble feature pages (`AnalysisPage`, `HistoryPage`) using the new components and existing hooks (`useJobAnalysis`, `useAnalysisHistory`).
- Add tests verifying components render correctly with supplied props and that pages integrate hooks (shallow integration tests).

## Scope

- Component extraction under `src/components/*` and `src/features/*/components/*`.
- No changes to data-layer hooks or repository behavior (reuse existing implementations).

## Acceptance Criteria

- Reusable components created for Hero, Card, List, EmptyState, LoadingSkeleton and exported for reuse.
- Pages use components and pass only data/handlers via props (no direct data fetching in presentational components).
- Visual parity checks: basic snapshot tests for critical components.

## Risks

- UI parity may require iterative tweaks; create small PRs and run visual regression later.

## Owner

Implementer: @you
