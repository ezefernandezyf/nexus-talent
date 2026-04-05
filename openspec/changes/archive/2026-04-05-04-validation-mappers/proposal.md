# Proposal: 04 Validation & Mappers

## Intent
Transform the loosely validated, duplicated AI responses into a centralized, rigorously validated domain contract, separating transport normalization from strict domain validation to support future features like history and export.

## Scope

### In Scope
- Centralized mapper layer (`src/lib/mappers/`) for AI payload transformation
- Thin validation modules (`src/lib/validation/`) enforcing Zod domain contracts
- Update `src/lib/ai-client.ts` to consume the new mapping and validation layers
- Add rigorous unit tests for coercion, enum normalization, and partial payloads

### Out of Scope
- Modifying UI components beyond consuming the updated models
- Changing the underlying AI provider logic or prompt tuning

## Approach
Use a centralized mapper layer with thin validation modules in `src/lib/mappers/` and `src/lib/validation/`. Keep Zod as the strict domain contract, but introduce a pure-function transformation step that normalizes AI/provider payloads before validation, ensuring the application domain only ever receives safe, fully-mapped data.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/schemas/job-analysis.ts` | Modified | Update to act purely as the strict domain contract |
| `src/lib/ai-client.ts` | Modified | Delegate transformation and validation to new modules |
| `src/lib/mappers/` | New | Centralized transformation logic for AI payloads |
| `src/lib/validation/` | New | Centralized validation execution using Zod |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Schema drift between AI payloads and models | Medium | Extensive unit tests covering coercion and partial edge cases |
| Overengineering the mapper layer | Low | Keep mappers strictly as thin, pure boundary transformations |

## Rollback Plan
Revert changes to `src/lib/ai-client.ts` and `src/schemas/job-analysis.ts` to their previous commits, and delete the newly created `src/lib/mappers/` and `src/lib/validation/` modules.

## Dependencies
- Phase 02 AI Service / Orchestrator (already implemented)

## Success Criteria
- [ ] AI payloads are explicitly transformed and validated before entering the domain layer.
- [ ] Zero Zod schema duplication between API boundaries and domain models.
- [ ] >90% test coverage for mapping edge cases (coercion, missing fields, dirty payloads).