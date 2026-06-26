# Architecture Frontend Specification

## Purpose
Defines the screaming architecture structure for `web/src/`. Every file MUST live in a folder named after its business domain. Catch-all directories (`lib/`, `pages/`) are eliminated.

## Requirements

### Requirement: Domain-Driven Directory Structure
The `web/src/` tree SHALL consist of `features/{domain}/`, `core/`, `shared/`, and entry points (`main.tsx`, `App.tsx`, `index.css`). Every file SHALL reside in a folder that screams its purpose.

| Directory | Content |
|-----------|---------|
| `features/auth/` | auth pages, components, API hooks, guards, store |
| `features/analysis/` | analysis pages, AI client, repos, validation, components |
| `features/history/` | history pages, components, mutations, validation |
| `features/landing/` | landing/Privacy pages, landing components |
| `features/settings/` | settings page, settings form, API hooks |
| `core/` | api-client, query-client, error-mapper, logger, toast, theme, router |
| `shared/utils/` | cn.ts, formatters, type helpers |
| `shared/components/` | Badge, Button, Card, Input, Modal, EmptyState, LoadingSkeleton |

#### Scenario: New developer adds feature
- GIVEN a new feature "onboarding"
- WHEN the developer creates files
- THEN all files MUST live under `features/onboarding/`
- AND no files go in `lib/`, `pages/`, or top-level `auth/`

### Requirement: Catch-All Directories Removed
`lib/`, `pages/`, `auth/`, and `components/` top-level directories MUST NOT exist after reorg.

| Removed | Files migrated to |
|---------|------------------|
| `lib/` (22 files) | `features/{domain}/api/`, `core/`, `shared/utils/` |
| `lib/supabase/` (3 files) | DELETED — legacy Supabase SDK |
| `pages/` (7 files) | `features/{domain}/pages/`, `shared/pages/` |
| `auth/` (1 file) | `features/auth/store/` + `features/auth/api/` |
| `components/landing/` (10 files) | DELETED — duplicate of `features/landing/components/` |
| `components/ui/` (15 files) | `shared/components/` |
| `components/ErrorBoundary.tsx` | `core/ErrorBoundary.tsx` |

#### Scenario: Build verifies no orphans
- GIVEN the reorg is complete
- WHEN `pnpm --filter @nexus-talent/web build` runs
- THEN zero imports reference `lib/`, `pages/`, `auth/`, or `components/landing/`

### Requirement: Path Aliases Configured
`vite.config.ts` and `tsconfig.json` MUST define `@/features/*`, `@/shared/*`, `@/core/*` aliases. All imports SHALL use aliases; relative `../../` patterns SHALL be replaced.

```jsonc
// tsconfig.json excerpt
{ "compilerOptions": { "paths": {
  "@/*": ["./web/src/*"],
  "@/features/*": ["./web/src/features/*"],
  "@/shared/*": ["./web/src/shared/*"],
  "@/core/*": ["./web/src/core/*"]
}}}
```

#### Scenario: Import uses alias
- GIVEN a component in `features/analysis/components/`
- WHEN it imports the API client
- THEN it uses `import { apiClient } from "@/core/api-client"`
- AND NOT relative `../../core/api-client`

### Requirement: Supabase and localStorage Removed
Zero `@supabase/supabase-js` imports SHALL exist in `web/src/`. Zero `localStorage` calls SHALL exist in repository modules. All data operations MUST use Axios HTTP API with `withCredentials: true`.

#### Scenario: Grep for legacy survivors
- GIVEN cleanup is complete
- WHEN `grep -r "supabase" web/src/` runs
- THEN zero matches are found
- WHEN `grep -r "localStorage" web/src/` runs
- THEN zero matches exist outside test utilities

### Requirement: Architecture Standard Documented
A reference document (`web/ARCHITECTURE.md`) SHALL describe: folder conventions per file type, path alias reference, and the screaming-architecture principle.

#### Scenario: New dev follows the standard
- GIVEN a developer reads `web/ARCHITECTURE.md`
- WHEN they add a page, component, hook, or utility
- THEN the doc SHALL specify the exact target folder
- AND include the alias import syntax
