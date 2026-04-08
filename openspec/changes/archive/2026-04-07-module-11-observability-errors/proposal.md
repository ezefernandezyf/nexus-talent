# Proposal: Module 11 - Observability & Errors

## 1. Intent & Scope

**Driver:** The application "Nexus Talent" needs a robust observability strategy and a consistent, user-friendly error-handling system. Currently, errors originating from the AI backend, Supabase (auth/DB), and other integrations are not centrally tracked, and UI error states are potentially inconsistent or confusing, which violates the "Precision Instrument" quality goal.

**In-Scope:**
*   **Centralized Logging Wrapper:** Introduce a lightweight logger (e.g., `src/lib/logger.ts`) to standardize application logs, replacing raw `console.log` / `console.error` calls and preparing the application for future external telemetry integration (like Sentry or Datadog).
*   **Global Error Boundaries:** Implement a React Error Boundary (`src/components/ErrorBoundary.tsx`) to catch unhandled rendering exceptions gracefully and present a friendly fallback UI rather than a white screen.
*   **Friendly Error Mapping:** Centralize domain error formatting into actionable, user-friendly error messages (e.g., distinguishing between rate-limits, auth failures, and external API timeouts).
*   **Global Toast/Notification System:** Integrate a standard toast notification system (e.g., `sonner` or `react-hot-toast`) ensuring every async process failure or success (outside localized component feedback) can be surfaced visually.

**Out-of-Scope:**
*   Full integration of paid third-party tools like Sentry or Datadog in this phase. The architecture will simply be ready for it.
*   Rewriting the entire AI logic or backend APIs; this applies purely to handling the errors they emit.

## 2. Explored Alternatives

1.  **Direct Integration with Sentry/Datadog:**
    *   *Pros:* Immediate robust tracking and alerting.
    *   *Cons:* Over-engineering for a phase where we just need standard logging and consistent UI feedback. Adds external dependencies prematurely.
    *   *Verdict:* Rejected. A wrapper approach leaves the door open without forcing the commitment now.

2.  **Ad-hoc `console` error printing & minimal string responses:**
    *   *Pros:* Easiest to implement.
    *   *Cons:* Scatters logic, fails to provide actionable feedback, cannot be globally caught, and makes auditing or telemetry impossible.
    *   *Verdict:* Rejected. Conflicts with the "Precision Instrument" architectural requirement.

3.  **Central Logger + React Error Boundaries + Unified Toasts (Recommended):**
    *   *Pros:* Decouples logging strategy from implementation; catches fatal UI crashes gracefully; standardizes user feedback.
    *   *Cons:* Requires minor updates to existing hooks and API clients to use the new logger and mapping layer.
    *   *Verdict:* Selected. Balances current needs with future scalability.

## 3. Architecture & Approach

**A. Core Components:**
*   `lib/logger.ts`: A custom logger exporting `log`, `info`, `warn`, `error`, `debug`. It can be disabled via environment variables in production (except for errors) or attach to an external sink later.
*   `components/ErrorBoundary.tsx`: Implements React's `componentDidCatch` to prevent entire app crashes. Wraps the main `App.tsx` routes.
*   `lib/errors/error-mapper.ts`: Takes instances of `AIError`, `SupabaseError`, `ZodError` and transforms them into friendly UI strings (`UserFriendlyError`).

**B. UI Implementation:**
*   Add a standard toast library.
*   Design a fallback UI for the `ErrorBoundary` following the "Deep Space" visual guidelines (no solid borders, proper elevation).

**C. Integration:**
*   Update `ai-client.ts` to log errors via the new standard logger.
*   Update TanStack Query global configuration (`QueryClient` in `query-client.ts`) to leverage the `error-mapper.ts` for consistent generic error toasts on mutations or failed queries.

## 4. Risks & Dependencies

*   **Risk:** Overriding existing error handling might unintentionally mask underlying bugs if the logger swallows exceptions instead of throwing them.
    *   *Mitigation:* Ensure `logger.error` simply formats and logs, but does not prevent the exception from propagating unless explicitly intended.
*   **Dependency:** This module builds on the UI components (Module 06) and validations (Module 04). Any toast or error boundaries must adhere strictly to the visual rules in `DESIGN.md`.