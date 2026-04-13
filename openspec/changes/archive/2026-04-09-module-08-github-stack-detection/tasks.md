# Tasks: Module 08 - GitHub Stack Detection Completion

## Phase 1: Form Wiring
- [x] 1.1 Update `src/features/analysis/components/JobDescriptionForm.tsx` to render an optional GitHub repository URL input.
- [x] 1.2 Forward `githubRepositoryUrl` in the submit payload while keeping empty job-description validation intact.
- [x] 1.3 Keep helper copy explicit that the GitHub URL is optional.

## Phase 2: Test Coverage
- [x] 2.1 Update `src/features/analysis/components/JobDescriptionForm.test.tsx` to cover submit with a GitHub URL.
- [x] 2.2 Add coverage for submit without a GitHub URL and for empty submission blocking.
- [x] 2.3 Keep the request factory in `src/test/factories/analysis.ts` aligned with the optional URL field.

## Phase 3: Verification
- [x] 3.1 Run the focused analysis/form tests and confirm the new GitHub input path passes.
- [x] 3.2 Verify the existing GitHub enrichment flow still soft-fails when lookup is unavailable.

## Phase 4: Cleanup
- [x] 4.1 Review copy and spacing so the new field matches the existing analysis form style.
- [x] 4.2 Remove any temporary test scaffolding used during implementation.