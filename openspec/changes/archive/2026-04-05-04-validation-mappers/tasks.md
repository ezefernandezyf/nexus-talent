# Tasks: 04 Validation & Mappers

## Phase 1: Red Tests / Boundary Cases

- [x] 1.1 Add `src/lib/mappers/job-analysis.test.ts` with dirty payload fixtures covering key stripping, field coercion, enum normalization, and missing optional fields.
- [x] 1.2 Add `src/lib/validation/job-analysis.test.ts` asserting strict acceptance/rejection for mapped payloads, including the schema-violation scenario.
- [x] 1.3 Extend `src/lib/ai-client.test.ts` and `src/lib/ai-provider.test.ts` with raw payload cases that fail until the new pipeline exists.

## Phase 2: Mapper / Validation Core

- [x] 2.1 Create `src/lib/mappers/job-analysis.ts` and `src/lib/mappers/index.ts` to normalize raw AI payloads into the canonical job-analysis shape.
- [x] 2.2 Create `src/lib/validation/job-analysis.ts` and `src/lib/validation/index.ts` to own the strict Zod domain schema and `validateJobAnalysisResult()`.
- [x] 2.3 Refactor `src/schemas/job-analysis.ts` so it only exports the strict domain contract and shared types needed by validation.

## Phase 3: Client / Provider Wiring

- [x] 3.1 Update `src/lib/ai-client.ts` to run transport output through `normalizeJobAnalysisResponse()` and then `validateJobAnalysisResult()` before returning.
- [x] 3.2 Update `src/lib/ai-provider.ts` to stop owning the duplicated Groq schema and instead consume the shared validation schema for request parsing/building.
- [x] 3.3 Adjust imports in `src/lib/ai-orchestrator.ts` or `src/features/analysis/hooks/useJobAnalysis.ts` only if the new module boundaries require it.

## Phase 4: Refine / Verify

- [x] 4.1 Remove now-duplicated parsing or schema constants from `src/lib/ai-client.ts` and `src/lib/ai-provider.ts` so the mapper/validation boundary stays single-purpose.
- [x] 4.2 Add or update assertions that the local fallback path and provider path both traverse the same normalize-then-validate flow in `src/lib/ai-client.test.ts`.