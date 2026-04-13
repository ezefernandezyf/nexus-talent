# Design: Module 08 - GitHub Stack Detection Completion

## Technical Approach

The implementation stays inside the existing analysis flow. `JobDescriptionForm` gains one optional GitHub URL field, and its submit handler forwards the trimmed value alongside `jobDescription` and `messageTone`. The hook and schema already understand `githubRepositoryUrl`, so the rest of the enrichment pipeline remains unchanged.

## Architecture Decisions

### Decision: Keep enrichment wiring in the form
**Choice**: Add the GitHub URL field directly to `JobDescriptionForm`.
**Alternatives considered**: Create a separate GitHub subform or move the field into the page container.
**Rationale**: The form already owns analysis submission state, so the optional field belongs there and keeps the change local.

### Decision: Reuse the existing request schema
**Choice**: Keep `JOB_ANALYSIS_REQUEST_SCHEMA` and `useJobAnalysis` unchanged.
**Alternatives considered**: Introduce a new request contract for GitHub enrichment.
**Rationale**: The request already supports the optional field and the enrichment logic already soft-fails; duplicating contracts would add churn.

### Decision: Preserve current result rendering
**Choice**: Leave `AnalysisResultView` and `github-client` behavior as-is.
**Alternatives considered**: Add new enrichment UI states or new mapping layers.
**Rationale**: The visible gap is input reachability, not result rendering.

## Data Flow

User types job description + optional GitHub URL -> `JobDescriptionForm` normalizes values -> submit payload reaches `useJobAnalysis` -> GitHub lookup runs only when URL is present -> analysis result renders with non-blocking warnings if enrichment fails.

    JobDescriptionForm ──→ useJobAnalysis ──→ GitHub client
           │                     │                  │
           └──── optional URL ───┴──── base result ─┘

## File Changes

| File | Action | Description |
|---|---|---|
| `src/features/analysis/components/JobDescriptionForm.tsx` | Modify | Add optional GitHub URL input and forward it on submit. |
| `src/features/analysis/components/JobDescriptionForm.test.tsx` | Modify | Add coverage for optional GitHub URL and submit behavior. |
| `src/test/factories/analysis.ts` | Modify | Keep request factory aligned with the optional URL field. |

## Interfaces / Contracts

```ts
interface JobDescriptionFormProps {
  errorMessage?: string | null;
  isPending: boolean;
  onSubmit: (request: {
    jobDescription: string;
    messageTone: JobAnalysisMessageTone;
    githubRepositoryUrl?: string;
  }) => void;
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Form submits payload correctly | `JobDescriptionForm.test.tsx` covers with/without GitHub URL and empty validation. |
| Integration | Existing enrichment path remains soft-failing | Existing analysis and GitHub tests continue to assert the non-blocking flow. |
| E2E | Optional input does not block analysis | Manual verification through the analysis page with and without a GitHub URL. |

## Migration / Rollout

No migration required.

## Open Questions

- [ ] None.