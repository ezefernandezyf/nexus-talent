# Design: 01 Job Analysis

## Technical Approach
Build the first feature as an isolated `features/analysis` module that owns the form, the request orchestration, and the result rendering. The module will validate user input before calling the AI client, then validate the AI payload before rendering it. This maps directly to the proposal and the project rule that external data MUST be guarded by Zod before it reaches the UI.

## Architecture Decisions

| Decision | Choice | Alternatives considered | Rationale |
|---|---|---|---|
| Feature boundary | Put all user-facing analysis logic inside `src/features/analysis/` | Scatter logic across shared UI and pages | Keeps the first module cohesive and aligned with feature-based domain isolation. |
| Data orchestration | Use TanStack Query mutation for the analysis request | Local component state or custom async hooks only | Query mutation gives explicit loading/error states and is consistent with the chosen stack. |
| Contract validation | Validate input and AI output with Zod schemas | Trust the AI response shape | The AI can hallucinate or drift, so validation must fail fast and safely. |
| UI language | Apply the Precision Instrument design system from `DESIGN.md` | Generic card-and-form SaaS layout | The product needs a distinctive, editorial interface, not a generic template. |
| Outreach editing | Allow editing the generated outreach message before copy | Copy the message as-is from the AI | The user needs to tailor the final text without regenerating the whole analysis. |

## Data Flow

`JobDescriptionForm` -> input validation -> `ai-client` request -> raw AI response -> Zod parse -> mapped analysis result -> `AnalysisResultView`

If validation fails at any point, the flow stops and the module renders a controlled error state instead of propagating malformed data.

## File Changes

| File | Action | Description |
|---|---|---|
| `src/features/analysis/` | Create | Feature boundary for the first module. |
| `src/features/analysis/components/JobDescriptionForm.tsx` | Create | Input surface for job description submission. |
| `src/features/analysis/components/AnalysisResultView.tsx` | Create | Renders summary, skills matrix, and editable outreach message. |
| `src/features/analysis/hooks/useJobAnalysis.ts` | Create | Encapsulates the mutation and state transitions. |
| `src/schemas/job-analysis.ts` | Create | Zod schemas for input and AI response validation. |
| `src/lib/ai-client.ts` | Modify | Add or adapt the job analysis request entrypoint if needed. |

## Interfaces / Contracts

```ts
export type JobAnalysisResult = {
  summary: string;
  skills: Array<{ name: string; level: string }>;
  outreachMessage: string;
};
```

The feature MUST reject malformed AI payloads before they reach rendering. The result view SHOULD remain presentational and receive only validated data.
The outreach message view SHOULD expose an edit state and a copy action that uses the edited content when present.

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Unit | Zod schemas and mapping logic | Validate success and failure payloads with representative fixtures. |
| Integration | Request orchestration, message editing, and state transitions | Verify loading, success, error, and edit-before-copy paths for the analysis flow. |
| E2E | User can submit a JD, edit outreach, and see results | Simulate a complete happy path and a malformed-response failure. |

## Migration / Rollout
No migration required. This is a new feature module and can be introduced behind the existing application shell.

## Open Questions
- [x] Exact shape of the skills matrix: grouped by category (hard skills / soft skills) with chip-style tags and optional confidence or match level.

## Quality Targets
- Critical logic SHOULD be structured so the module can reach at least 90% coverage.
- Core screens SHOULD be optimized to target 95+ Lighthouse scores.

## Deferred Integration Scope
- The exact AI provider and Supabase schema are intentionally deferred until `sdd-apply` for the first implementation slice.
- The task breakdown SHOULD assume a swappable AI adapter and a thin persistence boundary, not a hardcoded provider lock-in.
