# UX States Specification

## Purpose
Standardize user experience states across all feature pages: error boundaries, loading skeletons, empty states, and error states. Every async process must have Loading, Success, Error, and Empty states using the Apex design system.

## Requirements

### Requirement: ErrorBoundary Fallback UI with Retry
The ErrorBoundary MUST render fallback UI with error message and retry button. MUST NOT return null or redirect silently.

#### Scenario: Component throws during render
- GIVEN a component throws an error during rendering
- WHEN the ErrorBoundary catches the error
- THEN a fallback UI with error message and Retry button renders
- AND the user can click Retry to attempt recovery

### Requirement: Route-Level errorElement
The routes `/app/analysis`, `/app/history`, `/app/history/:id`, `/app/settings` SHALL each have a route-level `errorElement` that catches rendering errors while keeping the AppLayout shell intact.

#### Scenario: Feature page crashes
- GIVEN the user is on an app feature page
- WHEN that page's route crashes during render
- THEN only the route content area is replaced with the error fallback
- AND the AppLayout shell (header, sidebar, footer) remains visible

### Requirement: Page-Specific Loading Skeletons
Four page-specific Skeletons SHALL exist, each matching its page's layout structure. Apex Skeleton primitives ONLY — no inline text placeholders. No old LoadingSkeleton references.

#### Scenario: Page data is loading
- GIVEN a feature page is loading its data
- WHEN the loading state renders
- THEN a skeleton matching the page layout is displayed
- AND no inline text ("Loading...", "Cargando...") appears in the skeleton

### Requirement: EmptyState Variants with CTAs
Three EmptyState variants SHALL exist: (a) "No analysis yet" with CTA to start an analysis, (b) "No history found", (c) "No results for search/filter".

#### Scenario: User has no analyses
- GIVEN the user has not created any analyses
- WHEN the Analysis page renders
- THEN an EmptyState with "No analysis yet" message and a CTA button renders

#### Scenario: History is empty
- GIVEN the user has no analysis history
- WHEN the History page renders
- THEN an EmptyState with "No history found" message renders

#### Scenario: Search yields no results
- GIVEN the user has filtered history with no matches
- WHEN the search results render
- THEN an EmptyState with "No results for search/filter" message renders
