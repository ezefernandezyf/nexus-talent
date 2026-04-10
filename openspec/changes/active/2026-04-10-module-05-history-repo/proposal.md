# Proposal: 2026-04-10 — Module 05 — History Repository & UI Shell

## Summary

Implement a small, well-scoped feature that provides a stable, testable repository for persisted analyses and a minimal History UI shell that consumes it. This change enables the History feature to be backed by a local-first repository (localStorage) and prepares a clean migration path to Supabase in a later change.

## Goals

- Provide a typed repository contract (`AnalysisRepository`) with basic CRUD: `list`, `save`, `delete`, `getById`.
- Implement `LocalAnalysisRepository` using `localStorage` and mirror the shape described in existing designs (`JobAnalysisResult` + `id` + `createdAt` + `jobDescription`).
- Add `useHistory` hook to expose paginated, sorted history to the UI.
- Wire the hook into the existing `HistoryFeature` shell so the UI reads from the repository instead of test fixtures.
- Add unit tests for repository, hook and a small integration test for the UI shell.

## Scope

- Files to add/modify: `src/lib/repositories/*`, `src/features/history/hooks/useHistory.ts`, `src/features/history/HistoryFeature.tsx` (small wiring), tests under `src/**/__tests__`.
- Does NOT include Supabase migration or auth-bound persistence — that will be a separate change.

## Acceptance Criteria

- `LocalAnalysisRepository` implements the repository contract and passes unit tests (CRUD + ordering).
- `useHistory` returns sorted results (newest first), exposes `isLoading`, `error`, `refresh`, and supports simple pagination params.
- `HistoryFeature` uses `useHistory` to render the list, showing loading/empty/error states (matches `openspec/specs/history/spec.md`).
- Tests pass locally (unit tests for repository and hook; one integration test for the UI shell).

## Risks

- Changing the persisted shape could require migration later; we intentionally keep the shape minimal and compatible with existing local-storage usage.
- Duplication with `analysis` hooks — we'll reuse `JobAnalysisResult` types where possible.

## Owner

Implementer: @you
