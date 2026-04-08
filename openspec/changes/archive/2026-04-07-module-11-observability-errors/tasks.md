# Tasks: module-11-observability-errors

## Phase 1: Foundation
1.1 Create `src/lib/logger.ts` — typed logger with levels (error,warn,info,debug) and `initLogger(config)` entry.
1.2 Add config schema `src/lib/logger.ts` export for env-driven toggles (console vs telemetry endpoint).
1.3 Create `src/lib/error-mapper.ts` — pure mapper: Error -> {code, category, message, meta}.

## Phase 2: Core Implementation
2.1 Implement `src/components/ErrorBoundary.tsx` — captureError, componentDidCatch, call `logger.error` and `errorMapper` then rethrow or show fallback.
2.2 Implement `src/hooks/useToasts.ts` — expose `showErrorToast(error|string)` and unit-testable side effects.
2.3 Update `src/lib/query-client.ts` — add global onError handler to call `errorMapper` + `logger` + `useToasts` integration point.
2.4 Add telemetry sender helper in `src/lib/logger.ts` (`sendTelemetry(payload)`) with configurable retry strategy.

## Phase 3: Integration/Wiring
3.1 Wrap feature roots in `src/features/*/index.tsx` with `ErrorBoundary` (start with `features/analysis`).
3.2 Wire `useToasts` provider at app root (`App.tsx`) and document hook usage in `src/features/*` components.
3.3 Ensure `ai-client`/`github-client` errors bubble to `query-client` handlers (modify client catch to rethrow typed Error).

## Phase 4: Testing
4.1 Unit: `logger` — test level filtering and `sendTelemetry` call on `logger.error` (mock endpoint).
4.2 Unit: `error-mapper` — spec scenarios: "Network outage", "Validation error", "Unhandled exception" from openspec specs; assert mapped `category` and `code`.
4.3 Component integration: render a child that throws inside `ErrorBoundary` → assert `logger.error` called and `useToasts.showErrorToast` called.
4.4 Integration: simulate query-client API 500 (spec scenario "API failure") → assert toast shown, logger telemetry contains request id.

## Phase 5: Cleanup
5.1 Replace remaining `console.*` usages with `logger` across `src/features/*` (search & replace commit).
5.2 Add `docs/observability.md` summarizing logger contract, error mapping table, and test scenarios.
5.3 Create a short PR template checklist referencing these tasks and tests.

---

Notes: tests should reference spec scenarios in `openspec/changes/module-11-observability-errors/specs/`.
