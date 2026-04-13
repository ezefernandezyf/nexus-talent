# Proposal: Module 08 - GitHub Stack Detection Completion

## Intent

El flujo de GitHub enrichment ya existe en el hook, schema y renderer, pero el usuario no puede activarlo desde el formulario. Esta change completa el punto de entrada visible para que la detección de stack sea realmente usable sin romper el análisis base.

## Scope

### In Scope
- Agregar un campo opcional de URL de GitHub en `src/features/analysis/components/JobDescriptionForm.tsx`.
- Pasar `githubRepositoryUrl` en el submit del análisis sin bloquear `jobDescription` ni `messageTone`.
- Ajustar tests del formulario para cubrir envío con y sin URL, y el bloqueo de submit vacío.

### Out of Scope
- Cambios en `src/lib/github-client.ts` o en la lógica de lookup.
- Nuevas fuentes de enriquecimiento o exportaciones adicionales.
- Cambios en el resultado final más allá de mostrar el enrichment ya soportado.

## Approach

Hacer el cambio de forma mínima: extender el formulario existente con un input opcional, normalizar su valor antes de enviar y conservar el soft-fail actual del análisis. El schema y el hook ya aceptan el campo, así que la implementación debe ser un wiring UI + tests.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/features/analysis/components/JobDescriptionForm.tsx` | Modified | Add optional GitHub URL input and pass it through submit payload. |
| `src/features/analysis/components/JobDescriptionForm.test.tsx` | Modified | Cover submit with URL, without URL, and empty validation. |
| `src/test/factories/analysis.ts` | Modified | Keep request factory aligned with optional `githubRepositoryUrl`. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| UI clutter in the form | Low | Reuse the existing field-surface and label-chip pattern. |
| Payload mismatch | Low | Align with `JOB_ANALYSIS_REQUEST_SCHEMA` and existing test factory. |
| Confusion with optional input | Low | Make helper copy explicit that GitHub URL is optional. |

## Rollback Plan

Revert the form field and its test updates in `JobDescriptionForm.tsx` and `JobDescriptionForm.test.tsx`. No backend or schema rollback is required.

## Dependencies

- Existing GitHub enrichment support in `src/lib/github-client.ts` and `src/features/analysis/hooks/useJobAnalysis.ts`.
- Existing `JOB_ANALYSIS_REQUEST_SCHEMA` in `src/schemas/job-analysis.ts`.

## Success Criteria

- [ ] The analysis form lets the user submit with or without a GitHub repository URL.
- [ ] The empty job-description validation still blocks submit.
- [ ] The submitted payload includes a trimmed GitHub URL when present.
- [ ] The existing GitHub enrichment result path remains non-blocking when the lookup fails.