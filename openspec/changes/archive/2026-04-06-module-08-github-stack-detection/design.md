# Design: Module 08 GitHub Stack Detection

## Technical Approach

Add optional GitHub enrichment on top of the existing analysis flow. The core job-analysis request stays the primary path; GitHub is an additive signal that enriches the result only when a repository URL is provided and the lookup succeeds.

The implementation should keep the UI thin: the form collects an optional GitHub URL, `useJobAnalysis` coordinates the parallel requests, a small GitHub client fetches public repo metadata, and a mapper converts repository signals into analysis-friendly stack labels. If GitHub fails, the user still gets the base analysis result.

## Architecture Decisions

| Decision | Choice | Alternatives considered | Rationale |
|---|---|---|---|
| Flow shape | Single augmented analysis result | Separate GitHub panel / second query path | Preserves one user flow and reuses history/export plumbing. |
| Failure handling | Soft-fail enrichment with warning state | Block the analysis on GitHub errors | Core analysis must remain usable even when GitHub is unavailable. |
| API boundary | Dedicated GitHub client + mapper | Fetch GitHub data directly in the UI | Keeps components simple and makes enrichment testable in isolation. |
| Result contract | Optional enrichment section on the analysis result | New screen for GitHub output | Backward-compatible and easier to render in the current result view. |

## Data Flow

```text
JobDescriptionForm
  -> jobDescription + optional GitHub URL
  -> useJobAnalysis
      -> core analysis request
      -> GitHub metadata fetch
      -> mapper normalizes stack signals
      -> merge successful enrichment into result
  -> AnalysisResultView renders base analysis + detected stack + warning state
```

GitHub enrichment should not delay or block the base job-analysis result. The hook can combine both promises and surface a partial result when only the analysis path succeeds.

## File Changes

| File | Action | Description |
|---|---|---|
| `src/features/analysis/components/JobDescriptionForm.tsx` | Modify | Add an optional GitHub repository URL input. |
| `src/features/analysis/components/AnalysisFeature.tsx` | Modify | Pass the GitHub URL into the analysis hook and render partial-state feedback. |
| `src/features/analysis/hooks/useJobAnalysis.ts` | Modify | Orchestrate core analysis plus GitHub enrichment. |
| `src/features/analysis/components/AnalysisResultView.tsx` | Modify | Render detected stack and GitHub warning state. |
| `src/schemas/job-analysis.ts` | Modify | Extend the result contract with optional enrichment data. |
| `src/lib/github-client.ts` | Create | Public GitHub REST client for repo metadata. |
| `src/features/analysis/utils/github-stack-mapper.ts` | Create | Normalize repo metadata into stack signals. |
| `src/features/analysis/**/__tests__` | Modify/Create | Cover form, hook, mapper, client, and result rendering. |

## Interfaces / Contracts

```ts
interface JobAnalysisRequest {
  jobDescription: string;
  githubRepositoryUrl?: string;
}

interface GitHubEnrichmentResult {
  repositoryUrl: string;
  detectedStack: Array<{ name: string; source: string }>;
  warningMessage?: string;
}
```

`JobAnalysisResult` should keep its current summary, skillGroups, and outreachMessage shape, with GitHub enrichment added as optional data so existing consumers stay compatible.

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Unit | GitHub metadata mapping | Validate language/topic normalization and empty-result handling. |
| Integration | Hook orchestration and partial failure behavior | Mock core analysis and GitHub client responses, assert base result survives failures. |
| UI | Form input and result rendering | RTL tests for optional URL input, detected stack section, and warning state. |

## Migration / Rollout

No migration required. The GitHub URL is optional and the core analysis path remains unchanged.

## Open Questions

- [ ] Should enrichment warnings be inline in the result view or shown as a dismissible banner?
- [ ] Do we want an optional token-based GitHub auth path in the first slice, or keep phase 1 public-only?