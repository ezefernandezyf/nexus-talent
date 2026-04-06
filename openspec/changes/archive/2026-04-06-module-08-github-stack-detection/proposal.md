# Proposal: module-08-github-stack-detection

## Intent

Add optional GitHub stack enrichment to the analysis flow so Nexus Talent can surface repository-derived signals alongside the existing job-description analysis. The core analysis must keep working even if GitHub is unavailable.

## Scope

### In Scope
- Optional GitHub repository URL input in the analysis flow.
- Enrichment of the analysis result with detected stack signals.
- UI rendering for the detected stack when enrichment succeeds.

### Out of Scope
- Private repo support.
- Commits, pull requests, stars, or activity analytics.
- Multi-repo comparison or persistent GitHub caching.

## Approach

Use augmented analysis: accept an optional GitHub URL, fetch public repo metadata in parallel with the existing analysis, and merge the GitHub-derived signals into the result only when the fetch succeeds. GitHub failure must not block the job-analysis output.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/features/analysis/components/JobDescriptionForm.tsx` | Modified | Add optional GitHub URL input |
| `src/features/analysis/hooks/useJobAnalysis.ts` | Modified | Pass GitHub data into the analysis flow |
| `src/features/analysis/components/AnalysisResultView.tsx` | Modified | Render detected stack when available |
| `src/schemas/job-analysis.ts` | Modified | Extend the result contract for enrichment |
| `src/lib/github-client.ts` | New | Fetch public repo metadata |
| `src/features/analysis/utils/github-stack-mapper.ts` | New | Map repo signals to stack labels |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| GitHub rate limits | Medium | Keep enrichment optional and fail soft |
| Inaccessible repos | Medium | Public-only first, clear warning state |
| Mapping errors | Medium | Constrain the initial mapping surface |

## Rollback Plan

Remove the GitHub URL input, enrichment client, and detected stack rendering while leaving the base analysis flow unchanged.

## Dependencies

- GitHub public REST APIs.
- Existing analysis result and form plumbing.

## Success Criteria

- [x] Users can optionally supply a GitHub repository URL.
- [x] Successful enrichment surfaces a detected stack in the result.
- [x] GitHub failures do not block the core analysis result.