# Spec: Module 05 — History Repository & UI Shell

## Data Shape

Persisted entity: `StoredAnalysis`

```ts
type StoredAnalysis = {
  id: string; // uuid
  createdAt: string; // ISO timestamp
  jobDescription: string;
  result: JobAnalysisResult; // reuse existing type
}
```

## Repository Contract

Define `AnalysisRepository` with the following methods:

- `list(params?: { page?: number; pageSize?: number; }): Promise<{ items: StoredAnalysis[]; total: number }>`
- `getById(id: string): Promise<StoredAnalysis | null>`
- `save(analysis: Omit<StoredAnalysis, 'id'|'createdAt'> & { id?: string }): Promise<StoredAnalysis>`
- `delete(id: string): Promise<void>`

Implement a `LocalAnalysisRepository` that serializes an array of `StoredAnalysis` in `localStorage` under a single key (e.g., `nexus:analyses`). The implementation must:

- Ensure deterministic sorting by `createdAt` (newest first) when returning `list`.
- Keep operations synchronous where possible but return `Promise` for API compatibility.
- Provide basic error handling and surface errors via thrown exceptions.

## Hook API

`useHistory({ page?: number; pageSize?: number })` should return:

- `data: StoredAnalysis[] | undefined`
- `isLoading: boolean`
- `error: Error | null`
- `refresh(): Promise<void>`

The hook will use `AnalysisRepository` injected from a small factory or direct import (prefer DI pattern if project already uses it).

## UI Requirements

- `HistoryFeature` will call `useHistory` and render states: Loading (skeleton), Empty (empty state component), Error (toast or inline message), Populated (list of `HistoryCard`).
- Pagination controls: simple page indicator and next/prev; server-side pagination is not required — use the repository's `list` with `page` and `pageSize`.
- Accessibility: list items must be keyboard-focusable and have `aria-labelledby` linking to the title.

## Test Scenarios

1. Fetching history — returns items sorted newest-first.
2. Empty history — returns empty list and empty state is shown.
3. Save analysis — repository returns saved item with `id` and `createdAt`.
4. Delete analysis — item removed and list updates.
5. Hook exposes `isLoading` then `data`.
