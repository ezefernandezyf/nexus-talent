## Exploration: 04 Validation & Mappers

### Current State
Nexus Talent already validates user input and AI output with Zod, but the validation flow is split across the hook, client, and provider layers. The AI provider also carries a JSON schema that mirrors Zod, and the local builder path assembles final domain data directly instead of passing through a dedicated mapper layer.

### Affected Areas
- `src/schemas/job-analysis.ts` — current domain schema, but no intermediate AI response model.
- `src/lib/ai-client.ts` — output normalization and final validation boundary.
- `src/lib/ai-provider.ts` — provider JSON schema duplicates the Zod contract.
- `src/features/analysis/hooks/useJobAnalysis.ts` — input validation boundary.
- `src/features/analysis/components/AnalysisResultView.tsx` — consumes validated domain data.
- `src/lib/ai-orchestrator.ts` — upstream source of AI responses that will feed mappers.
- `src/schemas/job-analysis.test.ts` and `src/lib/ai-client.test.ts` — current tests do not cover coercion and partial-response edge cases.

### Approaches
1. **Centralized mapper layer** — add `src/lib/mappers/` and `src/lib/validation/` to separate transport normalization from domain validation.
   - Pros: single source of truth, reusable across future features, clearer boundaries, easier testing.
   - Cons: introduces new folders and a small amount of indirection.
   - Effort: Medium.

2. **Feature-local incremental cleanup** — keep validation inside the analysis feature and only extract minimal helpers.
   - Pros: smaller immediate change, less file movement.
   - Cons: keeps duplication, harder to reuse in persistence/history/integrations, scales poorly.
   - Effort: Low.

### Recommendation
Use a centralized mapper layer with thin validation modules. Keep Zod as the domain contract, but introduce a transformation step that normalizes AI/provider payloads before validation. This best matches the validation-first architecture and keeps later phases from re-implementing the same mapping logic.

### Risks
- Schema drift between provider payloads and domain models if the mapper and Zod schema evolve separately.
- Overengineering if the mapper layer becomes a generic abstraction instead of a thin transformation boundary.
- Hidden test gaps around coercion, enum normalization, and partial payloads if coverage stays focused only on happy paths.

### Ready for Proposal
Yes. The next step should be `sdd-propose` for `04 Validation & Mappers`, with the centralized mapper layer as the default direction.