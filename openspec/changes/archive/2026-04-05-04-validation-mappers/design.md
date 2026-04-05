# Design: 04 Validation & Mappers

## Technical Approach

Introduce a thin anti-corruption layer between AI/provider payloads and the domain result. The client will first normalize raw transport output in `src/lib/mappers/`, then validate the normalized object through `src/lib/validation/`, and only then return a `JobAnalysisResult`. `src/schemas/job-analysis.ts` remains the domain contract for the final shape, while provider-specific parsing stays outside the domain.

## Architecture Decisions

| Decision | Choice | Alternatives | Rationale |
|---|---|---|---|
| Mapper boundary | Add `normalizeJobAnalysisResponse(raw)` in `src/lib/mappers/job-analysis.ts` | Parse raw payload directly into Zod; keep implicit normalization in `ai-client.ts` | Keeps transport quirks isolated and makes dirty/partial AI payload handling testable in one place. |
| Validation boundary | Add `validateJobAnalysisResult()` in `src/lib/validation/job-analysis.ts` backed by `JOB_ANALYSIS_RESULT_SCHEMA` | Validate in hook or provider; duplicate schemas in provider | Centralizes domain validation and avoids scattering error handling across UI and transport. |
| Provider contract | `src/lib/ai-provider.ts` only parses Groq envelopes and returns raw JSON-ish payloads; request schema is sourced from the same validation module | Keep `GROQ_JOB_ANALYSIS_JSON_SCHEMA` inline | Prevents schema drift between prompt/request shape and domain rules. |

## Data Flow

```text
useJobAnalysis
  -> ai-client (input schema)
  -> ai-orchestrator
  -> ai-provider.parseResponse()
  -> mappers.normalizeJobAnalysisResponse()
  -> validation.validateJobAnalysisResult()
  -> JobAnalysisResult
```

The local fallback transport follows the same path so provider and fallback behavior stay identical.

## File Changes

| File | Action | Description |
|---|---|---|
| `src/lib/mappers/job-analysis.ts` | Create | Pure normalization functions and raw/normalized payload types for AI responses. |
| `src/lib/mappers/index.ts` | Create | Barrel exports for mapper utilities. |
| `src/lib/validation/job-analysis.ts` | Create | Validation helpers and the authoritative domain schema exports used by client/provider. |
| `src/lib/validation/index.ts` | Create | Barrel exports for validation helpers. |
| `src/schemas/job-analysis.ts` | Modify | Keep the domain shapes strict and reusable by the validation layer. |
| `src/lib/ai-client.ts` | Modify | Replace direct `JSON.parse` -> Zod flow with mapper + validation pipeline. |
| `src/lib/ai-provider.ts` | Modify | Remove duplicated hard-coded domain schema ownership; return raw parsed payloads only. |
| `src/features/analysis/hooks/useJobAnalysis.ts` | Modify | No behavior change expected; remain input-validation only and keep error surfacing thin. |

## Interfaces / Contracts

```ts
export interface RawJobAnalysisPayload {
  summary?: unknown;
  skillGroups?: unknown;
  outreachMessage?: unknown;
  [key: string]: unknown;
}

export interface NormalizedJobAnalysisPayload {
  summary: string;
  skillGroups: Array<{ category: string; skills: Array<{ name: string; level: JobAnalysisSkillLevel }> }>;
  outreachMessage: { subject: string; body: string };
}

export function normalizeJobAnalysisResponse(raw: unknown): NormalizedJobAnalysisPayload;
export function validateJobAnalysisResult(payload: unknown): JobAnalysisResult;
```

Normalization is responsible for trimming, dropping unknown keys, coercing transport variants into the canonical shape, and supplying safe structural defaults where the spec allows it. Validation is responsible for rejecting anything that still violates the domain contract.

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Unit | Mapper coercion, key stripping, enum normalization, missing partial fields | New mapper tests with dirty payload fixtures and explicit edge cases. |
| Unit | Domain validation success/failure | New validation tests around strict schema acceptance and rejection. |
| Integration | End-to-end client flow from transport raw payload to validated result | Extend `ai-client.test.ts` with raw object/string payloads and invalid intermediate shapes. |
| Integration | Local fallback parity | Verify fallback transport and provider transport both traverse the same normalize/validate pipeline. |

## Migration / Rollout

No migration required. This is an internal refactor with no persisted data or public API change. Rollback is a straight revert of the client/provider imports plus deletion of the new mapper and validation modules.

## Open Questions

None. The remaining implementation detail is mechanical: wire the new modules into the existing client/provider flow and cover the edge cases with tests.