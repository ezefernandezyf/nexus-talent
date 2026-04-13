## Exploration: Module 06 — UI/UX Feature Shells (Analysis & History)

### Current State

- The codebase already contains feature-specific presentational components for the two features in scope:
  - `src/components/landing/HeroSection.tsx` and `src/features/landing/components/Hero.tsx` (landing hero blocks)
  - `src/features/history/components/HistoryCard.tsx`, `HistoryEmptyState.tsx`, `HistoryLoadingState.tsx`
  - `src/features/analysis/components/AnalysisResultView.tsx`, `JobDescriptionForm.tsx` (analysis UI pieces)
- The data layer and hooks are separated (e.g., `useJobAnalysis`, `useAnalysisHistory`, `createLocalAnalysisRepository`).
- There is no `docs/assets/` folder checked into the repo (no source HTML/CSS assets found in workspace), so pixel-exact extraction from source assets is not possible here — we will rely on `DESIGN.md` and existing component markup as reference.

### Affected Areas

- `src/features/history/*` — history cards, loading and empty states, feature shell.
- `src/features/analysis/*` — analysis result view, job description form, feature page.
- `src/components/landing/*` & `src/features/landing/*` — hero and marketing blocks to standardize.
- `src/components/ui/` — target location for extracted shared presentational components (to create).
- Tests: `src/features/*/*.test.tsx` — snapshot/accessibility tests will be added/updated.

### Approaches

1. **Extract Shared UI Library (Recommended)**
   - Move presentational blocks into `src/components/ui/` (e.g., `Hero`, `Card`, `List`, `EmptyState`, `Skeleton`).
   - Keep feature-specific variants under `src/features/*/components/` that compose the shared primitives.
   - Add prop-driven contracts and TypeScript types matching `SavedJobAnalysis` / `JobAnalysisResult`.
   - Pros: Encourages reuse, enforces visual consistency, lowers future maintenance cost.
   - Cons: Small upfront work to refactor existing files; requires updating imports and tests.
   - Effort: Medium

2. **Feature-scoped Componentization**
   - Extract components only inside each feature (no top-level `ui` folder).
   - Pros: Faster, lower blast radius.
   - Cons: More duplication; harder to keep pixel parity across pages.
   - Effort: Low

3. **Design-System-First Rewrite (Not recommended now)**
   - Create or adopt a strict design-system token layer and refactor all components to use it.
   - Pros: Highest long-term consistency and scale.
   - Cons: High effort, out-of-scope for this module.
   - Effort: High

### Recommendation

- Follow Approach 1 (Extract Shared UI Library). Concrete next steps:
  1. Create `Hero`, `Card`, `List`, `EmptyState`, `LoadingSkeleton` under `src/components/ui/` with the prop contracts in `spec.md`.
  2. Replace presentational markup in `src/features/analysis` and `src/features/history` to compose those primitives (no logic in presentational components).
  3. Add snapshot tests for the primitives and integration tests for pages.
  4. Because `docs/assets/` is not present, request the design assets or use `DESIGN.md` plus current pages as reference for visual polish tasks.

### Risks

- Missing reference assets (`docs/assets/`) mean visual parity may need iterative adjustments once assets are supplied.
- Refactor touches many files — keep changes small and use feature branches per component to reduce risk.
- Snapshot tests can be brittle; prefer focused snapshot regions (Hero, Card) rather than full-page snapshots.

### Ready for Proposal

Yes — enough information to proceed with `sdd-propose` and `sdd-spec`. Next action: implement `src/components/ui/*` primitives and update pages to compose them.
