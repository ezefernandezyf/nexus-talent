# Spec: Module 06 — UI/UX Feature Shells (Analysis & History)

## Component Contracts

- `Hero` — props: `{ title: string; subtitle?: string; ctas?: { label: string; href: string }[] }`.
- `AnalysisCard` — props: `{ analysis: SavedJobAnalysis; onOpen?: (id:string)=>void }`.
- `HistoryList` — props: `{ items: SavedJobAnalysis[]; onDelete?: (id:string)=>void }`.
- `EmptyState` — props: `{ title: string; description?: string; cta?: { label: string; href: string } }`.
- `LoadingSkeleton` — presentational skeleton matching the design token sizes for hero and list items.

## Accessibility Requirements

- All interactive elements keyboard-focusable.
- Provide `aria-labelledby` for list items and `role="list"`/`role="listitem"` where appropriate.

## Tests

- Snapshot tests for `Hero`, `AnalysisCard`, `HistoryList`.
- Accessibility checks for focus order and labels in rendered pages.
