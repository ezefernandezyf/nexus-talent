# Proposal: Phase 1 Polish

## Intent

Clean up four inconsistencies and low-quality signals from the Phase 1 codebase: unused GitHub field, weak JD validation, wrong dash characters, and redundant eyebrow labels. These don't affect functionality but hurt UX polish and code hygiene.

## Scope

### In Scope
- Remove GitHub repository URL from analysis form, schema, and factory
- Tighten JD minimum validation from 1 to 30 characters with Spanish error message
- Replace em dashes (—) with en dashes (–) across 18 user-facing occurrences
- Remove `<Eyebrow>` component usage from Settings and CV pages

### Out of Scope
- Removing the Eyebrow component itself — other pages may still use it
- Redesigning the analysis form layout after removing GitHub field
- Adding new features or validation rules
- Em dash replacement in code comments (already use hyphens per spec)

## Capabilities

### New Capabilities
None — this phase removes and polishes, it doesn't introduce new capabilities.

### Modified Capabilities
- `analysis`: Remove "Optional GitHub repository URL input" requirement. Delete related requirement block and all 3 scenarios from spec. UI form no longer exposes the field, schema no longer accepts it.
- `shared-contracts`: Remove `githubRepositoryUrl` from `analysisRequestSchema` (REQ-AI-012). Update field list: `jobDescription` + `messageTone` only.

## Approach

1. **GitHub URL removal** — cascade through form component, feature page, hook, schema (both web + shared), test, and factory. Remove prop threading `initialGithubRepositoryUrl` and `githubEnrichment`. Simplify `normalizeSubmission` to drop `githubClient` param.
2. **JD min validation** — two schema changes (`shared` + `web` schemas) and one UI message change in `JobDescriptionForm.tsx`. Shared contract change first, then web.
3. **Em dash replacement** — targeted find-and-replace. 18 occurrences: settings help text, CV narrative, experience/education date ranges, and error messages. Code comments use `sed` for hyphens.
4. **Eyebrow removal** — delete the `<Eyebrow>` lines from `SettingsPage.tsx:16` and `CVPage.tsx:79`. The `<h1>` headings remain.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `web/src/features/analysis/` | Modified | Form, hook, page, schemas, test — remove GitHub URL |
| `shared/src/schemas.ts` | Modified | Remove `githubRepositoryUrl` from analysis request |
| `web/src/features/settings/pages/SettingsPage.tsx` | Modified | Remove `<Eyebrow>Configuración</Eyebrow>` |
| `web/src/features/cv/pages/CVPage.tsx` | Modified | Remove `<Eyebrow>CV</Eyebrow>` |
| `web/src/` (various) | Modified | Em dash → en dash in 18 user-facing strings |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Missed GitHub URL reference in tests or mocks | Low | Grep for `githubRepositoryUrl` and `GitHub` after code changes |
| Em dash replacement misses edge-case occurrences | Low | Grep for `—` across `web/src/` and `shared/src/` |
| Broken import after removing `githubClient` | Low | TypeScript compiler catches unused imports |

## Rollback Plan

Each change is an independent `git revert` on its commit. No migrations, no data loss. If deployed, redeploy the reverted commit.

## Dependencies

None — all changes are self-contained within the monorepo.

## Success Criteria

- [ ] `analysisRequestSchema` no longer accepts `githubRepositoryUrl`
- [ ] Analysis form submits without GitHub field; no console errors
- [ ] JD field blocks submission under 30 chars with Spanish error message
- [ ] Zero em dashes (—) remaining in user-facing strings
- [ ] Settings and CV pages render without `<Eyebrow>`
- [ ] `pnpm test` passes across all packages
- [ ] `tsc --noEmit` passes with no errors
