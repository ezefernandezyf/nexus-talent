# Design: Module 11 - Observability & Errors

## Technical Approach
Introduce a minimal, extensible observability layer: a centralized `logger` (no-op/configurable sinks), an `error-mapper` to convert technical errors to `UserFriendlyError`, a global `ErrorBoundary` for render-time faults, and a single toast surface for async feedback. Keep integration points thin so future sinks (Sentry/Datadog) can be attached.

## Architecture Decisions
1. Logger wrapper vs direct Sentry: choose a lightweight wrapper (`src/lib/logger.ts`) now. Alternatives: direct Sentry integration (rejected - premature) or leaving `console` (rejected - unstructured). Rationale: minimal footprint, future-proofing.
2. Central Error Mapper vs localized messages: choose central `src/lib/errors/error-mapper.ts`. Alternatives: per-component mapping (more work, inconsistent) or backend-driven friendly messages (dependent on backend changes). Rationale: single source of truth and easier test coverage.
3. App-level ErrorBoundary vs page-level only: choose global `ErrorBoundary` wrapped at app root plus optional scoped boundaries. Alternatives: only scoped boundaries (missed crashes) or no boundary (white screens). Rationale: best UX and recoverability while allowing scoped granularity.

## Data Flow
ASCII diagram (simplified):

  UI Component
     │
     ├─ async → QueryClient / ai-client → throws Error
     │                    │
     │                    └─> logger.error(...) → local sink (console) [+ optional remote]
     │
     ├─ sync render-time exception → ErrorBoundary.catch → logger.error → Fallback UI
     │
     └─ on error → error-mapper(error) → UserFriendlyError → toast.show({type:'error', message})

## File Changes
- `src/lib/logger.ts` - Create: lightweight API (`log/info/warn/error/debug`) with env gating and pluggable sink.
- `src/lib/errors/error-mapper.ts` - Create: map `AIError|SupabaseError|ZodError|Error` → `UserFriendlyError`.
- `src/components/ErrorBoundary.tsx` - Create: React boundary with `onRetry` and `onReport` hooks.
- `src/hooks/useToast.ts` - Create/standardize toast API (wrapper around chosen toast lib).
- `src/query-client.ts` - Modify: global `QueryClient` defaults to call `error-mapper` + toast on failures.
- `src/lib/ai-client.ts` - Modify: ensure errors pass through `error-mapper` and `logger`.

## Interfaces / Contracts
- Logger API (`src/lib/logger.ts`):
  - `info(msg: string, meta?: Record<string,unknown>): void`
  - `warn(msg: string, meta?: Record<string,unknown>): void`
  - `error(err: Error | string, meta?: Record<string,unknown>): void`
  - `debug(msg: string, meta?: Record<string,unknown>): void`

- ErrorMapper types (`src/lib/errors/error-mapper.ts`):
  - `type UserFriendlyError = { title?: string; message: string; code?: string; recoverable?: boolean }`
  - `function mapError(e: unknown): UserFriendlyError`

- ErrorBoundary props (`src/components/ErrorBoundary.tsx`):
  - `fallback?: React.ReactNode`
  - `onReport?: (err: Error, info: React.ErrorInfo) => void`
  - `onRetry?: () => void`

- Toast hook signatures (`src/hooks/useToast.ts`):
  - `showToast(opts: { type: 'error'|'success'|'info'; message: string; duration?: number }): void`
  - `clearToasts(): void`

## Testing Strategy
- Unit: logger behavior (env gating), `mapError` mapping cases (AI 429, ZodError, Supabase errors). Mock sinks.
- Integration: wrap a small component in `ErrorBoundary` and assert fallback UI + `logger.error` call.
- E2E / QA: simulate common failures (AI rate limit, failed mutation) and verify toast messages and no white screens.

## Migration / Rollout
- Phase 1 (feature-flagged): Add logger and mapper; instrument non-critical modules (`ai-client`, `query-client`) behind a feature flag.
- Phase 2: Expand instrumentation across all clients; replace ad-hoc `console` uses incrementally.
- Rollback: disable feature flag; logger is no-op if disabled.

## Open Questions
- Which toast library is preferred (sonner vs react-hot-toast)? Implementation uses a thin adapter to switch easily.
- Confirm production telemetry plan (Sentry/Datadog) and data retention/PII policies.
- Are there existing global styles/components to reuse for the fallback UI to strictly follow `DESIGN.md` tokens?

--
Design produced for Module 11. Follow-up: run `sdd-tasks` to produce implementation tasks and tests.
