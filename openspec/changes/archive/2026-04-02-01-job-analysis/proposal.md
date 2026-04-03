# Proposal: 01 Job Analysis

## Intent

Transform raw job descriptions into actionable, structured data to help users quickly understand roles and craft targeted outreach. This reduces the manual effort of parsing dense text and identifying key technical requirements.

## Scope

### In Scope
- Text area input for pasting raw job descriptions.
- Zod 4 schemas defining the contract for the AI response (Summary, Skills Matrix, Outreach Message).
- Integration with the internal `ai-client` to orchestrate the LLM call.
- UI to display results using "The Precision Instrument" design system (e.g., Space Grotesk skill chips, Inter typography, layered surfaces).
- Robust UX states (Loading, Success, Error) with visual feedback.

### Out of Scope
- Persisting the analysis history to Supabase (planned for milestone 04).
- GitHub profile cross-referencing for stack detection (planned for milestone 07).

## Approach

We will build this within a new `features/analysis` module (Feature-based Domain Isolation). The data flow will be: `User Input -> Zod Validation -> ai-client -> LLM -> Zod Validation -> React UI`. We rely on TanStack Query to manage the server state (mutation) for the AI request. The UI will explicitly follow `DESIGN.md`—using Ghost Borders for the input, `surface-container` cards for results, and `label-sm` tech chips for the skills matrix.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/features/analysis/` | New | High-level feature module containing the UI and domain logic. |
| `src/lib/ai-client.ts` | Modified | Core orchestrator for the LLM call and Zod parsing (if not fully implemented). |
| `src/schemas/job-analysis.ts` | New | Zod schemas for AI prompt structure and response validation. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| LLM Hallucination/Schema Deviation | High | Enforce strict Zod parsing on the response. If it fails, catch the error and display a graceful "Glow Pulse" error state rather than crashing. |
| Slow Response Times | Medium | Implement an engaging loading state with clear feedback that the AI is processing the text. |

## Rollback Plan

If the feature introduces instability, revert the commits tied to the `features/analysis` integration and remove its route/entrypoint from the main application shell.

## Dependencies

- Existing implementation or skeleton of `ai-client`.
- Dependencies: `zod`, `@tanstack/react-query`, `react`, `tailwindcss`.

## Success Criteria

- [ ] A user can paste a job description and receive a valid Summary, Skills Matrix, and Outreach Message.
- [ ] The received data strictly passes the Zod schema validation.
- [ ] If the AI returns malformed JSON, the UI surfaces a user-friendly error state.